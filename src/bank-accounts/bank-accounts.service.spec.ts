import { BankAccountsService } from './bank-accounts.service';
import { PrismaService } from '../database/prisma/prisma.service';

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
      transaction: { findMany: jest.fn().mockResolvedValue([{ id: 11, type: 'VENTA', amount: { toString: () => '10' }, totalCup: { toString: () => '2400' }, rate: { toString: () => '240' }, currency: { id: 2, code: 'USD' }, sourceBankAccountId: null, destinationBankAccountId: 4, sourceType: 'CASH', destinationType: 'BANK_ACCOUNT', createdAt: new Date() }]) },
    };
    const result = await new BankAccountsService(prisma as unknown as PrismaService).getTransactions(7, 4);
    expect(result.transfers[0]).toEqual(expect.objectContaining({ direction: 'IN', amount: '2400', currency: { code: 'CUP', id: null } }));
  });
});
