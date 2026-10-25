import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrencyMovementType, Prisma, RemittanceStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../database/prisma/prisma.service';
import { toDecimalString } from '../common/utils/decimal-serialization';
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
    const foreignAmount = new Decimal(event.foreignAmount);
    const localAmount = new Decimal(event.localAmount);
    const rate = new Decimal(event.rate);
    if (
      !event.provider?.trim()
      || !event.sourceId?.trim()
      || foreignAmount.lessThanOrEqualTo(0)
      || localAmount.lessThanOrEqualTo(0)
      || rate.lessThanOrEqualTo(0)
    ) {
      throw new UnprocessableEntityException({ code: 'REMITTANCE_INVALID_EVENT', message: 'Remittance event is invalid' });
    }
    const expectedLocalAmount = foreignAmount.mul(rate).toDecimalPlaces(2);
    const actualLocalAmount = localAmount.toDecimalPlaces(2);
    if (!actualLocalAmount.eq(expectedLocalAmount)) {
      throw new UnprocessableEntityException({
        code: 'REMITTANCE_AMOUNT_MISMATCH',
        message: 'Remittance local amount must equal foreign amount multiplied by the exchange rate',
      });
    }
  }

  private async validateCurrencyRoles(userId: number, event: RemittanceEventDto) {
    const [user, foreignCurrency] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          primaryCurrencyId: true,
          primaryCurrency: { select: { id: true, code: true, isActive: true } },
        },
      }),
      this.prisma.currency.findUnique({ where: { id: event.foreignCurrencyId } }),
    ]);
    const primaryCurrency = user?.primaryCurrency;
    if (
      !primaryCurrency?.isActive
      || event.localCurrencyId !== primaryCurrency.id
      || !foreignCurrency?.isActive
      || foreignCurrency.id === primaryCurrency.id
    ) {
      throw new UnprocessableEntityException({
        code: 'REMITTANCE_INVALID_CURRENCY_ROLES',
        message: 'Remittance local currency must be the active configured primary currency and foreign currency must be active and different',
      });
    }
  }

  private ensureEnabled() {
    if (this.config.get<string>('FX_REMITTANCES_ENABLED') === 'false') throw new ConflictException({ code: 'FX_REMITTANCES_DISABLED', message: 'Remittance ingestion is disabled' });
  }

  async ingest(userId: number, event: RemittanceEventDto) {
    this.ensureEnabled();
    this.validateEvent(event);
    await this.validateCurrencyRoles(userId, event);
    const existing = await this.prisma.remittance.findUnique({ where: { userId_provider_sourceId: { userId, provider: event.provider, sourceId: event.sourceId } }, include: { movements: true } });
    if (existing) {
      if (existing.status === RemittanceStatus.COMPLETED) return { ...existing, duplicate: true };
      if (event.status === RemittanceStatus.COMPLETED) return this.complete(userId, event);
      if (existing.status === RemittanceStatus.PENDING && event.status === RemittanceStatus.FAILED) {
        return this.prisma.remittance.update({ where: { id: existing.id }, data: { status: RemittanceStatus.FAILED } });
      }
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
      const remittance = current ?? await tx.remittance.create({ data: { userId, provider: event.provider, sourceId: event.sourceId, status: RemittanceStatus.COMPLETED, idempotencyKey: event.idempotencyKey } });
      const foreignAmount = new Decimal(event.foreignAmount); const localAmount = new Decimal(event.localAmount); const rate = new Decimal(event.rate);
      const sourceCash = await tx.cashBalance.updateMany({
        where: { userId, currencyId: event.localCurrencyId, balance: { gte: localAmount } },
        data: { balance: { decrement: localAmount } },
      });
      if (sourceCash.count !== 1) throw new ConflictException({ code: 'FX_INSUFFICIENT_CASH', message: 'Insufficient cash for remittance' });

      const destination = await tx.currencyPosition.findUnique({ where: { userId_currencyId: { userId, currencyId: event.foreignCurrencyId } } });
      if (destination?.reviewStatus === 'UNREVIEWED' && !new Decimal(destination.saldo).eq(0)) {
        throw new ConflictException({ code: 'FX_POSITION_UNAVAILABLE', message: 'Destination currency position requires opening review' });
      }
      const destinationPosition = destination ?? await tx.currencyPosition.create({
        data: { userId, currencyId: event.foreignCurrencyId, saldo: 0, costoPromedio: 0, reviewStatus: 'REVIEWED', reviewedAt: new Date() },
      });
      const destinationSaldo = new Decimal(destinationPosition.saldo).add(foreignAmount);
      const destinationCost = new Decimal(destinationPosition.costoPromedio ?? 0);
      const nextCost = destinationSaldo.eq(0) ? rate : new Decimal(destinationPosition.saldo).mul(destinationCost).add(foreignAmount.mul(rate)).div(destinationSaldo);
      const purchaseMovement = await tx.currencyMovement.create({ data: { userId, currencyId: event.foreignCurrencyId, positionId: destinationPosition.id, type: CurrencyMovementType.REMITTANCE, amount: foreignAmount, rate, costSnapshot: rate, realizedProfit: null, remittanceId: remittance.id } });
      const cashMovement = await tx.currencyMovement.create({ data: { userId, currencyId: event.localCurrencyId, positionId: null, type: CurrencyMovementType.REMITTANCE, amount: localAmount.neg(), rate, costSnapshot: null, realizedProfit: null, remittanceId: remittance.id } });
      if (destination) {
        await tx.currencyPosition.update({ where: { id: destination.id }, data: { saldo: destinationSaldo, costoPromedio: nextCost, reviewStatus: 'REVIEWED', reviewedAt: destination.reviewedAt ?? new Date() } });
      } else {
        await tx.currencyPosition.update({ where: { id: destinationPosition.id }, data: { saldo: destinationSaldo, costoPromedio: nextCost } });
      }
      if (current) await tx.remittance.update({ where: { id: current.id }, data: { status: RemittanceStatus.COMPLETED } });
      await tx.cashBalance.upsert({ where: { userId_currencyId: { userId, currencyId: event.foreignCurrencyId } }, update: { balance: { increment: foreignAmount } }, create: { userId, currencyId: event.foreignCurrencyId, balance: foreignAmount } });
      return { ...remittance, status: RemittanceStatus.COMPLETED, movements: [purchaseMovement, cashMovement], realizedProfit: null };
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
    const [user, remittances, positions, movements, cashBalances, manualRemittances] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { primaryCurrencyId: true, primaryCurrency: { select: { id: true, code: true, isActive: true } } },
      }),
      this.prisma.remittance.findMany({ where: { userId, status: RemittanceStatus.COMPLETED } }),
      this.prisma.currencyPosition.findMany({ where: { userId }, include: { currency: { select: { code: true, symbol: true } } } }),
      this.prisma.currencyMovement.findMany({ where: { userId }, include: { currency: { select: { code: true } } } }),
      this.prisma.cashBalance.findMany({ where: { userId }, include: { currency: { select: { code: true } } } }),
      this.prisma.transaction.count({ where: { userId, operationKind: 'REMITTANCE' } }),
    ]);

    const positionsById = new Map(positions.map((position: any) => [position.id, position]));
    const movementsByPosition = new Map<number, Decimal>();
    const movementCountByPosition = new Map<number, number>();
    const movementsByRemittance = new Map<number, any[]>();
    let movementsHaveValidPositions = true;
    const primaryCurrencyId = user?.primaryCurrency?.isActive ? user.primaryCurrency.id : null;

    for (const movement of movements as any[]) {
      const position = movement.positionId ? positionsById.get(movement.positionId) : null;
      if (!movement.positionId) {
        const isPrimaryCashMovement = movement.currencyId === primaryCurrencyId
          && (movement.type === CurrencyMovementType.REMITTANCE || movement.type === CurrencyMovementType.OPENING);
        if (!isPrimaryCashMovement) movementsHaveValidPositions = false;
      } else if (!position || position.userId !== userId || position.currencyId !== movement.currencyId) {
        movementsHaveValidPositions = false;
      } else {
        const amount = new Decimal(movement.amount);
        const delta = movement.type === CurrencyMovementType.SALE ? amount.abs().neg() : amount;
        const current = movementsByPosition.get(movement.positionId) ?? new Decimal(0);
        movementsByPosition.set(movement.positionId, current.add(delta));
        movementCountByPosition.set(movement.positionId, (movementCountByPosition.get(movement.positionId) ?? 0) + 1);
      }
      if (movement.remittanceId) {
        const remittanceMovements = movementsByRemittance.get(movement.remittanceId) ?? [];
        remittanceMovements.push(movement);
        movementsByRemittance.set(movement.remittanceId, remittanceMovements);
      }
    }

    const positionsReport = (positions as any[]).map((position) => {
      const positionSaldo = new Decimal(position.saldo);
      const movementSaldo = movementsByPosition.get(position.id) ?? new Decimal(0);
      const cash = (cashBalances as any[]).find((balance) => balance.currencyId === position.currencyId);
      const difference = positionSaldo.sub(movementSaldo);
      const cashBalance = cash ? new Decimal(cash.balance) : null;
      return {
        currencyId: position.currencyId,
        currency: position.currency,
        positionSaldo,
        movementSaldo,
        difference,
        cashBalance,
        cashPositionDifference: cashBalance?.sub(positionSaldo) ?? null,
        reviewStatus: position.reviewStatus,
        movementCount: movementCountByPosition.get(position.id) ?? 0,
        ok: difference.eq(0) && positionSaldo.gte(0) && cashBalance !== null && cashBalance.eq(positionSaldo),
      };
    });

    const remittanceIssues = (remittances as any[]).map((remittance) => {
      const linkedMovements = movementsByRemittance.get(remittance.id) ?? [];
      const localLegs = linkedMovements.filter((movement) => movement.positionId == null && movement.type === CurrencyMovementType.REMITTANCE);
      const foreignLegs = linkedMovements.filter((movement) => movement.positionId != null && movement.type === CurrencyMovementType.REMITTANCE);
      const localLeg = localLegs[0];
      const foreignLeg = foreignLegs[0];
      const expectedLocalAmount = foreignLeg
        ? new Decimal(foreignLeg.amount).abs().mul(new Decimal(foreignLeg.rate)).toDecimalPlaces(2)
        : null;
      const localLegValid = localLegs.length === 1
        && foreignLegs.length === 1
        && localLeg.currencyId === primaryCurrencyId
        && new Decimal(localLeg.amount).isNegative()
        && expectedLocalAmount !== null
        && new Decimal(localLeg.amount).abs().eq(expectedLocalAmount)
        && new Decimal(localLeg.rate).eq(new Decimal(foreignLeg.rate));
      const movementCount = linkedMovements.length;
      return { remittanceId: remittance.id, movementCount, localLegValid, ok: movementCount === 2 && localLegValid };
    });

    const providerLocalMovements = (movements as any[]).filter((movement) =>
      movement.positionId == null
      && movement.type === CurrencyMovementType.REMITTANCE
      && movement.currencyId === primaryCurrencyId,
    );
    const primaryOpenings = (movements as any[]).filter((movement) =>
      movement.positionId == null
      && movement.type === CurrencyMovementType.OPENING
      && movement.currencyId === primaryCurrencyId
      && new Decimal(movement.amount).isPositive(),
    );
    const primaryCash = (cashBalances as any[]).find((balance) => balance.currencyId === primaryCurrencyId);
    let primaryCashLedger: any;
    if (remittances.length === 0) {
      primaryCashLedger = { status: 'NOT_APPLICABLE', ok: true };
    } else if (primaryOpenings.length !== 1 || !primaryCash) {
      primaryCashLedger = {
        status: 'NOT_VERIFIABLE',
        ok: null,
        reason: 'No unique primary-cash opening baseline exists in the movement ledger',
      };
    } else {
      const openingBalance = new Decimal(primaryOpenings[0].amount);
      const remittanceDelta = providerLocalMovements.reduce((total, movement) => total.add(new Decimal(movement.amount)), new Decimal(0));
      const expectedBalance = openingBalance.add(remittanceDelta);
      const actualBalance = new Decimal(primaryCash.balance);
      primaryCashLedger = {
        status: 'VERIFIED',
        openingBalance,
        remittanceDelta,
        expectedBalance,
        actualBalance,
        difference: actualBalance.sub(expectedBalance),
        ok: actualBalance.eq(expectedBalance),
      };
    }
    const checks = {
      positionsMatchMovements: positionsReport.every((position) => position.difference.isZero()),
      positionsNonNegative: positionsReport.every((position) => position.positionSaldo.gte(0)),
      movementsHaveValidPositions,
      localRemittanceMovementsValid: remittanceIssues.every((remittance) => remittance.localLegValid),
      cashBalancesNonNegative: (cashBalances as any[]).every((cash) => new Decimal(cash.balance).gte(0)),
      cashMatchesPositions: positionsReport.every((position) => position.cashPositionDifference !== null && position.cashPositionDifference.isZero()),
      primaryCashLedgerReconciled: primaryCashLedger.ok === true,
      completedRemittancesHaveTwoMovements: remittanceIssues.every((remittance) => remittance.movementCount === 2),
    };

    return {
      ok: Object.values(checks).every(Boolean),
      completedRemittances: remittances.length + manualRemittances,
      providerRemittances: remittances.length,
      manualRemittances,
      linkedProviderMovements: (movements as any[]).filter((movement) => movement.remittanceId != null).length,
      linkedMovements: movements.length,
      checks,
      positions: positionsReport.map((position) => ({
        currencyId: position.currencyId,
        currency: position.currency,
        positionSaldo: toDecimalString(position.positionSaldo),
        movementSaldo: toDecimalString(position.movementSaldo),
        difference: toDecimalString(position.difference),
        cashBalance: position.cashBalance === null ? null : toDecimalString(position.cashBalance),
        cashPositionDifference: position.cashPositionDifference === null ? null : toDecimalString(position.cashPositionDifference),
        reviewStatus: position.reviewStatus,
        movementCount: position.movementCount,
        ok: position.ok,
      })),
      remittanceIssues,
      primaryCashLedger: primaryCashLedger.status === 'VERIFIED'
        ? {
            ...primaryCashLedger,
            openingBalance: toDecimalString(primaryCashLedger.openingBalance),
            remittanceDelta: toDecimalString(primaryCashLedger.remittanceDelta),
            expectedBalance: toDecimalString(primaryCashLedger.expectedBalance),
            actualBalance: toDecimalString(primaryCashLedger.actualBalance),
            difference: toDecimalString(primaryCashLedger.difference),
          }
        : primaryCashLedger,
    };
  }
}
