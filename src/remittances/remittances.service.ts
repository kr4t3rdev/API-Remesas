import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrencyMovementType, Prisma, RemittanceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../database/prisma/prisma.service';
import { FxOperationsService } from '../fx-operations/fx-operations.service';
import { RemittanceEventDto } from './dto/remittance-event.dto';

@Injectable()
export class RemittancesService {
  constructor(private readonly prisma: PrismaService, private readonly fxOperations: FxOperationsService, private readonly config: ConfigService) {}

  resolveProviderTenant(token?: string): number {
    if (!token) throw new UnauthorizedException('Invalid provider authentication');
    const configuredMappings = this.config.get<string>('REMITTANCE_PROVIDER_TENANT_TOKENS');
    if (configuredMappings) {
      try {
        const tenant = (JSON.parse(configuredMappings) as Record<string, unknown>)[token];
        if (Number.isInteger(tenant) && Number(tenant) > 0) return Number(tenant);
      } catch {
        throw new UnauthorizedException('Invalid provider authentication');
      }
    }
    const legacyToken = this.config.get<string>('REMITTANCE_PROVIDER_TOKEN');
    const legacyUserId = Number(this.config.get<string>('REMITTANCE_PROVIDER_USER_ID'));
    if (legacyToken === token && Number.isInteger(legacyUserId) && legacyUserId > 0) return legacyUserId;
    throw new UnauthorizedException('Invalid provider authentication');
  }

