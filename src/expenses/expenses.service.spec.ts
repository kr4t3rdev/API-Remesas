import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';

describe('ExpensesService', () => {
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 1 }]),
    bankAccount: { updateMany: jest.fn() },
    cashBalance: { updateMany: jest.fn(), upsert: jest.fn() },
    expense: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), delete: jest.fn() },
  };
  const prisma = { $transaction: jest.fn((callback) => callback(tx)) } as any;
  const service = new ExpensesService(prisma);
  const base = {
    description: 'Rent', amount: 100, currencyId: 1, category: 'renta',
    date: '2026-07-16', sourceType: 'CASH' as const,
  };

  beforeEach(() => jest.clearAllMocks());

  it('debits cash and stores the source on the expense atomically', async () => {
    tx.cashBalance.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.create.mockResolvedValue({ id: 1 });
    await service.create(base, 7);
    expect(tx.cashBalance.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { balance: { decrement: expect.anything() } } }));
    expect(tx.expense.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ sourceType: 'CASH', sourceBankAccountId: null }),
    }));
  });

  it('debits only an owned bank account with matching currency', async () => {
    tx.bankAccount.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.create.mockResolvedValue({ id: 2 });
    await service.create({ ...base, sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 5 }, 7);
    expect(tx.bankAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { balance: { decrement: expect.anything() } } }));
  });

  it('rejects insufficient cash without creating an expense', async () => {
    tx.cashBalance.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.create(base, 7)).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.expense.create).not.toHaveBeenCalled();
  });

  it('rejects a missing bank account', async () => {
    tx.bankAccount.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.create({ ...base, sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 5 }, 7))
      .rejects.toBeInstanceOf(BadRequestException);
  });
  it('atomically refunds the original source before updating and debits the replacement', async () => {
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null });
    tx.cashBalance.upsert.mockResolvedValue({});
    tx.bankAccount.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.update.mockResolvedValue({ id: 1 });
    await service.update(1, { amount: 80, sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 5 }, 7);
    expect(tx.cashBalance.upsert).toHaveBeenCalled();
    expect(tx.bankAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: 5, balance: { gte: expect.anything() } }) }));
  });

  it('refunds the original source when deleting', async () => {
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 5 });
    tx.bankAccount.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.delete.mockResolvedValue({ id: 1 });
    await service.remove(1, 7);
    expect(tx.bankAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { balance: { increment: expect.anything() } } }));
  });

  it('does not persist an update when the replacement source cannot be debited', async () => {
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null });
    tx.cashBalance.upsert.mockResolvedValue({});
    tx.bankAccount.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.update(1, { sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 99 }, 7))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(tx.expense.update).not.toHaveBeenCalled();
  });

  it('locks the tenant expense row before refunding during update and delete', async () => {
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null });
    tx.cashBalance.upsert.mockResolvedValue({});
    tx.cashBalance.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.update.mockResolvedValue({ id: 1 });
    tx.expense.delete.mockResolvedValue({ id: 1 });

    await service.update(1, { amount: 90 }, 7);
    expect(tx.$queryRaw.mock.calls[0][0].join('?')).toContain('"userId" = ? FOR UPDATE');
    expect(tx.$queryRaw.mock.calls[0].slice(1)).toEqual([1, 7]);
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(tx.cashBalance.upsert.mock.invocationCallOrder[0]);
    jest.clearAllMocks();
    tx.$queryRaw.mockResolvedValue([{ id: 1 }]);
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 90, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null });
    tx.cashBalance.upsert.mockResolvedValue({});
    tx.expense.delete.mockResolvedValue({ id: 1 });
    await service.remove(1, 7);
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(tx.cashBalance.upsert.mock.invocationCallOrder[0]);
  });
});
