import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { BankAccountsService } from './bank-accounts.service';

const USER_A = 101;
const USER_B = 102;
const accounts = [
  { id: 201, userId: USER_A, name: 'A account', isActive: true, balance: 50, currency: { id: 1 } },
  { id: 202, userId: USER_B, name: 'B account', isActive: true, balance: 75, currency: { id: 1 } },
];
const scopedFindFirst = jest.fn(({ where }: any) => Promise.resolve(
  accounts.find((row) => row.id === where.id && row.userId === where.userId) ?? null,
));

describe('BankAccountsService tenant isolation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates and lists accounts with the authenticated userId', async () => {
    const create = jest.fn().mockResolvedValue(accounts[0]);
    const findMany = jest.fn(({ where }: any) => Promise.resolve(accounts.filter((row) => row.userId === where.userId && row.isActive === where.isActive)));
    const service = new BankAccountsService({ bankAccount: { create, findMany } } as unknown as PrismaService);

    await service.create(USER_A, { name: 'A account', bankName: 'Bank A', accountNumber: '123', currencyId: 1, initialBalance: 50 });
    await expect(service.findAll(USER_A)).resolves.toEqual([accounts[0]]);

    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: USER_A }) }));
    expect(findMany).toHaveBeenCalledWith({ where: { userId: USER_A, isActive: true }, include: { currency: true }, orderBy: { name: 'asc' } });
  });

  it('returns owner A but hides the same lookup from user B', async () => {
    const service = new BankAccountsService({ bankAccount: { findFirst: scopedFindFirst } } as unknown as PrismaService);

    await expect(service.findOne(USER_A, 201)).resolves.toEqual(accounts[0]);
    await expect(service.findOne(USER_B, 201)).rejects.toMatchObject({ status: 404, message: 'Cuenta bancaria no encontrada' });
    expect(scopedFindFirst).toHaveBeenNthCalledWith(1, { where: { id: 201, userId: USER_A }, include: { currency: true } });
    expect(scopedFindFirst).toHaveBeenNthCalledWith(2, { where: { id: 201, userId: USER_B }, include: { currency: true } });
  });

  it.each(['getBalance', 'getTransactions'] as const)('%s hides another tenant account and skips relations', async (operation) => {
    const expenseFindMany = jest.fn();
    const transactionFindMany = jest.fn();
    const service = new BankAccountsService({
      bankAccount: { findFirst: scopedFindFirst }, expense: { findMany: expenseFindMany }, transaction: { findMany: transactionFindMany },
    } as unknown as PrismaService);

    await expect(service[operation](USER_A, 202)).rejects.toBeInstanceOf(NotFoundException);
    expect(scopedFindFirst).toHaveBeenCalledWith({ where: { id: 202, userId: USER_A }, include: { currency: true } });
    expect(expenseFindMany).not.toHaveBeenCalled();
    expect(transactionFindMany).not.toHaveBeenCalled();
  });

  it.each(['update', 'remove'] as const)('%s mutates owner A and never another tenant account', async (operation) => {
    const update = jest.fn().mockResolvedValue(accounts[0]);
    const service = new BankAccountsService({ bankAccount: { findFirst: scopedFindFirst, update } } as unknown as PrismaService);
    const ownerAction = operation === 'update' ? service.update(USER_A, 201, { name: 'Updated' }) : service.remove(USER_A, 201);
    await expect(ownerAction).resolves.toBeDefined();
    expect(update).toHaveBeenCalledTimes(1);
    expect(scopedFindFirst).toHaveBeenNthCalledWith(1, { where: { id: 201, userId: USER_A }, include: { currency: true } });
    expect(update).toHaveBeenNthCalledWith(1, operation === 'update'
      ? { where: { id: 201 }, data: { name: 'Updated' }, include: { currency: true } }
      : { where: { id: 201 }, data: { isActive: false } });

    const foreignAction = operation === 'update' ? service.update(USER_A, 202, { name: 'Hijacked' }) : service.remove(USER_A, 202);
    await expect(foreignAction).rejects.toBeInstanceOf(NotFoundException);
    expect(scopedFindFirst).toHaveBeenNthCalledWith(2, { where: { id: 202, userId: USER_A }, include: { currency: true } });
    expect(update).toHaveBeenCalledTimes(1);
  });
});
