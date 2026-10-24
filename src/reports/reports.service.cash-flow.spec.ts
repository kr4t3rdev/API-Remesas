import { Decimal } from '@prisma/client/runtime/library';
import { ReportsService } from './reports.service';

describe('ReportsService report periods and cash flow', () => {
  it.each([
    ['period', (service: ReportsService) => service.getPeriodReport(7, '2026-07-31', '2026-07-01')],
    ['profit', (service: ReportsService) => service.getProfitReport(7, '2026-07-31', '2026-07-01')],
    ['cash flow', (service: ReportsService) => service.getCashFlowReport(7, '2026-07-31', '2026-07-01')],
  ])('rejects an inverted %s range before querying Prisma', async (_label, callReport) => {
    const prisma = {
      transaction: { findMany: jest.fn() },
      expense: { findMany: jest.fn() },
      cashAdjustment: { findMany: jest.fn() },
    };

    await expect(callReport(new ReportsService(prisma as any))).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'REPORT_INVALID_PERIOD' }),
    });
    expect(prisma.transaction.findMany).not.toHaveBeenCalled();
  });

  it('groups CUP transaction totals and native-currency expenses and adjustments without mixing currencies', async () => {
    const prisma = {
      transaction: {
        findMany: jest.fn().mockResolvedValue([
          { type: 'VENTA', totalCup: new Decimal(2700), currency: { code: 'USD', symbol: '$' } },
          { type: 'COMPRA', totalCup: new Decimal(1200), currency: { code: 'EUR', symbol: '€' } },
        ]),
      },
      expense: {
        findMany: jest.fn().mockResolvedValue([
          { amount: new Decimal(10), currency: { code: 'USD', symbol: '$' } },
          { amount: new Decimal(5), currency: { code: 'EUR', symbol: '€' } },
        ]),
      },
      cashAdjustment: {
        findMany: jest.fn().mockResolvedValue([
          { type: 'INGRESO', amount: new Decimal(3), currency: { code: 'USD', symbol: '$' } },
          { type: 'EGRESO', amount: new Decimal(2), currency: { code: 'EUR', symbol: '€' } },
        ]),
      },
    };

    const result = await new ReportsService(prisma as any).getCashFlowReport(
      7,
      '2026-07-01',
      '2026-07-31',
    );

    expect(result.currencies).toEqual([
      {
        currency: { code: 'CUP', symbol: '$' },
        inflows: { transactions: '2700', adjustments: '0', total: '2700' },
        outflows: { transactions: '1200', expenses: '0', adjustments: '0', total: '1200' },
        balance: '1500',
      },
      {
        currency: { code: 'EUR', symbol: '€' },
        inflows: { transactions: '0', adjustments: '0', total: '0' },
        outflows: { transactions: '0', expenses: '5', adjustments: '2', total: '7' },
        balance: '-7',
      },
      {
        currency: { code: 'USD', symbol: '$' },
        inflows: { transactions: '0', adjustments: '3', total: '3' },
        outflows: { transactions: '0', expenses: '10', adjustments: '0', total: '10' },
        balance: '-7',
      },
    ]);
    expect(result).not.toHaveProperty('inflows');
    expect(result).not.toHaveProperty('outflows');
  });

  it('converts non-CUP expenses in the daily breakdown using the rate effective on the expense date', async () => {
    const expense = {
      amount: new Decimal(10),
      currencyId: 2,
      date: new Date('2026-07-10T12:00:00.000Z'),
      currency: { code: 'USD' },
    };
    const prisma = {
      transaction: {
        findMany: jest.fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([]),
      },
      expense: {
        findMany: jest.fn()
          .mockResolvedValueOnce([expense])
          .mockResolvedValueOnce([expense]),
      },
      rateHistory: {
        findFirst: jest.fn().mockResolvedValue({ rate: new Decimal(270) }),
      },
    };

    const result = await new ReportsService(prisma as any).getPeriodReport(
      7,
      '2026-07-10',
      '2026-07-10',
    );

    expect(result.dailyBreakdown).toContainEqual(
      expect.objectContaining({
        expenses: 1,
        expensesTotalCup: '2700',
        expensesUnconverted: 0,
      }),
    );
  });

  it('uses the latest immutable rate history entry at the expense date', async () => {
    const expense = {
      amount: new Decimal(10),
      currencyId: 2,
      date: new Date('2026-07-09T12:00:00.000Z'),
      currency: { code: 'USD' },
    };
    const findFirst = jest.fn().mockResolvedValue({ rate: new Decimal(270) });
    const prisma = {
      transaction: { findMany: jest.fn().mockResolvedValue([]) },
      expense: { findMany: jest.fn().mockResolvedValue([expense]) },
      rateHistory: { findFirst },
      exchangeRate: { findFirst: jest.fn().mockResolvedValue({ referenceRate: new Decimal(999) }) },
    };

    const result = await new ReportsService(prisma as any).getPeriodReport(
      7,
      '2026-07-09',
      '2026-07-09',
    );

    expect(result.dailyBreakdown).toEqual(expect.arrayContaining([expect.objectContaining({ expensesTotalCup: '2700' })]));
    expect(prisma.exchangeRate.findFirst).not.toHaveBeenCalled();
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        userId: 7,
        currencyFromId: 2,
        currencyTo: { code: 'CUP' },
        createdAt: { lte: expense.date },
      }),
      orderBy: { createdAt: 'desc' },
    }));
  });

  it('uses the configured primary currency as the historical conversion target', async () => {
    const expense = {
      amount: new Decimal(10),
      currencyId: 2,
      date: new Date('2026-07-09T12:00:00.000Z'),
      currency: { code: 'USD' },
    };
    const findFirst = jest.fn().mockResolvedValue({ rate: new Decimal(270) });
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ primaryCurrency: { code: 'MLC', isActive: true } }) },
      transaction: { findMany: jest.fn().mockResolvedValue([]) },
      expense: { findMany: jest.fn().mockResolvedValue([expense]) },
      rateHistory: { findFirst },
    };

    await new ReportsService(prisma as any).getPeriodReport(7, '2026-07-09', '2026-07-09');

    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ currencyTo: { code: 'MLC' } }),
    }));
  });

  it('computes daily net from realized FX margin instead of purchase and sale cash flow', async () => {
    const prisma = {
      transaction: { findMany: jest.fn().mockResolvedValue([
        { type: 'COMPRA', totalCup: new Decimal(20000), marginProfit: new Decimal(0), currency: { code: 'USD' } },
        { type: 'VENTA', totalCup: new Decimal(5400), marginProfit: new Decimal(400), currency: { code: 'USD' } },
      ]) },
      expense: { findMany: jest.fn().mockResolvedValue([
        { amount: new Decimal(100), currencyId: 1, date: new Date('2026-07-10T12:00:00.000Z'), currency: { code: 'CUP' } },
      ]) },
    };

    const result = await new ReportsService(prisma as any).getDailyReport(7, '2026-07-09');

    expect(result.profit).toEqual({ margin: 7.41, marginProfit: '400', net: '300' });
  });

  it('omits an exact daily and period net when any expense cannot be converted', async () => {
    const expense = { amount: new Decimal(10), currencyId: 2, date: new Date('2026-07-10T12:00:00.000Z'), currency: { code: 'USD' } };
    const prisma = {
      transaction: { findMany: jest.fn().mockResolvedValue([]) },
      expense: { findMany: jest.fn().mockResolvedValue([expense]) },
      rateHistory: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new ReportsService(prisma as any);

    await expect(service.getDailyReport(7, '2026-07-09')).resolves.toEqual(expect.objectContaining({
      profit: expect.objectContaining({ net: null }),
    }));
    await expect(service.getPeriodReport(7, '2026-07-09', '2026-07-09')).resolves.toEqual(expect.objectContaining({
      summary: expect.objectContaining({ netProfit: null }),
    }));
  });
});
