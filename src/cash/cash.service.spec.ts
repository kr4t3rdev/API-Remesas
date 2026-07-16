import { CashService } from './cash.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { ConflictException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCashClosingDto } from './dto/create-cash-closing.dto';

describe('CashService', () => {
  it('builds a currency-aware overview from cash sources', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          primaryCurrency: { id: 1, code: 'CUP', name: 'Peso cubano', symbol: '$', isActive: true },
        }),
      },
      currency: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1, code: 'CUP', name: 'Peso cubano', symbol: '$', isActive: true },
          { id: 2, code: 'USD', name: 'Dólar', symbol: 'US$', isActive: true },
        ]),
      },
      cashBalance: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 10,
            currencyId: 1,
            balance: { toString: () => '1500.50' },
            currency: { id: 1, code: 'CUP', name: 'Peso cubano', symbol: '$', isActive: true },
          },
        ]),
      },
      transaction: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 20,
            operationKind: 'REMITTANCE',
            type: 'VENTA',
            amount: { toString: () => '10' },
            totalCup: { toString: () => '2400' },
            currency: { id: 2, code: 'USD', name: 'Dólar', symbol: 'US$', isActive: true },
            createdAt: new Date('2026-07-11T12:00:00.000Z'),
          },
        ]),
      },
      cashAdjustment: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 30,
            type: 'INGRESO',
            amount: { toString: () => '100' },
            reason: 'Depósito inicial',
            currency: { id: 1, code: 'CUP', name: 'Peso cubano', symbol: '$', isActive: true },
            createdAt: new Date('2026-07-11T11:00:00.000Z'),
          },
        ]),
      },
      cashAudit: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 40,
            currencyId: 1,
            expectedBalance: { toString: () => '1400' },
            actualBalance: { toString: () => '1500' },
            difference: { toString: () => '100' },
            notes: 'Revisión',
            currency: { id: 1, code: 'CUP', name: 'Peso cubano', symbol: '$', isActive: true },
            createdAt: new Date('2026-07-11T10:00:00.000Z'),
          },
        ]),
      },
      bankAccount: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const service = new CashService(prisma as unknown as PrismaService);
    const result = await service.getOverview(7);

    expect(result.primaryCurrency?.code).toBe('CUP');
    expect(result.currencies).toHaveLength(2);
    expect(result.balances[0].balance).toBe(1500.5);
    expect(result.recentMovements).toEqual([
      expect.objectContaining({
        id: 'transaction:20',
        kind: 'TRANSACTION',
        direction: 'IN',
        totalBase: 2400,
        operationKind: 'REMITTANCE',
      }),
      expect.objectContaining({
        id: 'adjustment:30',
        kind: 'ADJUSTMENT',
        direction: 'IN',
        amount: 100,
      }),
    ]);
    expect(result.latestAudits[0]).toEqual(
      expect.objectContaining({
        expectedBalance: 1400,
        actualBalance: 1500,
        difference: 100,
        auditorName: undefined,
      }),
    );
  });

  it('includes FX transfers in the cash history with only the cash leg', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ primaryCurrency: null }) },
      currency: { findMany: jest.fn().mockResolvedValue([]) },
      cashBalance: { findMany: jest.fn().mockResolvedValue([]) },
      transaction: { findMany: jest.fn().mockResolvedValue([{
        id: 21, userId: 7, type: 'COMPRA', amount: { toString: () => '10' }, totalCup: { toString: () => '2400' }, rate: { toString: () => '240' },
        currency: { id: 2, code: 'USD' }, sourceType: 'CASH', destinationType: 'BANK_ACCOUNT', destinationBankAccountId: 4,
        createdAt: new Date('2026-07-12T12:00:00.000Z'),
      }]) },
      cashAdjustment: { findMany: jest.fn().mockResolvedValue([]) },
      cashAudit: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const result = await new CashService(prisma as unknown as PrismaService).getOverview(7);
    expect(result.recentMovements).toEqual([expect.objectContaining({
      id: 'transaction:21', kind: 'TRANSACTION', direction: 'OUT', amount: 10, cashAmount: 2400,
      sourceType: 'CASH', destinationType: 'BANK_ACCOUNT', destinationBankAccountId: 4,
    })]);
  });

  it('uses the real cash leg direction and excludes bank-to-bank transfers', async () => {
    const transactionFindMany = jest.fn().mockResolvedValue([
      { id: 22, type: 'VENTA', amount: { toString: () => '10' }, totalCup: { toString: () => '2400' }, currency: { code: 'USD' }, sourceType: 'BANK_ACCOUNT', destinationType: 'CASH', createdAt: new Date() },
    ]);
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ primaryCurrency: null }) }, currency: { findMany: jest.fn().mockResolvedValue([]) }, cashBalance: { findMany: jest.fn().mockResolvedValue([]) },
      transaction: { findMany: transactionFindMany }, cashAdjustment: { findMany: jest.fn().mockResolvedValue([]) }, cashAudit: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const result = await new CashService(prisma as unknown as PrismaService).getOverview(7);
    expect(transactionFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 7, OR: [{ sourceType: 'CASH' }, { destinationType: 'CASH' }] } }));
    expect(result.recentMovements[0]).toEqual(expect.objectContaining({ direction: 'IN', cashAmount: 2400 }));
  });

  it('updates a non-negative policy for an active currency', async () => {
    const prisma = {
      currency: { findFirst: jest.fn().mockResolvedValue({ id: 2, code: 'USD', isActive: true }) },
      cashPolicy: {
        upsert: jest.fn().mockResolvedValue({
          id: 1,
          userId: 7,
          currencyId: 2,
          safetyBuffer: { toString: () => '10.50' },
          insuranceLimit: { toString: () => '1000' },
          currency: { id: 2, code: 'USD' },
        }),
      },
    };

    const result = await new CashService(prisma as unknown as PrismaService).updatePolicy(7, 2, {
      safetyBuffer: 10.5,
      insuranceLimit: 1000,
    });

    expect(prisma.cashPolicy.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_currencyId: { userId: 7, currencyId: 2 } },
    }));
    expect(result.safetyBuffer).toBe(10.5);
    expect(result.insuranceLimit).toBe(1000);
  });

  it('scopes available auditors to the authenticated user', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: 7, name: 'Ana' }]);
    const service = new CashService({ user: { findMany } } as unknown as PrismaService);

    await expect(service.getAuditors(7)).resolves.toEqual([{ id: 7, name: 'Ana' }]);
    expect(findMany).toHaveBeenCalledWith({
      where: { id: 7, isActive: true },
      select: { id: true, name: true },
    });
  });

  it('creates an idempotent daily closing using the balance inside a transaction', async () => {
    const transaction = jest.fn(async (callback) => callback({
      currency: { findFirst: jest.fn().mockResolvedValue({ id: 1, code: 'CUP', isActive: true }) },
      cashBalance: { findUnique: jest.fn().mockResolvedValue({ balance: { toString: () => '1500.50' } }) },
      cashClosing: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 9,
          expectedBalance: { toString: () => '1500.50' },
          actualBalance: { toString: () => '1490' },
          difference: { toString: () => '-10.50' },
          status: 'CLOSED',
          businessDate: new Date('2026-07-11T00:00:00.000Z'),
          currency: { id: 1, code: 'CUP' },
          closedBy: { id: 7, name: 'Ana' },
        }),
      },
    }));
    const service = new CashService({ $transaction: transaction } as unknown as PrismaService);

    const result = await service.createClosing(7, {
      currencyId: 1,
      businessDate: '2026-07-11',
      actualBalance: 1490,
    });

    expect(transaction).toHaveBeenCalled();
    expect(result.difference).toBe(-10.5);
  });

  it('returns the existing closing only when the payload is identical', async () => {
    const existing = {
      id: 9,
      actualBalance: { toString: () => '1490' },
      notes: 'same',
      expectedBalance: { toString: () => '1500.50' },
      difference: { toString: () => '-10.50' },
      currency: { id: 1, code: 'CUP' },
      closedBy: { id: 7, name: 'Ana' },
    };
    const transaction = jest.fn(async (callback) => callback({
      currency: { findFirst: jest.fn().mockResolvedValue({ id: 1, isActive: true }) },
      cashBalance: { findUnique: jest.fn().mockResolvedValue({ balance: { toString: () => '1500.50' } }) },
      cashClosing: { findUnique: jest.fn().mockResolvedValue(existing), create: jest.fn() },
    }));

    const result = await new CashService({ $transaction: transaction } as unknown as PrismaService).createClosing(7, {
      currencyId: 1, businessDate: '2026-07-11', actualBalance: 1490, notes: 'same',
    });

    expect(result.id).toBe(9);
    expect(transaction.mock.calls[0][0]).toBeDefined();
  });

  it('rejects a duplicate closing when the payload differs', async () => {
    const transaction = jest.fn(async (callback) => callback({
      currency: { findFirst: jest.fn().mockResolvedValue({ id: 1, isActive: true }) },
      cashBalance: { findUnique: jest.fn().mockResolvedValue({ balance: { toString: () => '1500.50' } }) },
      cashClosing: { findUnique: jest.fn().mockResolvedValue({
        id: 9, actualBalance: { toString: () => '1490' }, notes: 'old',
        expectedBalance: { toString: () => '1500.50' }, difference: { toString: () => '-10.50' },
        currency: { id: 1, code: 'CUP' }, closedBy: { id: 7, name: 'Ana' },
      }) },
    }));

    await expect(new CashService({ $transaction: transaction } as unknown as PrismaService).createClosing(7, {
      currencyId: 1, businessDate: '2026-07-11', actualBalance: 1491, notes: 'new',
    })).rejects.toBeInstanceOf(ConflictException);
  });

  it('accepts only calendar dates in the closing DTO', async () => {
    const valid = await validate(plainToInstance(CreateCashClosingDto, {
      currencyId: 1, businessDate: '2026-07-11', actualBalance: 10,
    }));
    const invalid = await validate(plainToInstance(CreateCashClosingDto, {
      currencyId: 1, businessDate: '2026-07-11T12:00:00.000Z', actualBalance: 10,
    }));

    expect(valid).toHaveLength(0);
    expect(invalid.some((error) => error.property === 'businessDate')).toBe(true);
  });

  it('converts balances through CUP without inventing missing rates', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ primaryCurrencyId: 2 }) },
      currency: { findFirst: jest.fn().mockResolvedValue({ id: 1, code: 'CUP', name: 'Peso' }) },
      cashBalance: { findMany: jest.fn().mockResolvedValue([
        { currencyId: 1, balance: { toString: () => '1000' }, currency: { id: 1, code: 'CUP', name: 'Peso' } },
        { currencyId: 3, balance: { toString: () => '10' }, currency: { id: 3, code: 'EUR', name: 'Euro' } },
      ]) },
      exchangeRate: { findMany: jest.fn().mockResolvedValue([
        { currencyId: 2, referenceRate: { toString: () => '200' }, currency: { id: 2, code: 'USD', name: 'Dólar' } },
      ]) },
    };

    const result = await new CashService(prisma as unknown as PrismaService).getValuation(7, 2);

    expect(result.total).toBe(5);
    expect(result.missingRates).toEqual(['EUR']);
    expect(result.breakdown[0]).toEqual(expect.objectContaining({ currencyCode: 'CUP', convertedAmount: 5 }));
    expect(result.breakdown[1]).toEqual(expect.objectContaining({ currencyCode: 'EUR', convertedAmount: null }));
  });
});