  assertProviderToken(token?: string) {
    return this.resolveProviderTenant(token);
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
    const existing = await this.prisma.remittance.findUnique({ where: { userId_provider_sourceId: { userId, provider: event.provider, sourceId: event.sourceId } }, include: { movements: true } });
    if (existing) {
      if (existing.status === RemittanceStatus.COMPLETED) return { ...existing, duplicate: true };
      if (event.status === RemittanceStatus.COMPLETED) return this.complete(userId, event);
      return existing;
    }
    if (event.status !== RemittanceStatus.COMPLETED) {
      try {
        return await this.prisma.remittance.create({ data: { userId, provider: event.provider, sourceId: event.sourceId, status: event.status, idempotencyKey: event.idempotencyKey } });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          const duplicate = await this.prisma.remittance.findUnique({ where: { userId_provider_sourceId: { userId, provider: event.provider, sourceId: event.sourceId } } });
          if (duplicate) return { ...duplicate, duplicate: true };
        }
        throw error;
      }
    }
    return this.complete(userId, event);
  }

  private async complete(userId: number, event: RemittanceEventDto) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.completeOnce(userId, event);
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2034' || attempt === 2) throw error;
      }
    }
    throw new ConflictException('Unable to complete remittance');
  }

  private async completeOnce(userId: number, event: RemittanceEventDto) {
    try {
      return await this.prisma.$transaction(async (tx: any) => {
      const current = await tx.remittance.findUnique({ where: { userId_provider_sourceId: { userId, provider: event.provider, sourceId: event.sourceId } } });
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
      const debited = await tx.currencyPosition.updateMany({
        where: { id: outgoing.id, reviewStatus: 'REVIEWED', saldo: { gte: foreignAmount } },
        data: { saldo: { decrement: foreignAmount } },
      });
      if (debited.count !== 1) throw new ConflictException({ code: 'FX_INSUFFICIENT_SALDO', message: 'Insufficient saldo for remittance' });
      const saleMovement = await tx.currencyMovement.create({ data: { userId, currencyId: event.foreignCurrencyId, positionId: outgoing.id, type: CurrencyMovementType.REMITTANCE, amount: foreignAmount.neg(), rate, costSnapshot, realizedProfit, remittanceId: remittance.id } });
      const purchaseMovement = await tx.currencyMovement.create({ data: { userId, currencyId: event.localCurrencyId, positionId: incoming.id, type: CurrencyMovementType.REMITTANCE, amount: localAmount, rate, costSnapshot: rate, realizedProfit: null, remittanceId: remittance.id } });
      const nextSaldo = new Decimal(incoming.saldo).add(localAmount); const currentCost = new Decimal(incoming.costoPromedio ?? 0);
      const nextCost = nextSaldo.eq(0) ? rate : new Decimal(incoming.saldo).mul(currentCost).add(localAmount.mul(rate)).div(nextSaldo);
      await tx.currencyPosition.update({ where: { id: incoming.id }, data: { saldo: nextSaldo, costoPromedio: nextCost, reviewStatus: 'REVIEWED' } });
      if (current) await tx.remittance.update({ where: { id: current.id }, data: { status: RemittanceStatus.COMPLETED } });
      await tx.cashBalance.upsert({ where: { userId_currencyId: { userId, currencyId: event.foreignCurrencyId } }, update: { balance: { decrement: foreignAmount } }, create: { userId, currencyId: event.foreignCurrencyId, balance: foreignAmount.neg() } });
      await tx.cashBalance.upsert({ where: { userId_currencyId: { userId, currencyId: event.localCurrencyId } }, update: { balance: { increment: localAmount } }, create: { userId, currencyId: event.localCurrencyId, balance: localAmount } });
      return { ...remittance, status: RemittanceStatus.COMPLETED, movements: [saleMovement, purchaseMovement], realizedProfit };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await this.prisma.remittance.findUnique({ where: { userId_provider_sourceId: { userId, provider: event.provider, sourceId: event.sourceId } } });
        if (existing?.status === RemittanceStatus.COMPLETED) return { ...existing, duplicate: true };
      }
      throw error;
    }
  }

  async list(userId: number) {
    const [providerRemittances, manualRemittances] = await Promise.all([
      this.prisma.remittance.findMany({ where: { userId }, include: { movements: true }, orderBy: { createdAt: 'desc' } }),
      this.prisma.transaction.findMany({
        where: { userId, operationKind: 'REMITTANCE' },
        include: { currency: true, fxMovements: true, sourceBankAccount: true, destinationBankAccount: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return [
      ...providerRemittances.map((remittance) => ({ ...remittance, origin: 'PROVIDER' as const })),
      ...manualRemittances.map((transaction) => ({
        id: `transaction:${transaction.id}`,
        transactionId: transaction.id,
        origin: 'MANUAL' as const,
        provider: null,
        sourceId: null,
        status: 'COMPLETED' as const,
        operationKind: transaction.operationKind,
        type: transaction.type,
        currency: transaction.currency,
        amount: Number(transaction.amount),
        rate: Number(transaction.rate),
        totalCup: Number(transaction.totalCup),
        sourceType: transaction.sourceType,
        destinationType: transaction.destinationType,
        sourceBankAccount: transaction.sourceBankAccount,
        destinationBankAccount: transaction.destinationBankAccount,
        movements: transaction.fxMovements,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      })),
    ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  async retry(userId: number, id: number, event: RemittanceEventDto) {
    const current = await this.prisma.remittance.findFirst({ where: { id, userId } });
    if (!current) throw new ConflictException({ code: 'REMITTANCE_NOT_FOUND', message: 'Remittance not found' });
    return this.ingest(userId, { ...event, provider: current.provider, sourceId: current.sourceId, status: RemittanceStatus.COMPLETED });
  }

  async reconcile(userId: number) {
    const [remittances, movements, manualRemittances] = await Promise.all([
      this.prisma.remittance.findMany({ where: { userId, status: RemittanceStatus.COMPLETED } }),
      this.prisma.currencyMovement.findMany({ where: { userId, type: CurrencyMovementType.REMITTANCE } }),
      this.prisma.transaction.count({ where: { userId, operationKind: 'REMITTANCE' } }),
    ]);
    return {
      ok: remittances.every((r: any) => movements.some((m: any) => m.remittanceId === r.id)),
      completedRemittances: remittances.length + manualRemittances,
      providerRemittances: remittances.length,
      manualRemittances,
      linkedProviderMovements: movements.length,
      linkedMovements: movements.length,
    };
  }
}
