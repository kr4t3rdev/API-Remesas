import { Decimal } from '@prisma/client/runtime/library';
import { ConflictException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { RemittancesService } from './remittances.service';

describe('RemittancesService', () => {
  const state: any = { remittances: [], positions: [], movements: [] };
  const prisma: any = { remittance: {}, $transaction: jest.fn(async (cb) => cb(prisma)), currencyPosition: {}, currencyMovement: {}, cashBalance: {} };
  const config: any = { get: jest.fn() };
  beforeEach(() => {
    jest.clearAllMocks(); state.remittances = []; state.movements = [];
    state.positions = [{ id: 1, userId: 7, currencyId: 2, saldo: new Decimal(100), costoPromedio: new Decimal(250), reviewStatus: 'REVIEWED' }, { id: 2, userId: 7, currencyId: 1, saldo: new Decimal(10000), costoPromedio: new Decimal(1), reviewStatus: 'REVIEWED' }];
    config.get.mockImplementation((key: string) => key === 'FX_REMITTANCES_ENABLED' ? 'true' : 'secret');
    prisma.remittance.findUnique = jest.fn().mockImplementation(({ where }: any) => state.remittances.find((r: any) => r.provider === where.provider_sourceId.provider && r.sourceId === where.provider_sourceId.sourceId) ?? null);
    prisma.remittance.findFirst = jest.fn().mockImplementation(({ where }: any) => state.remittances.find((r: any) => r.id === where.id && r.userId === where.userId) ?? null);
    prisma.remittance.create = jest.fn().mockImplementation(({ data }: any) => { const r = { id: state.remittances.length + 1, ...data }; state.remittances.push(r); return r; });
    prisma.remittance.update = jest.fn().mockImplementation(({ where, data }: any) => { const r = state.remittances.find((x: any) => x.id === where.id); Object.assign(r, data); return r; });
    prisma.currencyPosition.findUnique = jest.fn().mockImplementation(({ where }: any) => state.positions.find((p: any) => p.userId === where.userId_currencyId.userId && p.currencyId === where.userId_currencyId.currencyId) ?? null);
    prisma.currencyPosition.update = jest.fn().mockImplementation(({ where, data }: any) => { const p = state.positions.find((x: any) => x.id === where.id); if (data.saldo?.decrement) p.saldo = p.saldo.sub(data.saldo.decrement); else if (data.saldo?.increment) p.saldo = p.saldo.add(data.saldo.increment); else Object.assign(p, data); return p; });
    prisma.currencyMovement.create = jest.fn().mockImplementation(({ data }: any) => { const m = { id: state.movements.length + 1, ...data }; state.movements.push(m); return m; });
    prisma.cashBalance.upsert = jest.fn();
  });
  const service = () => new RemittancesService(prisma, { constructor: { assertSaleAvailable: (position: any, amount: Decimal) => { if (position.reviewStatus !== 'REVIEWED' || position.saldo.lt(amount)) throw new Error('unavailable'); } } } as any, config);
  const event: any = (status = 'COMPLETED') => ({ userId: 7, provider: 'stripe', sourceId: 'src-1', status, foreignCurrencyId: 2, foreignAmount: 10, localCurrencyId: 1, localAmount: 2700, rate: 270 });
  it('completes a two-currency remittance once', async () => { const result = await service().ingest(7, event()); expect(result.status).toBe('COMPLETED'); expect(prisma.currencyMovement.create).toHaveBeenCalledTimes(2); expect(state.positions[0].saldo.toString()).toBe('90'); });
  it('makes duplicate callback harmless', async () => { state.remittances.push({ id: 1, userId: 7, provider: 'stripe', sourceId: 'src-1', status: 'COMPLETED' }); const result = await service().ingest(7, event()); expect(result.duplicate).toBe(true); expect(prisma.currencyMovement.create).not.toHaveBeenCalled(); });
  it.each(['PENDING', 'FAILED'])('does not apply %s', async (status) => { const result = await service().ingest(7, event(status)); expect(result.status).toBe(status); expect(prisma.currencyMovement.create).not.toHaveBeenCalled(); });
  it('preserves identity on retry', async () => { state.remittances.push({ id: 1, userId: 7, provider: 'stripe', sourceId: 'old', status: 'FAILED' }); const result = await service().retry(7, 1, event()); expect(result.sourceId).toBe('old'); expect(result.status).toBe('COMPLETED'); });
  it('rejects provider auth and validation before writes', async () => { expect(() => service().assertProviderToken('bad')).toThrow(UnauthorizedException); await expect(service().ingest(7, { ...event(), sourceId: '' })).rejects.toThrow(UnprocessableEntityException); expect(prisma.remittance.create).not.toHaveBeenCalled(); });
  it('does not write when the feature flag disables ingestion', async () => { config.get.mockImplementation((key: string) => key === 'FX_REMITTANCES_ENABLED' ? 'false' : 'secret'); await expect(service().ingest(7, event())).rejects.toMatchObject({ response: expect.objectContaining({ code: 'FX_REMITTANCES_DISABLED' }) }); expect(prisma.remittance.create).not.toHaveBeenCalled(); });
  it('rejects and writes no movement when outgoing position is unavailable', async () => { state.positions[0].reviewStatus = 'UNREVIEWED'; await expect(service().ingest(7, event())).rejects.toThrow(ConflictException); expect(prisma.currencyMovement.create).not.toHaveBeenCalled(); });
});
