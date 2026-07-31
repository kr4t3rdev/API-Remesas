import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExpensesService } from './expenses.service';

describe('ExpensesService', () => {
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: 1 }]),
    bankAccount: { updateMany: jest.fn() },
    cashBalance: { updateMany: jest.fn(), upsert: jest.fn() },
    currency: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
    expense: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]), update: jest.fn(), updateMany: jest.fn().mockResolvedValue({ count: 1 }), delete: jest.fn(), deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
  };
  const prisma = {
    $transaction: jest.fn((callback) => {
      if (Array.isArray(callback)) {
        return Promise.all(callback);
      }
      return callback(tx);
    }),
    expense: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
  } as any;
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
    tx.expense.findFirst
      .mockResolvedValueOnce({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null })
      .mockResolvedValueOnce({ id: 1 });
    tx.cashBalance.upsert.mockResolvedValue({});
    tx.bankAccount.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.findFirst.mockResolvedValue({ id: 1 });
    await service.update(1, { amount: 80, sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 5 }, 7);
    expect(tx.cashBalance.upsert).toHaveBeenCalled();
    expect(tx.bankAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: 5, balance: { gte: expect.anything() } }) }));
  });

  it('refunds the original source when deleting', async () => {
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 5 });
    tx.bankAccount.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.deleteMany.mockResolvedValue({ count: 1 });
    await service.remove(1, 7);
    expect(tx.bankAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { balance: { increment: expect.anything() } } }));
  });

  it('does not persist an update when the replacement source cannot be debited', async () => {
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null });
    tx.cashBalance.upsert.mockResolvedValue({});
    tx.bankAccount.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.update(1, { sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 99 }, 7))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(tx.expense.updateMany).not.toHaveBeenCalled();
  });

  it('extends endDate to end-of-day', async () => {
    await service.findAll({ category: undefined, currencyId: undefined, startDate: undefined, endDate: '2026-07-22' } as any, 7);
    const findManyCall = prisma.expense.findMany.mock.calls[0][0];
    const whereArg = findManyCall.where;
    const lte = whereArg.date.lte as Date;
    expect(whereArg).toEqual(expect.objectContaining({ date: expect.objectContaining({ lte: expect.any(Date) }) }));
    const expected = new Date('2026-07-22');
    expected.setHours(23, 59, 59, 999);
    expect(lte.getTime()).toBe(expected.getTime());
  });

  it('locks the tenant expense row before refunding during update and delete', async () => {
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null });
    tx.cashBalance.upsert.mockResolvedValue({});
    tx.cashBalance.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.updateMany.mockResolvedValue({ count: 1 });
    tx.expense.deleteMany.mockResolvedValue({ count: 1 });

    await service.update(1, { amount: 90 }, 7);
    expect(tx.$queryRaw.mock.calls[0][0].join('?')).toContain('"userId" = ? FOR UPDATE');
    expect(tx.$queryRaw.mock.calls[0].slice(1)).toEqual([1, 7]);
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(tx.cashBalance.upsert.mock.invocationCallOrder[0]);
    jest.clearAllMocks();
    tx.$queryRaw.mockResolvedValue([{ id: 1 }]);
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 90, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null });
    tx.cashBalance.upsert.mockResolvedValue({});
    tx.expense.deleteMany.mockResolvedValue({ count: 1 });
    await service.remove(1, 7);
    expect(tx.$queryRaw.mock.invocationCallOrder[0]).toBeLessThan(tx.cashBalance.upsert.mock.invocationCallOrder[0]);
  });

  it('rejects create with a non-existent currencyId', async () => {
    tx.currency.findFirst.mockResolvedValueOnce(null);
    await expect(service.create(base, 7)).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.cashBalance.updateMany).not.toHaveBeenCalled();
    expect(tx.expense.create).not.toHaveBeenCalled();
  });

  it('rejects update with an inactive currencyId', async () => {
    tx.expense.findFirst.mockResolvedValue({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null });
    tx.currency.findFirst.mockResolvedValueOnce(null);
    await expect(service.update(1, { currencyId: 999 }, 7)).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.expense.updateMany).not.toHaveBeenCalled();
  });

  it('does not refund or debit when only the description changes', async () => {
    tx.expense.findFirst
      .mockResolvedValueOnce({ id: 1, userId: 7, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null })
      .mockResolvedValueOnce({ id: 1 });
    tx.expense.updateMany.mockResolvedValueOnce({ count: 1 });

    await service.update(1, { description: 'Updated' }, 7);

    expect(tx.cashBalance.upsert).not.toHaveBeenCalled();
    expect(tx.cashBalance.updateMany).not.toHaveBeenCalled();
    expect(tx.expense.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1, userId: 7 } }));
  });

  it('paginates findAll with page and pageSize and returns total', async () => {
    prisma.expense.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    prisma.expense.count.mockResolvedValueOnce(5);
    const result = await service.findAll({ page: 1, pageSize: 2 } as any, 7);
    expect(prisma.expense.findMany.mock.calls[0][0]).toEqual(expect.objectContaining({ skip: 0, take: 2, orderBy: [{ date: 'desc' }, { id: 'desc' }] }));
    expect(prisma.expense.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId: 7 }) }));
    expect(result).toEqual({ items: [{ id: 1 }, { id: 2 }], total: 5, page: 1, pageSize: 2 });
  });
});
