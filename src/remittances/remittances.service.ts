import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrencyMovementType, RemittanceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../database/prisma/prisma.service';
import { FxOperationsService } from '../fx-operations/fx-operations.service';
import { RemittanceEventDto } from './dto/remittance-event.dto';

@Injectable()
export class RemittancesService {
  constructor(private readonly prisma: PrismaService, private readonly fxOperations: FxOperationsService, private readonly config: ConfigService) {}

  assertProviderToken(token?: string) {
    const expected = this.config.get<string>('REMITTANCE_PROVIDER_TOKEN');
    if (!expected || token !== expected) throw new UnauthorizedException('Invalid provider authentication');
  }

  private validateEvent(event: RemittanceEventDto) {
    if (!event.provider?.trim() || !event.sourceId?.trim() || event.foreignCurrencyId === event.localCurrencyId || event.foreignAmount <= 0 || event.localAmount <= 0 || event.rate <= 0) {
      throw new UnprocessableEntityException({ code: 'REMITTANCE_INVALID_EVENT', message: 'Remittance event is invalid' });
    }
  }

  private ensureEnabled() {
    if (this.config.get<string>('FX_REMITTANCES_ENABLED') === 'false') throw new ConflictException({ code: 'FX_REMITTANCES_DISABLED', message: 'Remittance ingestion is disabled' });
  }

  async ingest(userId: number, event: RemittanceEventDto) {
    this.ensureEnabled();
    this.validateEvent(event);
    const existing = await this.prisma.remittance.findUnique({ where: { provider_sourceId: { provider: event.provider, sourceId: event.sourceId } }, include: { movements: true } });
    if (existing) {
      if (existing.status === RemittanceStatus.COMPLETED) return { ...existing, duplicate: true };
      if (event.status === RemittanceStatus.COMPLETED) return this.complete(userId, event);
      return existing;
    }
    if (event.status !== RemittanceStatus.COMPLETED) {
      return this.prisma.remittance.create({ data: { userId, provider: event.provider, sourceId: event.sourceId, status: event.status, idempotencyKey: event.idempotencyKey } });
    }
    return this.complete(userId, event);
  }

  private async complete(userId: number, event: RemittanceEventDto) {
    return this.prisma.$transaction(async (tx: any) => {
      const current = await tx.remittance.findUnique({ where: { provider_sourceId: { provider: event.provider, sourceId: event.sourceId } } });
      if (current?.status === RemittanceStatus.COMPLETED) return { ...current, duplicate: true };
      const outgoing = await tx.currencyPosition.findUnique({ where: { userId_currencyId: { userId, currencyId: event.foreignCurrencyId } } });
      if (!outgoing || outgoing.reviewStatus !== 'REVIEWED') throw new ConflictException({ code: 'FX_POSITION_UNAVAILABLE', message: 'Currency position is unavailable for remittance' });
      const assertSaleAvailable = (this.fxOperations as any)?.constructor?.assertSaleAvailable ?? FxOperationsService.assertSaleAvailable;
      try { assertSaleAvailable(outgoing, new Decimal(event.foreignAmount)); } catch { throw new ConflictException({ code: 'FX_INSUFFICIENT_SALDO', message: 'Insufficient saldo for remittance' }); }
      const incoming = await tx.currencyPosition.findUnique({ where: { userId_currencyId: { userId, currencyId: event.localCurrencyId } } });
      if (!incoming) throw new ConflictException({ code: 'FX_POSITION_UNAVAILABLE', message: 'Destination currency position is unavailable' });
      const remittance = current ?? await tx.remittance.create({ data: { userId, provider: event.provider, sourceId: event.sourceId, status: RemittanceStatus.COMPLETED, idempotencyKey: event.idempotencyKey } });
      const foreignAmount = new Decimal(event.foreignAmount); const localAmount = new Decimal(event.localAmount); const rate = new Decimal(event.rate);
      const costSnapshot = new Decimal(outgoing.costoPromedio ?? 0); const realizedProfit = rate.sub(costSnapshot).mul(foreignAmount);
      const saleMovement = await tx.currencyMovement.create({ data: { userId, currencyId: event.foreignCurrencyId, positionId: outgoing.id, type: CurrencyMovementType.REMITTANCE, amount: foreignAmount.neg(), rate, costSnapshot, realizedProfit, remittanceId: remittance.id } });
      const purchaseMovement = await tx.currencyMovement.create({ data: { userId, currencyId: event.localCurrencyId, positionId: incoming.id, type: CurrencyMovementType.REMITTANCE, amount: localAmount, rate, costSnapshot: rate, realizedProfit: null, remittanceId: remittance.id } });
      await tx.currencyPosition.update({ where: { id: outgoing.id }, data: { saldo: { decrement: foreignAmount } } });
      const nextSaldo = new Decimal(incoming.saldo).add(localAmount); const currentCost = new Decimal(incoming.costoPromedio ?? 0);
      const nextCost = nextSaldo.eq(0) ? rate : new Decimal(incoming.saldo).mul(currentCost).add(localAmount.mul(rate)).div(nextSaldo);
      await tx.currencyPosition.update({ where: { id: incoming.id }, data: { saldo: nextSaldo, costoPromedio: nextCost, reviewStatus: 'REVIEWED' } });
      if (current) await tx.remittance.update({ where: { id: current.id }, data: { status: RemittanceStatus.COMPLETED } });
      await tx.cashBalance.upsert({ where: { userId_currencyId: { userId, currencyId: event.foreignCurrencyId } }, update: { balance: { decrement: foreignAmount } }, create: { userId, currencyId: event.foreignCurrencyId, balance: foreignAmount.neg() } });
      await tx.cashBalance.upsert({ where: { userId_currencyId: { userId, currencyId: event.localCurrencyId } }, update: { balance: { increment: localAmount } }, create: { userId, currencyId: event.localCurrencyId, balance: localAmount } });
      return { ...remittance, status: RemittanceStatus.COMPLETED, movements: [saleMovement, purchaseMovement], realizedProfit };
    });
  }

  async list(userId: number) { return this.prisma.remittance.findMany({ where: { userId }, include: { movements: true }, orderBy: { createdAt: 'desc' } }); }

  async retry(userId: number, id: number, event: RemittanceEventDto) {
    const current = await this.prisma.remittance.findFirst({ where: { id, userId } });
    if (!current) throw new ConflictException({ code: 'REMITTANCE_NOT_FOUND', message: 'Remittance not found' });
    return this.ingest(userId, { ...event, provider: current.provider, sourceId: current.sourceId, status: RemittanceStatus.COMPLETED });
  }

  async reconcile(userId: number) {
    const [remittances, movements] = await Promise.all([this.prisma.remittance.findMany({ where: { userId, status: RemittanceStatus.COMPLETED } }), this.prisma.currencyMovement.findMany({ where: { userId, type: CurrencyMovementType.REMITTANCE } })]);
    return { ok: remittances.every((r: any) => movements.some((m: any) => m.remittanceId === r.id)), completedRemittances: remittances.length, linkedMovements: movements.length };
  }
}
