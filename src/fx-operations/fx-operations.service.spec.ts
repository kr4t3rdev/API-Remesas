import { Decimal } from '@prisma/client/runtime/library';
import { FxOperationsService } from './fx-operations.service';
import {
  calculateWeightedAveragePurchase,
  calculateSaleSnapshot,
} from './domain/position-calculator';
import { CurrencyPositionUnavailableError, InsufficientSaldoError, InvalidRateError } from './domain/domain-errors';
import { calculatePersistedRate } from './fx-operations.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFxTransferDto } from './dto/create-fx-transfer.dto';

describe('FX operations foundation', () => {
  it('enforces database-compatible amount and rate precision at the API boundary', async () => {
    const dto = plainToInstance(CreateFxTransferDto, { type: 'COMPRA', currencyId: 2, amount: 10.123, rate: 260.12345 });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(expect.arrayContaining(['amount', 'rate']));
  });

  it.each([
    [{ id: 2, code: 'USD', isActive: false }, { id: 1, code: 'CUP', isActive: true }],
    [{ id: 1, code: 'CUP', isActive: true }, { id: 1, code: 'CUP', isActive: true }],
  ])('rejects an inactive or CUP currency as the FX divisa', async (divisa, cup) => {
    const prisma = { currency: { findUnique: jest.fn().mockResolvedValueOnce(divisa).mockResolvedValueOnce(cup) } } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260 }))
      .rejects.toThrow('Active non-CUP FX currency not found');
  });
  it('derives the selected side margin while preserving the reference rate', () => {
    expect(calculatePersistedRate('COMPRA' as any, new Decimal(250), new Decimal(200)).margin.toString()).toBe('0.2');
    expect(calculatePersistedRate('VENTA' as any, new Decimal(250), new Decimal(300)).margin.toString()).toBe('0.2');
  });

  it('rejects an active rate whose derived margin cannot be stored', () => {
    expect(() => calculatePersistedRate('COMPRA' as any, new Decimal(100), new Decimal(1100))).toThrow(InvalidRateError);
  });

  it('rounds a reasonable active-rate margin and exposes the effective persisted rate', () => {
    const result = calculatePersistedRate('COMPRA' as any, new Decimal(300), new Decimal(260));
    expect(result.margin.toString()).toBe('0.1333');
    expect(result.effectiveRate.toString()).toBe('260.01');
  });

  it('returns the existing transfer for a repeated user-scoped idempotency key', async () => {
    const existing = { id: 11, userId: 7, idempotencyKey: 'fx-123', fxMovements: [{ id: 12 }] };
    const prisma = {
      transaction: { findUnique: jest.fn().mockResolvedValue(existing) },
      currency: { findUnique: jest.fn().mockResolvedValue({ id: 2 }) },
      $transaction: jest.fn(),
    } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 50, rate: 260,
    }, 'fx-123')).resolves.toEqual({ transaction: existing, movement: existing.fxMovements[0] });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('rejects reuse of a key for a different transfer intent', async () => {
    const existing = { id: 11, userId: 7, idempotencyKey: 'fx-123', type: 'COMPRA', currencyId: 2, amount: 50, rate: 260, notes: null, fxMovements: [{ id: 12 }] };
    const prisma = { transaction: { findUnique: jest.fn().mockResolvedValue(existing) }, currency: { findUnique: jest.fn() }, $transaction: jest.fn() } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'VENTA' as any, currencyId: 2, amount: 50, rate: 260 }, 'fx-123'))
      .rejects.toThrow('Idempotency key was already used for a different transfer');
  });
  it('includes operation kind and rate persistence in idempotency intent', async () => {
    const existing = { id: 11, userId: 7, type: 'COMPRA', currencyId: 2, amount: 50, rate: 260, notes: null, operationKind: 'TRANSFER', persistRate: false, sourceType: 'CASH', destinationType: 'CASH', fxMovements: [] };
    const prisma = { transaction: { findUnique: jest.fn().mockResolvedValue(existing) } } as any;

    await expect(new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 50, rate: 260,
      operationKind: 'REMITTANCE' as any, persistRate: false,
    }, 'fx-kind')).rejects.toThrow('Idempotency key was already used for a different transfer');
  });
  it('classifies a manual remittance and persists only the selected active-rate side atomically', async () => {
    const createTransaction = jest.fn().mockImplementation(({ data }) => ({ id: 11, ...data }));
    const updateRate = jest.fn().mockResolvedValue({});
    const createRateHistory = jest.fn().mockResolvedValue({});
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: {
          findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(250), buyMargin: new Decimal(0.1), sellMargin: new Decimal(0.2) }),
          update: updateRate,
        },
        rateHistory: { create: createRateHistory },
        currencyPosition: {
          findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'REVIEWED', reviewedAt: new Date() }),
          update: jest.fn().mockResolvedValue({}),
        },
        transaction: { create: createTransaction },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 1 }), upsert: jest.fn().mockResolvedValue({}) },
      })),
    } as any;

    await new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 200,
      operationKind: 'REMITTANCE' as any, persistRate: true,
    });

    expect(createTransaction).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ operationKind: 'REMITTANCE', persistRate: true }) }));
    expect(updateRate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ buyMargin: new Decimal(0.2) }) }));
    expect(updateRate.mock.calls[0][0].data).not.toHaveProperty('sellMargin');
    expect(createRateHistory).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ referenceType: 'FX_TRANSACTION', referenceId: 11 }) }));
  });
  it('does not replay a different intent after a concurrent unique-key race', async () => {
    const raced = { id: 11, userId: 7, idempotencyKey: 'fx-race', type: 'COMPRA', currencyId: 2, amount: new Decimal(50), rate: new Decimal(260), notes: null, fxMovements: [{ id: 12 }] };
    const prisma = {
      transaction: { findUnique: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(raced) },
      currency: { findUnique: jest.fn().mockResolvedValueOnce({ id: 2, code: 'USD', isActive: true }).mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn().mockRejectedValue(new (require('@prisma/client').Prisma.PrismaClientKnownRequestError)('duplicate', { code: 'P2002', clientVersion: '5.8.1' })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'VENTA' as any, currencyId: 2, amount: 50, rate: 260 }, 'fx-race'))
      .rejects.toThrow('Idempotency key was already used for a different transfer');
  });
  it('calculates the weighted-average purchase cost', () => {
    expect(calculateWeightedAveragePurchase(new Decimal(100), new Decimal(250), new Decimal(50), new Decimal(260)).toFixed(2)).toBe('253.33');
  });

  it('keeps a sale cost snapshot and calculates realized performance', () => {
    const result = calculateSaleSnapshot(new Decimal(150), new Decimal(253.33), new Decimal(50), new Decimal(270));

    expect(result.remainingSaldo.toFixed(2)).toBe('100.00');
    expect(result.costSnapshot.toFixed(2)).toBe('253.33');
    expect(result.realizedProfit.toFixed(2)).toBe('833.50');
  });

  it('rejects an unreviewed position for sale', () => {
    expect(() =>
      FxOperationsService.assertSaleAvailable({ saldo: new Decimal(100), reviewStatus: 'UNREVIEWED' }, new Decimal(10)),
    ).toThrow(CurrencyPositionUnavailableError);
  });

  it('rejects a sale above available saldo without changing state', () => {
    expect(() =>
      FxOperationsService.assertSaleAvailable({ saldo: new Decimal(20), reviewStatus: 'REVIEWED' }, new Decimal(25)),
    ).toThrow(InsufficientSaldoError);
  });

  it('does not make a historical unreviewed saldo saleable when a purchase is attempted', async () => {
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(260), buyMargin: new Decimal(0), sellMargin: new Decimal(0) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(100), costoPromedio: new Decimal(250), reviewStatus: 'UNREVIEWED', reviewedAt: null }) },
      })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260 }))
      .rejects.toThrow(CurrencyPositionUnavailableError);
  });

  it('executes the transaction callback and rolls back canonical and legacy writes', async () => {
    const state = { transactions: [] as unknown[], movements: [] as unknown[], positions: [{ id: 1, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'UNREVIEWED', reviewedAt: null }], cash: [] as unknown[] };
    const snapshot = () => ({ transactions: [...state.transactions], movements: [...state.movements], positions: state.positions.map((position) => ({ ...position })), cash: [...state.cash] });
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => {
        const before = snapshot();
        try {
          return await callback({
            exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(260), buyMargin: new Decimal(0), sellMargin: new Decimal(0) }) },
            currencyPosition: {
              findUnique: jest.fn().mockResolvedValue(state.positions[0]),
              update: jest.fn(async ({ data }: any) => Object.assign(state.positions[0], data)),
            },
            transaction: { create: jest.fn(async ({ data }: any) => { const value = { id: 11, ...data }; state.transactions.push(value); return value; }) },
            currencyMovement: { create: jest.fn(async ({ data }: any) => { const value = { id: 12, ...data }; state.movements.push(value); return value; }) },
            cashBalance: { upsert: jest.fn(async ({ data }: any) => { state.cash.push(data); if (state.cash.length === 2) throw new Error('legacy write failed'); }) },
          });
        } catch (error) {
          state.transactions = before.transactions;
          state.movements = before.movements;
          state.positions = before.positions;
          state.cash = before.cash;
          throw error;
        }
      }),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 50, rate: 260 })).rejects.toThrow('legacy write failed');
    expect(state.transactions).toHaveLength(0);
    expect(state.movements).toHaveLength(0);
    expect(state.cash).toHaveLength(0);
    expect(state.positions[0].saldo).toEqual(new Decimal(0));
  });

  it('rolls back legacy and canonical writes when one write fails', async () => {
    const transaction = jest.fn().mockRejectedValue(new Error('legacy write failed'));
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: transaction,
    } as any;
    const service = new FxOperationsService(prisma);

    await expect(service.createTransfer(7, {
      type: 'COMPRA' as any,
      currencyId: 2,
      amount: 50,
      rate: 260,
    })).rejects.toThrow('legacy write failed');
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('routes purchase legs through selected bank accounts', async () => {
    const bankUpdates: any[] = [];
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(260), buyMargin: new Decimal(0), sellMargin: new Decimal(0) }) },
        currencyPosition: {
          findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'UNREVIEWED', reviewedAt: null }),
          update: jest.fn().mockResolvedValue({}),
        },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) },
        currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        bankAccount: {
          findFirst: jest.fn()
            .mockResolvedValueOnce({ id: 3, userId: 7, currencyId: 1, isActive: true, balance: new Decimal(10000) })
            .mockResolvedValueOnce({ id: 4, userId: 7, currencyId: 2, isActive: true, balance: new Decimal(0) }),
          updateMany: jest.fn(async (args: any) => { bankUpdates.push(args); return { count: 1 }; }),
        },
        cashBalance: { upsert: jest.fn() },
      })),
    } as any;

    await new FxOperationsService(prisma).createTransfer(7, {
      type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260,
      sourceType: 'BANK_ACCOUNT' as any, sourceBankAccountId: 3,
      destinationType: 'BANK_ACCOUNT' as any, destinationBankAccountId: 4,
    });

    expect(bankUpdates).toHaveLength(2);
    expect(bankUpdates[0].data.balance.increment.toString()).toBe('-2600');
    expect(bankUpdates[1].data.balance.increment.toString()).toBe('10');
  });

  it('rejects a cash source when the atomic balance guard finds insufficient funds', async () => {
    const prisma = {
      currency: { findUnique: jest.fn()
        .mockResolvedValueOnce({ id: 2, isActive: true })
        .mockResolvedValueOnce({ id: 1, code: 'CUP', isActive: true }) },
      $transaction: jest.fn(async (callback: any) => callback({
        exchangeRate: { findUnique: jest.fn().mockResolvedValue({ referenceRate: new Decimal(260), buyMargin: new Decimal(0), sellMargin: new Decimal(0) }) },
        currencyPosition: { findUnique: jest.fn().mockResolvedValue({ id: 9, saldo: new Decimal(0), costoPromedio: new Decimal(0), reviewStatus: 'UNREVIEWED', reviewedAt: null }), update: jest.fn() },
        transaction: { create: jest.fn().mockResolvedValue({ id: 11 }) }, currencyMovement: { create: jest.fn().mockResolvedValue({ id: 12 }) },
        cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 0 }), upsert: jest.fn() },
      })),
    } as any;
    await expect(new FxOperationsService(prisma).createTransfer(7, { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260 })).rejects.toThrow(InsufficientSaldoError);
  });
});
