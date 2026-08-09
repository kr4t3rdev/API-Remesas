import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { ConflictException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { RemittancesService } from './remittances.service';

describe('RemittancesService', () => {
  const state: any = { remittances: [], positions: [], movements: [], cash: [] };
  const prisma: any = { user: {}, currency: {}, remittance: {}, transaction: {}, $transaction: jest.fn(async (cb) => cb(prisma)), currencyPosition: {}, currencyMovement: {}, cashBalance: {} };
  const config: any = { get: jest.fn() };
  beforeEach(() => {
    jest.clearAllMocks(); state.remittances = []; state.movements = []; state.cash = [{ userId: 7, currencyId: 1, balance: new Decimal(10000) }];
    state.positions = [{ id: 1, userId: 7, currencyId: 2, saldo: new Decimal(100), costoPromedio: new Decimal(250), reviewStatus: 'REVIEWED' }, { id: 2, userId: 7, currencyId: 1, saldo: new Decimal(10000), costoPromedio: new Decimal(1), reviewStatus: 'REVIEWED' }];
    config.get.mockImplementation((key: string) => ({ FX_REMITTANCES_ENABLED: 'true', REMITTANCE_PROVIDER_TOKEN: 'secret', REMITTANCE_PROVIDER_USER_ID: '7' })[key]);
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 7, primaryCurrencyId: 1, primaryCurrency: { id: 1, code: 'CUP', isActive: true } });
    prisma.currency.findUnique = jest.fn().mockImplementation(({ where }: any) => Promise.resolve(where.id === 2 ? { id: 2, code: 'USD', isActive: true } : { id: where.id, code: 'CUP', isActive: true }));
    prisma.remittance.findUnique = jest.fn().mockImplementation(({ where }: any) => state.remittances.find((r: any) => r.userId === where.userId_provider_sourceId.userId && r.provider === where.userId_provider_sourceId.provider && r.sourceId === where.userId_provider_sourceId.sourceId) ?? null);
    prisma.remittance.findFirst = jest.fn().mockImplementation(({ where }: any) => state.remittances.find((r: any) => r.id === where.id && r.userId === where.userId) ?? null);
    prisma.remittance.create = jest.fn().mockImplementation(({ data }: any) => { const r = { id: state.remittances.length + 1, ...data }; state.remittances.push(r); return r; });
    prisma.remittance.update = jest.fn().mockImplementation(({ where, data }: any) => { const r = state.remittances.find((x: any) => x.id === where.id); Object.assign(r, data); return r; });
    prisma.currencyPosition.findUnique = jest.fn().mockImplementation(({ where }: any) => state.positions.find((p: any) => p.userId === where.userId_currencyId.userId && p.currencyId === where.userId_currencyId.currencyId) ?? null);
    prisma.currencyPosition.updateMany = jest.fn().mockImplementation(({ where, data }: any) => { const p = state.positions.find((x: any) => x.id === where.id && x.reviewStatus === where.reviewStatus && x.saldo.gte(where.saldo.gte)); if (!p) return { count: 0 }; p.saldo = p.saldo.sub(data.saldo.decrement); return { count: 1 }; });
    prisma.currencyPosition.update = jest.fn().mockImplementation(({ where, data }: any) => { const p = state.positions.find((x: any) => x.id === where.id); if (data.saldo?.decrement) p.saldo = p.saldo.sub(data.saldo.decrement); else if (data.saldo?.increment) p.saldo = p.saldo.add(data.saldo.increment); else Object.assign(p, data); return p; });
    prisma.cashBalance.updateMany = jest.fn().mockImplementation(({ where, data }: any) => { const cash = state.cash.find((x: any) => x.userId === where.userId && x.currencyId === where.currencyId && x.balance.gte(where.balance.gte)); if (!cash) return { count: 0 }; cash.balance = cash.balance.sub(data.balance.decrement); return { count: 1 }; });
    prisma.cashBalance.upsert = jest.fn().mockImplementation(({ where, update, create }: any) => { const cash = state.cash.find((x: any) => x.userId === where.userId_currencyId.userId && x.currencyId === where.userId_currencyId.currencyId); if (cash) cash.balance = cash.balance.add(update.balance.increment); else state.cash.push(create); return cash ?? create; });
    prisma.currencyMovement.create = jest.fn().mockImplementation(({ data }: any) => { const m = { id: state.movements.length + 1, ...data }; state.movements.push(m); return m; });
    prisma.transaction.findMany = jest.fn().mockResolvedValue([]);
  });
  const service = () => new RemittancesService(prisma, { constructor: { assertSaleAvailable: (position: any, amount: Decimal) => { if (position.reviewStatus !== 'REVIEWED' || position.saldo.lt(amount)) throw new Error('unavailable'); } } } as any, config);
  const event: any = (status = 'COMPLETED') => ({ userId: 7, provider: 'stripe', sourceId: 'src-1', status, foreignCurrencyId: 2, foreignAmount: 10, localCurrencyId: 1, localAmount: 2700, rate: 270 });
  it('completes a remittance as an automatic purchase of foreign currency', async () => {
    const result = await service().ingest(7, event());
    expect(result.status).toBe('COMPLETED');
    expect(prisma.currencyMovement.create).toHaveBeenCalledTimes(2);
    expect(state.positions[0].saldo.toString()).toBe('110');
    expect(state.positions[1].saldo.toString()).toBe('10000');
    expect(state.cash.find((cash: any) => cash.currencyId === 2)?.balance.toString()).toBe('10');
    expect(state.cash.find((cash: any) => cash.currencyId === 1)?.balance.toString()).toBe('7300');
    expect(result.realizedProfit).toBeNull();
    expect(prisma.currencyMovement.create).toHaveBeenNthCalledWith(1, expect.objectContaining({ data: expect.objectContaining({ currencyId: 2, amount: new Decimal(10), realizedProfit: null }) }));
    expect(prisma.currencyMovement.create).toHaveBeenNthCalledWith(2, expect.objectContaining({ data: expect.objectContaining({ currencyId: 1, amount: new Decimal(-2700), realizedProfit: null }) }));
  });
  it('uses CUP cash as the source without requiring or decrementing a CUP currency position', async () => {
    state.positions = state.positions.filter((position: any) => position.currencyId !== 1);

    const result = await service().ingest(7, event());

    expect(result.status).toBe('COMPLETED');
    expect(state.positions).toHaveLength(1);
    expect(state.positions[0]).toEqual(expect.objectContaining({ currencyId: 2, saldo: new Decimal(110) }));
    expect(state.cash.find((cash: any) => cash.currencyId === 1)?.balance).toEqual(new Decimal(7300));
    expect(prisma.currencyMovement.create).toHaveBeenNthCalledWith(2, expect.objectContaining({
      data: expect.objectContaining({ currencyId: 1, positionId: null, amount: new Decimal(-2700) }),
    }));
  });
  it.each([
    ['swapped roles', { localCurrencyId: 2, foreignCurrencyId: 1 }],
    ['same primary currency on both legs', { localCurrencyId: 1, foreignCurrencyId: 1 }],
  ])('rejects provider remittance %s before writes', async (_label, override) => {
    await expect(service().ingest(7, { ...event(), ...override })).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'REMITTANCE_INVALID_CURRENCY_ROLES' }),
    });
    expect(prisma.remittance.create).not.toHaveBeenCalled();
    expect(prisma.currencyMovement.create).not.toHaveBeenCalled();
  });
  it('rejects an inactive foreign currency before writes', async () => {
    prisma.currency.findUnique.mockResolvedValueOnce({ id: 2, code: 'USD', isActive: false });

    await expect(service().ingest(7, event())).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'REMITTANCE_INVALID_CURRENCY_ROLES' }),
    });
    expect(prisma.remittance.create).not.toHaveBeenCalled();
  });
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
  it('rejects a remittance whose local amount does not match the foreign amount and rate', async () => {
    await expect(service().ingest(7, { ...event(), localAmount: 2600 })).rejects.toMatchObject({
      response: expect.objectContaining({ code: 'REMITTANCE_AMOUNT_MISMATCH' }),
    });
    expect(prisma.remittance.create).not.toHaveBeenCalled();
    expect(prisma.currencyMovement.create).not.toHaveBeenCalled();
  });
  it('persists a provider failure after a pending callback', async () => {
    await service().ingest(7, event('PENDING'));

    const result = await service().ingest(7, event('FAILED'));

    expect(result.status).toBe('FAILED');
    expect(prisma.remittance.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: { status: 'FAILED' },
    }));
  });
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
  it('rejects and writes no movement when the destination position is unavailable', async () => { state.positions[0].reviewStatus = 'UNREVIEWED'; await expect(service().ingest(7, event())).rejects.toThrow(ConflictException); expect(prisma.currencyMovement.create).not.toHaveBeenCalled(); });
  it('rejects when local source cash is missing or insufficient', async () => {
    state.cash = [];
    await expect(service().ingest(7, event())).rejects.toMatchObject({ response: expect.objectContaining({ code: 'FX_INSUFFICIENT_CASH' }) });
    expect(prisma.currencyMovement.create).not.toHaveBeenCalled();
  });
  it('prevents two concurrent completions from spending the same local source cash', async () => { const large = { ...event(), foreignAmount: 20, localAmount: 5400 }; const results = await Promise.allSettled([service().ingest(7, large), service().ingest(7, { ...large, sourceId: 'src-2' })]); expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1); expect(state.positions[0].saldo.toString()).toBe('120'); expect(state.positions[1].saldo.toString()).toBe('10000'); expect(state.cash.find((cash: any) => cash.currencyId === 1).balance.toString()).toBe('4600'); });
  it('unifies manual remittances in the listing without representing them as provider callbacks', async () => {
    prisma.remittance.findMany = jest.fn().mockResolvedValue([{ id: 1, provider: 'stripe', sourceId: 'evt', status: 'COMPLETED', createdAt: new Date('2026-07-15') }]);
    prisma.transaction.findMany.mockResolvedValue([{ id: 9, operationKind: 'REMITTANCE', type: 'COMPRA', amount: new Decimal(10), rate: new Decimal(260), totalCup: new Decimal(2600), createdAt: new Date('2026-07-16'), currency: { id: 2, code: 'USD' } }]);
    const result = await service().list(7);
    expect(result[0]).toEqual(expect.objectContaining({ id: 'transaction:9', origin: 'MANUAL', provider: null, status: 'COMPLETED' }));
    expect(result[1]).toEqual(expect.objectContaining({ id: 1, origin: 'PROVIDER', provider: 'stripe' }));
  });

  it('reconciles movements, positions, cash and completed provider remittances', async () => {
    prisma.remittance.findMany = jest.fn().mockResolvedValue([{ id: 1, userId: 7, status: 'COMPLETED' }]);
    prisma.currencyPosition.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, saldo: new Decimal(110), reviewStatus: 'REVIEWED', currency: { code: 'USD' } },
    ]);
    prisma.currencyMovement.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, positionId: 1, type: 'REMITTANCE', amount: new Decimal(10), rate: new Decimal(270), remittanceId: 1 },
      { id: 2, userId: 7, currencyId: 1, positionId: null, type: 'REMITTANCE', amount: new Decimal(-2700), rate: new Decimal(270), remittanceId: 1 },
      { id: 3, userId: 7, currencyId: 2, positionId: 1, type: 'OPENING', amount: new Decimal(100), rate: new Decimal(250), remittanceId: null },
      { id: 4, userId: 7, currencyId: 1, positionId: null, type: 'OPENING', amount: new Decimal(10000), rate: new Decimal(1), remittanceId: null },
    ]);
    prisma.cashBalance.findMany = jest.fn().mockResolvedValue([
      { userId: 7, currencyId: 2, balance: new Decimal(110), currency: { code: 'USD' } },
      { userId: 7, currencyId: 1, balance: new Decimal(7300), currency: { code: 'CUP' } },
    ]);
    prisma.transaction.count = jest.fn().mockResolvedValue(0);

    const result = await service().reconcile(7);

    expect(result.ok).toBe(true);
    expect(result.checks).toEqual({
      positionsMatchMovements: true,
      positionsNonNegative: true,
      movementsHaveValidPositions: true,
      localRemittanceMovementsValid: true,
      cashBalancesNonNegative: true,
      cashMatchesPositions: true,
      primaryCashLedgerReconciled: true,
      completedRemittancesHaveTwoMovements: true,
    });
    expect(result.positions).toEqual(expect.arrayContaining([
      expect.objectContaining({ currencyId: 2, positionSaldo: 110, movementSaldo: 110, difference: 0, cashBalance: 110, ok: true }),
    ]));
    expect(result.primaryCashLedger).toEqual(expect.objectContaining({ status: 'VERIFIED', openingBalance: 10000, remittanceDelta: -2700, expectedBalance: 7300, actualBalance: 7300, ok: true }));
  });

  it.each([
    ['positive local amount', { amount: new Decimal(2700), currencyId: 1, rate: new Decimal(270) }],
    ['wrong local currency', { amount: new Decimal(-2700), currencyId: 3, rate: new Decimal(270) }],
    ['amount that does not match the foreign leg', { amount: new Decimal(-2600), currencyId: 1, rate: new Decimal(270) }],
  ])('fails reconciliation for malformed null-position remittance movement: %s', async (_label, localLeg) => {
    prisma.remittance.findMany = jest.fn().mockResolvedValue([{ id: 1, userId: 7, status: 'COMPLETED' }]);
    prisma.currencyPosition.findMany = jest.fn().mockResolvedValue([{ id: 1, userId: 7, currencyId: 2, saldo: new Decimal(10), reviewStatus: 'REVIEWED', currency: { code: 'USD' } }]);
    prisma.currencyMovement.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, positionId: 1, type: 'REMITTANCE', amount: new Decimal(10), rate: new Decimal(270), remittanceId: 1 },
      { id: 2, userId: 7, positionId: null, type: 'REMITTANCE', remittanceId: 1, ...localLeg },
    ]);
    prisma.cashBalance.findMany = jest.fn().mockResolvedValue([{ userId: 7, currencyId: 2, balance: new Decimal(10), currency: { code: 'USD' } }, { userId: 7, currencyId: 1, balance: new Decimal(7300), currency: { code: 'CUP' } }]);
    prisma.transaction.count = jest.fn().mockResolvedValue(0);

    const result = await service().reconcile(7);

    expect(result.ok).toBe(false);
    expect(result.checks.localRemittanceMovementsValid).toBe(false);
    expect(result.remittanceIssues[0]).toEqual(expect.objectContaining({ localLegValid: false, ok: false }));
  });

  it('returns not verifiable instead of silently passing primary cash without an opening baseline', async () => {
    prisma.remittance.findMany = jest.fn().mockResolvedValue([{ id: 1, userId: 7, status: 'COMPLETED' }]);
    prisma.currencyPosition.findMany = jest.fn().mockResolvedValue([{ id: 1, userId: 7, currencyId: 2, saldo: new Decimal(10), reviewStatus: 'REVIEWED', currency: { code: 'USD' } }]);
    prisma.currencyMovement.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, positionId: 1, type: 'REMITTANCE', amount: new Decimal(10), rate: new Decimal(270), remittanceId: 1 },
      { id: 2, userId: 7, currencyId: 1, positionId: null, type: 'REMITTANCE', amount: new Decimal(-2700), rate: new Decimal(270), remittanceId: 1 },
    ]);
    prisma.cashBalance.findMany = jest.fn().mockResolvedValue([{ userId: 7, currencyId: 2, balance: new Decimal(10), currency: { code: 'USD' } }, { userId: 7, currencyId: 1, balance: new Decimal(7300), currency: { code: 'CUP' } }]);
    prisma.transaction.count = jest.fn().mockResolvedValue(0);

    const result = await service().reconcile(7);

    expect(result.ok).toBe(false);
    expect(result.checks.primaryCashLedgerReconciled).toBe(false);
    expect(result.primaryCashLedger).toEqual(expect.objectContaining({ status: 'NOT_VERIFIABLE', ok: null }));
  });

  it('reconciles opening and sale movements using their real stored sign semantics', async () => {
    prisma.remittance.findMany = jest.fn().mockResolvedValue([]);
    prisma.currencyPosition.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, saldo: new Decimal(60), reviewStatus: 'REVIEWED', currency: { code: 'USD' } },
    ]);
    prisma.currencyMovement.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, positionId: 1, type: 'OPENING', amount: new Decimal(100), remittanceId: null },
      { id: 2, userId: 7, currencyId: 2, positionId: 1, type: 'SALE', amount: new Decimal(40), remittanceId: null },
    ]);
    prisma.cashBalance.findMany = jest.fn().mockResolvedValue([
      { userId: 7, currencyId: 2, balance: new Decimal(60), currency: { code: 'USD' } },
    ]);
    prisma.transaction.count = jest.fn().mockResolvedValue(0);

    const result = await service().reconcile(7);

    expect(result.ok).toBe(true);
    expect(result.positions[0]).toEqual(expect.objectContaining({ movementSaldo: 60, cashPositionDifference: 0, ok: true }));
  });

  it('includes cash-versus-position mismatches in the overall reconciliation status', async () => {
    prisma.remittance.findMany = jest.fn().mockResolvedValue([]);
    prisma.currencyPosition.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, saldo: new Decimal(60), reviewStatus: 'REVIEWED', currency: { code: 'USD' } },
    ]);
    prisma.currencyMovement.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, positionId: 1, type: 'OPENING', amount: new Decimal(60), remittanceId: null },
    ]);
    prisma.cashBalance.findMany = jest.fn().mockResolvedValue([
      { userId: 7, currencyId: 2, balance: new Decimal(59), currency: { code: 'USD' } },
    ]);
    prisma.transaction.count = jest.fn().mockResolvedValue(0);

    const result = await service().reconcile(7);

    expect(result.ok).toBe(false);
    expect(result.checks.cashMatchesPositions).toBe(false);
    expect(result.positions[0]).toEqual(expect.objectContaining({ cashPositionDifference: -1, ok: false }));
  });

  it('marks reconciliation as failed for mismatches, invalid positions, negative cash and incomplete remittances', async () => {
    prisma.remittance.findMany = jest.fn().mockResolvedValue([{ id: 1, userId: 7, status: 'COMPLETED' }]);
    prisma.currencyPosition.findMany = jest.fn().mockResolvedValue([{ id: 1, userId: 7, currencyId: 2, saldo: new Decimal(100), reviewStatus: 'UNREVIEWED', currency: { code: 'USD' } }]);
    prisma.currencyMovement.findMany = jest.fn().mockResolvedValue([
      { id: 1, userId: 7, currencyId: 2, positionId: 99, amount: new Decimal(10), remittanceId: 1 },
    ]);
    prisma.cashBalance.findMany = jest.fn().mockResolvedValue([{ userId: 7, currencyId: 2, balance: new Decimal(-1), currency: { code: 'USD' } }]);
    prisma.transaction.count = jest.fn().mockResolvedValue(0);

    const result = await service().reconcile(7);

    expect(result.ok).toBe(false);
    expect(result.checks.positionsMatchMovements).toBe(false);
    expect(result.checks.positionsNonNegative).toBe(true);
    expect(result.checks.movementsHaveValidPositions).toBe(false);
    expect(result.checks.cashBalancesNonNegative).toBe(false);
    expect(result.checks.completedRemittancesHaveTwoMovements).toBe(false);
    expect(result.positions[0]).toEqual(expect.objectContaining({ difference: 100, movementSaldo: 0, ok: false }));
    expect(result.remittanceIssues).toEqual([expect.objectContaining({ remittanceId: 1, movementCount: 1, localLegValid: false, ok: false })]);
  });
});
