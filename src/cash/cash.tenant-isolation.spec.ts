import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CashService } from './cash.service';

const USER_A = 101;
const USER_B = 102;
const closingA = { id: 201, userId: USER_A, expectedBalance: 10, actualBalance: 10, difference: 0, currency: { id: 1 }, closedBy: { id: USER_A, name: 'A' } };
const closingB = { ...closingA, id: 202, userId: USER_B };

describe('CashService tenant isolation', () => {
  it('returns owner A closing and hides user B with exact id+userId filters', async () => {
    const findFirst = jest.fn(({ where }: any) => Promise.resolve([closingA, closingB].find((row) => row.id === where.id && row.userId === where.userId) ?? null));
    const service = new CashService({ cashClosing: { findFirst } } as unknown as PrismaService);
    await expect(service.getClosing(USER_A, 201)).resolves.toMatchObject({ id: 201 });
    await expect(service.getClosing(USER_A, 202)).rejects.toMatchObject({ status: 404, message: 'Cierre diario no encontrado' });
    expect(findFirst).toHaveBeenNthCalledWith(1, { where: { id: 201, userId: USER_A }, include: { currency: true, closedBy: { select: { id: true, name: true } } } });
    expect(findFirst).toHaveBeenNthCalledWith(2, { where: { id: 202, userId: USER_A }, include: { currency: true, closedBy: { select: { id: true, name: true } } } });
  });

  it('tenant-scopes closings and policies', async () => {
    const closings = [closingA, closingB];
    const policies = [{ id: 1, userId: USER_A, currencyId: 1 }, { id: 2, userId: USER_B, currencyId: 1 }];
    const closingFindMany = jest.fn(({ where }: any) => Promise.resolve(closings.filter((row) => row.userId === where.userId && (!where.currencyId || row.currency.id === where.currencyId))));
    const policyFindMany = jest.fn(({ where }: any) => Promise.resolve(policies.filter((row) => row.userId === where.userId)));
    const currencyFindMany = jest.fn().mockResolvedValue([{ id: 1, code: 'CUP' }]);
    const service = new CashService({ cashClosing: { findMany: closingFindMany }, cashPolicy: { findMany: policyFindMany }, currency: { findMany: currencyFindMany } } as unknown as PrismaService);
    await expect(service.getClosings(USER_A, 1)).resolves.toEqual([expect.objectContaining({ id: 201 })]);
    const policyResult = await service.getPolicies(USER_A);
    expect(policyResult).toHaveLength(1);
    expect(closingFindMany).toHaveBeenCalledWith({ where: { userId: USER_A, currencyId: 1 }, include: { currency: true, closedBy: { select: { id: true, name: true } } }, orderBy: [{ businessDate: 'desc' }, { closedAt: 'desc' }] });
    expect(policyFindMany).toHaveBeenCalledWith({ where: { userId: USER_A }, include: { currency: true } });
  });

  it('getOverview scopes every user-owned relation', async () => {
    const prisma: any = {
      user: { findUnique: jest.fn().mockResolvedValue({ primaryCurrency: null }) }, currency: { findMany: jest.fn().mockResolvedValue([]) },
      cashBalance: { findMany: jest.fn().mockResolvedValue([]) }, transaction: { findMany: jest.fn().mockResolvedValue([]) },
      expense: { findMany: jest.fn().mockResolvedValue([]) }, cashAdjustment: { findMany: jest.fn().mockResolvedValue([]) },
      cashAudit: { findMany: jest.fn().mockResolvedValue([]) }, bankAccount: { findMany: jest.fn().mockResolvedValue([]) },
    };
    await new CashService(prisma).getOverview(USER_A);
    expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: USER_A } }));
    expect(prisma.cashBalance.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: USER_A } }));
    expect(prisma.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: USER_A, OR: [{ sourceType: 'CASH' }, { destinationType: 'CASH' }] } }));
    expect(prisma.expense.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: USER_A, sourceType: 'CASH' } }));
    for (const model of ['cashAdjustment', 'cashAudit']) expect(prisma[model].findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: USER_A } }));
  });

  it('getValuation scopes balances and exchange rates to user A', async () => {
    const prisma: any = {
      user: { findUnique: jest.fn().mockResolvedValue({ primaryCurrencyId: 1 }) },
      currency: { findFirst: jest.fn(({ where }: any) => Promise.resolve(where.code === 'CUP' || where.id === 1 ? { id: 1, code: 'CUP' } : null)) },
      cashBalance: { findMany: jest.fn().mockResolvedValue([]) }, exchangeRate: { findMany: jest.fn().mockResolvedValue([]) },
    };
    await new CashService(prisma).getValuation(USER_A, 1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: USER_A }, select: { primaryCurrencyId: true } });
    expect(prisma.cashBalance.findMany).toHaveBeenCalledWith({ where: { userId: USER_A }, include: { currency: true }, orderBy: { currency: { code: 'asc' } } });
    expect(prisma.exchangeRate.findMany).toHaveBeenCalledWith({ where: { userId: USER_A }, include: { currency: true } });
  });

  it('getAuditors returns only the authenticated active user', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: USER_A, name: 'A' }]);
    await new CashService({ user: { findMany } } as unknown as PrismaService).getAuditors(USER_A);
    expect(findMany).toHaveBeenCalledWith({ where: { id: USER_A, isActive: true }, select: { id: true, name: true } });
  });

  it('createClosing reads and creates only with user A composite keys', async () => {
    const tx: any = {
      currency: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) }, cashBalance: { findUnique: jest.fn().mockResolvedValue({ balance: 10 }) },
      cashClosing: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue(closingA) },
    };
    const prisma = { $transaction: jest.fn((callback) => callback(tx)) } as unknown as PrismaService;
    await new CashService(prisma).createClosing(USER_A, { currencyId: 1, businessDate: '2026-07-16', actualBalance: 10 });
    const businessDate = new Date('2026-07-16T00:00:00.000Z');
    expect(tx.cashBalance.findUnique).toHaveBeenCalledWith({ where: { userId_currencyId: { userId: USER_A, currencyId: 1 } } });
    expect(tx.cashClosing.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_currencyId_businessDate: { userId: USER_A, currencyId: 1, businessDate } } }));
    expect(tx.cashClosing.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: USER_A, closedById: USER_A }) }));
  });
});
