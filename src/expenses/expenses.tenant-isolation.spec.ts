import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { ExpensesService } from './expenses.service';

const USER_A = 101;
const rows = [
  { id: 201, userId: USER_A, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null },
  { id: 202, userId: 102, amount: 100, currencyId: 1, sourceType: 'CASH', sourceBankAccountId: null },
];
const scopedFind = ({ where }: any) => Promise.resolve(rows.find((row) => row.id === where.id && row.userId === where.userId) ?? null);

describe('ExpensesService tenant isolation', () => {
  it('findAll and findOne use exact tenant filters and exclude user B', async () => {
    const findMany = jest.fn(({ where }: any) => Promise.resolve(rows.filter((row) => row.userId === where.userId)));
    const findFirst = jest.fn(scopedFind);
    const service = new ExpensesService({ expense: { findMany, findFirst } } as unknown as PrismaService);

    await expect(service.findAll({}, USER_A)).resolves.toEqual([rows[0]]);
    await expect(service.findOne(201, USER_A)).resolves.toEqual(rows[0]);
    await expect(service.findOne(202, USER_A)).rejects.toMatchObject({ status: 404, message: 'Gasto no encontrado' });
    expect(findMany).toHaveBeenCalledWith({ where: { userId: USER_A }, include: { currency: true, sourceBankAccount: true }, orderBy: { date: 'desc' } });
    expect(findFirst).toHaveBeenNthCalledWith(1, { where: { id: 201, userId: USER_A }, include: { currency: true, sourceBankAccount: true } });
    expect(findFirst).toHaveBeenNthCalledWith(2, { where: { id: 202, userId: USER_A }, include: { currency: true, sourceBankAccount: true } });
  });

  it('creates a cash expense under user A and debits only user A cash', async () => {
    const tx = { cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) }, expense: { create: jest.fn().mockResolvedValue(rows[0]) } };
    const service = new ExpensesService({ $transaction: jest.fn((callback) => callback(tx)) } as unknown as PrismaService);
    await service.create({ description: 'Rent', amount: 100, currencyId: 1, category: 'rent', date: '2026-07-16', sourceType: 'CASH' }, USER_A);
    expect(tx.cashBalance.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: USER_A, currencyId: 1, balance: { gte: expect.anything() } } }));
    expect(tx.expense.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: USER_A }) }));
  });

  it('rejects a bank source owned by B using a tenant-scoped debit', async () => {
    const tx = { bankAccount: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) }, expense: { create: jest.fn() } };
    const service = new ExpensesService({ $transaction: jest.fn((callback) => callback(tx)) } as unknown as PrismaService);
    await expect(service.create({ description: 'Rent', amount: 100, currencyId: 1, category: 'rent', date: '2026-07-16', sourceType: 'BANK_ACCOUNT', sourceBankAccountId: 302 }, USER_A)).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.bankAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 302, userId: USER_A, isActive: true, currencyId: 1, balance: { gte: expect.anything() } } }));
    expect(tx.expense.create).not.toHaveBeenCalled();
  });

  it.each(['update', 'remove'] as const)('%s locks id+userId and causes no balance side effect for user B expense', async (operation) => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([]), expense: { findFirst: jest.fn(scopedFind), update: jest.fn(), delete: jest.fn() },
      bankAccount: { updateMany: jest.fn() }, cashBalance: { updateMany: jest.fn(), upsert: jest.fn() },
    };
    const service = new ExpensesService({ $transaction: jest.fn((callback) => callback(tx)) } as unknown as PrismaService);
    const action = operation === 'update' ? service.update(202, { description: 'Hijacked' }, USER_A) : service.remove(202, USER_A);
    await expect(action).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.$queryRaw.mock.calls[0][0].join('?')).toContain('WHERE id = ? AND "userId" = ? FOR UPDATE');
    expect(tx.$queryRaw.mock.calls[0].slice(1)).toEqual([202, USER_A]);
    expect(tx.expense.findFirst).toHaveBeenCalledWith({ where: { id: 202, userId: USER_A } });
    expect(tx.expense.update).not.toHaveBeenCalled(); expect(tx.expense.delete).not.toHaveBeenCalled();
    expect(tx.bankAccount.updateMany).not.toHaveBeenCalled(); expect(tx.cashBalance.updateMany).not.toHaveBeenCalled(); expect(tx.cashBalance.upsert).not.toHaveBeenCalled();
  });

  it('updates owner A only after refunding and debiting A cash', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 201 }]), expense: { findFirst: jest.fn(scopedFind), update: jest.fn().mockResolvedValue({ ...rows[0], amount: 90 }) },
      bankAccount: { updateMany: jest.fn() }, cashBalance: { updateMany: jest.fn().mockResolvedValue({ count: 1 }), upsert: jest.fn().mockResolvedValue({}) },
    };
    const service = new ExpensesService({ $transaction: jest.fn((callback) => callback(tx)) } as unknown as PrismaService);
    await service.update(201, { amount: 90 }, USER_A);
    expect(tx.$queryRaw.mock.calls[0].slice(1)).toEqual([201, USER_A]);
    expect(tx.expense.findFirst).toHaveBeenCalledWith({ where: { id: 201, userId: USER_A } });
    expect(tx.cashBalance.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_currencyId: { userId: USER_A, currencyId: 1 } } }));
    expect(tx.cashBalance.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: USER_A, currencyId: 1, balance: { gte: expect.anything() } } }));
    expect(tx.expense.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 201 } }));
  });

  it('removes owner A only after refunding A cash', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: 201 }]), expense: { findFirst: jest.fn(scopedFind), delete: jest.fn().mockResolvedValue(rows[0]) },
      bankAccount: { updateMany: jest.fn() }, cashBalance: { updateMany: jest.fn(), upsert: jest.fn().mockResolvedValue({}) },
    };
    const service = new ExpensesService({ $transaction: jest.fn((callback) => callback(tx)) } as unknown as PrismaService);
    await service.remove(201, USER_A);
    expect(tx.$queryRaw.mock.calls[0].slice(1)).toEqual([201, USER_A]);
    expect(tx.cashBalance.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_currencyId: { userId: USER_A, currencyId: 1 } } }));
    expect(tx.cashBalance.updateMany).not.toHaveBeenCalled();
    expect(tx.expense.delete).toHaveBeenCalledWith({ where: { id: 201 } });
  });
});
