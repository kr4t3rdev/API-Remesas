import { Decimal } from '@prisma/client/runtime/library';
import { ReportsService } from './reports.service';

describe('ReportsService FX rendimiento', () => {
  it('reports only sale movements in the requested period and currency', async () => {
    const prisma: any = {
      currencyMovement: { findMany: jest.fn().mockImplementation(({ where }: any) => Promise.resolve([
        { id: 1, type: 'SALE', amount: new Decimal(10), rate: new Decimal(270), costSnapshot: new Decimal(250), realizedProfit: new Decimal(200), createdAt: new Date('2026-07-02'), currency: { code: 'USD' } },
        ...(where.type === 'SALE' ? [] : [{ id: 2, type: 'PURCHASE', amount: new Decimal(10), rate: new Decimal(250), costSnapshot: null, realizedProfit: null, createdAt: new Date('2026-07-02'), currency: { code: 'USD' } }]),
      ])) },
      currencyPosition: { findMany: jest.fn().mockResolvedValue([{ currencyId: 2, saldo: new Decimal(90), costoPromedio: new Decimal(250), reviewStatus: 'REVIEWED', currency: { code: 'USD' } }]) },
    };
    const result = await new ReportsService(prisma).getFxPerformanceReport(7, '2026-07-01', '2026-07-31', 'USD');
    expect(result.totalRendimiento).toBe(200);
    expect(result.movements).toHaveLength(1);
    expect(result.positions[0].availableForSale).toBe(true);
  });

  it('rejects invalid date ranges with a stable validation error', async () => {
    await expect(new ReportsService({} as any).getFxPerformanceReport(7, 'bad', '2026-07-31')).rejects.toMatchObject({ response: expect.objectContaining({ code: 'REPORT_INVALID_PERIOD' }) });
  });
});
