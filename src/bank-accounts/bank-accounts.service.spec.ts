import { BankAccountsService } from './bank-accounts.service';
import { PrismaService } from '../database/prisma/prisma.service';

const cupCurrency = { id: 1, code: 'CUP', name: 'Peso Cubano', symbol: '$', isActive: true };

describe('BankAccountsService transfer history', () => {
  it('returns FX transfers affecting the account and keeps tenant scope', async () => {
    const transactionFindMany = jest.fn().mockResolvedValue([{
      id: 10, type: 'COMPRA', operationKind: 'REMITTANCE', amount: { toString: () => '10' }, totalCup: { toString: () => '2400' }, rate: { toString: () => '240' },
      currency: { id: 2, code: 'USD' }, sourceType: 'CASH', sourceBankAccountId: null,
      destinationType: 'BANK_ACCOUNT', destinationBankAccountId: 4, createdAt: new Date('2026-07-12T12:00:00.000Z'),
      sourceBankAccount: null, destinationBankAccount: { id: 4, name: 'USD account', currencyId: 2 },
    }]);
    const prisma = {
      bankAccount: { findFirst: jest.fn().mockResolvedValue({ id: 4, userId: 7, currency: { id: 2, code: 'USD' } }) },
      expense: { findMany: jest.fn().mockResolvedValue([]) },
      transaction: { findMany: transactionFindMany },
      currency: { findFirst: jest.fn().mockResolvedValue(cupCurrency) },
    };

    const result = await new BankAccountsService(prisma as unknown as PrismaService).getTransactions(7, 4);
    expect(transactionFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {
      userId: 7, OR: [{ sourceBankAccountId: 4 }, { destinationBankAccountId: 4 }],
    }}));
    expect(result.transfers).toEqual([expect.objectContaining({ id: 'transfer:10', operationKind: 'REMITTANCE', direction: 'IN', amount: '10', currency: expect.objectContaining({ code: 'USD' }) })]);
  });

  it('uses CUP for a VENTA destination leg', async () => {
    const prisma = {
      bankAccount: { findFirst: jest.fn().mockResolvedValue({ id: 4, userId: 7, currency: { id: 1, code: 'CUP' } }) },
      expense: { findMany: jest.fn().mockResolvedValue([]) },
      transaction: { findMany: jest.fn().mockResolvedValue([{ id: 11, type: 'VENTA', amount: { toString: () => '10' }, totalCup: { toString: () => '2400' }, rate: { toString: () => '240' }, currency: { id: 2, code: 'USD' }, sourceType: 'CASH', sourceBankAccountId: null, destinationType: 'BANK_ACCOUNT', destinationBankAccountId: 4, createdAt: new Date() }]) },
      currency: { findFirst: jest.fn().mockResolvedValue(cupCurrency) },
    };
    const result = await new BankAccountsService(prisma as unknown as PrismaService).getTransactions(7, 4);
    expect(result.transfers[0]).toEqual(expect.objectContaining({ direction: 'IN', amount: '2400', currency: expect.objectContaining({ code: 'CUP', id: null }) }));
  });

  // La pierna CUP se serializa con `id: null` pero el contrato
  // (`BankTransferCurrencyDto`) exige name/symbol/isActive: sin ellos el
  // cliente no puede decodificar la respuesta.
  it('completes the CUP leg with the currency fields required by the contract', async () => {
    const prisma = {
      bankAccount: { findFirst: jest.fn().mockResolvedValue({ id: 4, userId: 7, currency: { id: 1, code: 'CUP' } }) },
      expense: { findMany: jest.fn().mockResolvedValue([]) },
      transaction: { findMany: jest.fn().mockResolvedValue([{ id: 11, type: 'VENTA', amount: { toString: () => '10' }, totalCup: { toString: () => '2400' }, rate: { toString: () => '240' }, currency: { id: 2, code: 'USD' }, sourceType: 'CASH', sourceBankAccountId: null, destinationType: 'BANK_ACCOUNT', destinationBankAccountId: 4, createdAt: new Date() }]) },
      currency: { findFirst: jest.fn().mockResolvedValue(cupCurrency) },
    };

    const result = await new BankAccountsService(prisma as unknown as PrismaService).getTransactions(7, 4);

    expect(result.transfers[0].currency).toEqual({
      id: null,
      code: 'CUP',
      name: 'Peso Cubano',
      symbol: '$',
      isActive: true,
    });
  });

  it('falls back to the canonical CUP label when the currency row is missing', async () => {
    const prisma = {
      bankAccount: { findFirst: jest.fn().mockResolvedValue({ id: 4, userId: 7, currency: { id: 1, code: 'CUP' } }) },
      expense: { findMany: jest.fn().mockResolvedValue([]) },
      transaction: { findMany: jest.fn().mockResolvedValue([{ id: 11, type: 'VENTA', amount: { toString: () => '10' }, totalCup: { toString: () => '2400' }, rate: { toString: () => '240' }, currency: { id: 2, code: 'USD' }, sourceType: 'CASH', sourceBankAccountId: null, destinationType: 'BANK_ACCOUNT', destinationBankAccountId: 4, createdAt: new Date() }]) },
      currency: { findFirst: jest.fn().mockResolvedValue(null) },
    };

    const result = await new BankAccountsService(prisma as unknown as PrismaService).getTransactions(7, 4);

    expect(result.transfers[0].currency).toEqual({
      id: null,
      code: 'CUP',
      name: 'Peso Cubano',
      symbol: '$',
      isActive: true,
    });
  });
});
