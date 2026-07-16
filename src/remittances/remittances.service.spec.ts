import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { ConflictException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { RemittancesService } from './remittances.service';

describe('RemittancesService', () => {
  const state: any = { remittances: [], positions: [], movements: [] };
  const prisma: any = { remittance: {}, transaction: {}, $transaction: jest.fn(async (cb) => cb(prisma)), currencyPosition: {}, currencyMovement: {}, cashBalance: {} };
  const config: any = { get: jest.fn() };
  beforeEach(() => {
    jest.clearAllMocks(); state.remittances = []; state.movements = [];
    state.positions = [{ id: 1, userId: 7, currencyId: 2, saldo: new Decimal(100), costoPromedio: new Decimal(250), reviewStatus: 'REVIEWED' }, { id: 2, userId: 7, currencyId: 1, saldo: new Decimal(10000), costoPromedio: new Decimal(1), reviewStatus: 'REVIEWED' }];
    config.get.mockImplementation((key: string) => ({ FX_REMITTANCES_ENABLED: 'true', REMITTANCE_PROVIDER_TOKEN: 'secret', REMITTANCE_PROVIDER_USER_ID: '7' })[key]);
    prisma.remittance.findUnique = jest.fn().mockImplementation(({ where }: any) => state.remittances.find((r: any) => r.userId === where.userId_provider_sourceId.userId && r.provider === where.userId_provider_sourceId.provider && r.sourceId === where.userId_provider_sourceId.sourceId) ?? null);
    prisma.remittance.findFirst = jest.fn().mockImplementation(({ where }: any) => state.remittances.find((r: any) => r.id === where.id && r.userId === where.userId) ?? null);
    prisma.remittance.create = jest.fn().mockImplementation(({ data }: any) => { const r = { id: state.remittances.length + 1, ...data }; state.remittances.push(r); return r; });
    prisma.remittance.update = jest.fn().mockImplementation(({ where, data }: any) => { const r = state.remittances.find((x: any) => x.id === where.id); Object.assign(r, data); return r; });
    prisma.currencyPosition.findUnique = jest.fn().mockImplementation(({ where }: any) => state.positions.find((p: any) => p.userId === where.userId_currencyId.userId && p.currencyId === where.userId_currencyId.currencyId) ?? null);
    prisma.currencyPosition.updateMany = jest.fn().mockImplementation(({ where, data }: any) => { const p = state.positions.find((x: any) => x.id === where.id && x.reviewStatus === where.reviewStatus && x.saldo.gte(where.saldo.gte)); if (!p) return { count: 0 }; p.saldo = p.saldo.sub(data.saldo.decrement); return { count: 1 }; });
    prisma.currencyPosition.update = jest.fn().mockImplementation(({ where, data }: any) => { const p = state.positions.find((x: any) => x.id === where.id); if (data.saldo?.decrement) p.saldo = p.saldo.sub(data.saldo.decrement); else if (data.saldo?.increment) p.saldo = p.saldo.add(data.saldo.increment); else Object.assign(p, data); return p; });
    prisma.currencyMovement.create = jest.fn().mockImplementation(({ data }: any) => { const m = { id: state.movements.length + 1, ...data }; state.movements.push(m); return m; });
    prisma.cashBalance.upsert = jest.fn();
    prisma.transaction.findMany = jest.fn().mockResolvedValue([]);
  });
  const service = () => new RemittancesService(prisma, { constructor: { assertSaleAvailable: (position: any, amount: Decimal) => { if (position.reviewStatus !== 'REVIEWED' || position.saldo.lt(amount)) throw new Error('unavailable'); } } } as any, config);
  const event: any = (status = 'COMPLETED') => ({ userId: 7, provider: 'stripe', sourceId: 'src-1', status, foreignCurrencyId: 2, foreignAmount: 10, localCurrencyId: 1, localAmount: 2700, rate: 270 });
  it('completes a two-currency remittance once', async () => { const result = await service().ingest(7, event()); expect(result.status).toBe('COMPLETED'); expect(prisma.currencyMovement.create).toHaveBeenCalledTimes(2); expect(state.positions[0].saldo.toString()).toBe('90'); });
  it('makes duplicate callback harmless', async () => { state.remittances.push({ id: 1, userId: 7, provider: 'stripe', sourceId: 'src-1', status: 'COMPLETED' }); const result = await service().ingest(7, event()); expect(result.duplicate).toBe(true); expect(prisma.currencyMovement.create).not.toHaveBeenCalled(); });
  it('isolates provider source identifiers between tenants', async () => {
    const first = await service().ingest(7, event('PENDING'));
    const second = await service().ingest(8, { ...event('PENDING'), userId: 8 });

    expect(first).toEqual(expect.objectContaining({ userId: 7, provider: 'stripe', sourceId: 'src-1' }));
    expect(second).toEqual(expect.objectContaining({ userId: 8, provider: 'stripe', sourceId: 'src-1' }));
    expect(state.remittances).toHaveLength(2);
  });
  it.each(['PENDING', 'FAILED'])('does not apply %s', async (status) => { const result = await service().ingest(7, event(status)); expect(result.status).toBe(status); expect(prisma.currencyMovement.create).not.toHaveBeenCalled(); });
  it('returns a tenant-scoped duplicate when pending creation loses an idempotency race', async () => {
    prisma.remittance.create.mockImplementationOnce(({ data }: any) => {
      state.remittances.push({ id: 22, ...data });
      throw new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: '5.8.1' });
    });
    await expect(service().ingest(7, event('PENDING'))).resolves.toEqual(expect.objectContaining({ id: 22, userId: 7, duplicate: true }));
  });
  it('retries serializable transaction conflicts a bounded number of times', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('write conflict', { code: 'P2034', clientVersion: '5.8.1' });
    prisma.$transaction.mockRejectedValueOnce(conflict).mockRejectedValueOnce(conflict);
    await expect(service().ingest(7, event())).resolves.toEqual(expect.objectContaining({ status: 'COMPLETED' }));
    expect(prisma.$transaction).toHaveBeenCalledTimes(3);
  });
  it('preserves identity on retry', async () => { state.remittances.push({ id: 1, userId: 7, provider: 'stripe', sourceId: 'old', status: 'FAILED' }); const result = await service().retry(7, 1, event()); expect(result.sourceId).toBe('old'); expect(result.status).toBe('COMPLETED'); });
  it('rejects provider auth and validation before writes', async () => { expect(() => service().assertProviderToken('bad')).toThrow(UnauthorizedException); await expect(service().ingest(7, { ...event(), sourceId: '' })).rejects.toThrow(UnprocessableEntityException); expect(prisma.remittance.create).not.toHaveBeenCalled(); });
  it('resolves the tenant from mapped provider credentials', () => {
    config.get.mockImplementation((key: string) => key === 'REMITTANCE_PROVIDER_TENANT_TOKENS' ? JSON.stringify({ tenantToken: 8 }) : undefined);
    expect(service().resolveProviderTenant('tenantToken')).toBe(8);
    expect(() => service().resolveProviderTenant('unknown')).toThrow(UnauthorizedException);
  });
  it('fails closed when the legacy token has no configured tenant', () => {
    config.get.mockImplementation((key: string) => key === 'REMITTANCE_PROVIDER_TOKEN' ? 'legacy' : undefined);
    expect(() => service().resolveProviderTenant('legacy')).toThrow(UnauthorizedException);
  });
  it('does not write when the feature flag disables ingestion', async () => { config.get.mockImplementation((key: string) => key === 'FX_REMITTANCES_ENABLED' ? 'false' : undefined); await expect(service().ingest(7, event())).rejects.toMatchObject({ response: expect.objectContaining({ code: 'FX_REMITTANCES_DISABLED' }) }); expect(prisma.remittance.create).not.toHaveBeenCalled(); });
  it('rejects and writes no movement when outgoing position is unavailable', async () => { state.positions[0].reviewStatus = 'UNREVIEWED'; await expect(service().ingest(7, event())).rejects.toThrow(ConflictException); expect(prisma.currencyMovement.create).not.toHaveBeenCalled(); });
  it('rejects an atomic completion when the guarded saldo update loses the race', async () => { prisma.currencyPosition.updateMany.mockReturnValueOnce({ count: 0 }); await expect(service().ingest(7, event())).rejects.toMatchObject({ response: expect.objectContaining({ code: 'FX_INSUFFICIENT_SALDO' }) }); expect(prisma.currencyMovement.create).not.toHaveBeenCalled(); });
  it('prevents two concurrent completions from decrementing saldo twice', async () => { const large = { ...event(), foreignAmount: 60 }; const results = await Promise.allSettled([service().ingest(7, large), service().ingest(7, { ...large, sourceId: 'src-2' })]); expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1); expect(state.positions[0].saldo.toString()).toBe('40'); });
  it('unifies manual remittances in the listing without representing them as provider callbacks', async () => {
    prisma.remittance.findMany = jest.fn().mockResolvedValue([{ id: 1, provider: 'stripe', sourceId: 'evt', status: 'COMPLETED', createdAt: new Date('2026-07-15') }]);
    prisma.transaction.findMany.mockResolvedValue([{ id: 9, operationKind: 'REMITTANCE', type: 'COMPRA', amount: new Decimal(10), rate: new Decimal(260), totalCup: new Decimal(2600), createdAt: new Date('2026-07-16'), currency: { id: 2, code: 'USD' } }]);
    const result = await service().list(7);
    expect(result[0]).toEqual(expect.objectContaining({ id: 'transaction:9', origin: 'MANUAL', provider: null, status: 'COMPLETED' }));
    expect(result[1]).toEqual(expect.objectContaining({ id: 1, origin: 'PROVIDER', provider: 'stripe' }));
  });
});
