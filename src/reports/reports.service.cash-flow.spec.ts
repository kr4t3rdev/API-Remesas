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
        inflows: { transactions: 2700, adjustments: 0, total: 2700 },
        outflows: { transactions: 1200, expenses: 0, adjustments: 0, total: 1200 },
        balance: 1500,
      },
      {
        currency: { code: 'EUR', symbol: '€' },
        inflows: { transactions: 0, adjustments: 0, total: 0 },
        outflows: { transactions: 0, expenses: 5, adjustments: 2, total: 7 },
        balance: -7,
      },
      {
        currency: { code: 'USD', symbol: '$' },
        inflows: { transactions: 0, adjustments: 3, total: 3 },
        outflows: { transactions: 0, expenses: 10, adjustments: 0, total: 10 },
        balance: -7,
      },
    ]);
    expect(result).not.toHaveProperty('inflows');
    expect(result).not.toHaveProperty('outflows');
  });

  it('converts non-CUP expenses in the daily breakdown using the rate effective on the expense date', async () => {
    const expense = {
      amount: new Decimal(10),
      currencyId: 2,
      date: new Date('2026-07-09T12:00:00.000Z'),
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
      exchangeRate: {
        findFirst: jest.fn().mockResolvedValue({ referenceRate: new Decimal(270) }),
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
        expensesTotalCup: 2700,
        expensesUnconverted: 0,
      }),
    );
  });
});
