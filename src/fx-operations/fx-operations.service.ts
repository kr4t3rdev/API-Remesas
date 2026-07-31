import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CurrencyMovementType, FxOperationKind, Prisma, TransactionType, TransferAccountType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateFxTransferDto } from './dto/create-fx-transfer.dto';
import { OpenCurrencyPositionDto } from './dto/open-currency-position.dto';
import { assertSaleAvailable, calculateSaleSnapshot, calculateWeightedAveragePurchase } from './domain/position-calculator';
import { mapTransferMovement } from './domain/movement-mapper';
import { validateServerRate } from './rate-validator';
import { CurrencyPositionUnavailableError, InsufficientSaldoError, InvalidRateError } from './domain/domain-errors';
import { serializableTransaction } from '../common/transactions/serializable-transaction';

const MAX_TRANSACTION_TOTAL = new Decimal('9999999999999.99');
const PERSISTED_RATE_RELATIVE_TOLERANCE = new Decimal('0.0001');

export function calculatePersistedRate(type: TransactionType, referenceRate: Decimal, requestedRate: Decimal) {
  if (!referenceRate.isPositive() || !requestedRate.isPositive()) throw new InvalidRateError();
  const rawMargin = type === TransactionType.COMPRA
    ? new Decimal(1).sub(requestedRate.div(referenceRate))
    : requestedRate.div(referenceRate).sub(1);
  const margin = rawMargin.toDecimalPlaces(4);
  if (margin.abs().gte(10)) {
    throw new InvalidRateError('Rate cannot be represented by the active rate margin');
  }
  const effectiveRate = (type === TransactionType.COMPRA
    ? referenceRate.mul(new Decimal(1).sub(margin))
    : referenceRate.mul(new Decimal(1).add(margin))).toDecimalPlaces(4);
  const relativeDeviation = effectiveRate.sub(requestedRate).abs().div(requestedRate);
  if (relativeDeviation.gt(PERSISTED_RATE_RELATIVE_TOLERANCE)) {
    throw new InvalidRateError('Rounded active rate differs materially from the requested rate');
  }
  return { margin, effectiveRate };
}

@Injectable()
export class FxOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolvePrimaryCurrency(userId: number) {
    const userDelegate = (this.prisma as any).user;
    if (typeof userDelegate?.findUnique === 'function') {
      const user = await userDelegate.findUnique({
        where: { id: userId },
        select: {
          primaryCurrencyId: true,
          primaryCurrency: { select: { id: true, code: true, isActive: true } },
        },
      });
      if (user?.primaryCurrencyId != null) {
        if (user.primaryCurrency?.isActive) return user.primaryCurrency;
        throw new NotFoundException('Active primary currency not found');
      }
    }

    const cupCurrency = await this.prisma.currency.findUnique({ where: { code: 'CUP' } });
    if (!cupCurrency?.isActive) throw new NotFoundException('Active primary currency not found');
    return cupCurrency;
  }

  private assertSameTransferIntent(existing: any, userId: number, dto: CreateFxTransferDto) {
    const sameIntent = existing.userId === userId && existing.type === dto.type
      && existing.currencyId === dto.currencyId && new Decimal(existing.amount).eq(new Decimal(dto.amount))
      && new Decimal(existing.requestedRate ?? existing.rate).eq(new Decimal(dto.rate)) && existing.notes === (dto.notes ?? null)
      && (existing.sourceType ?? TransferAccountType.CASH) === (dto.sourceType ?? TransferAccountType.CASH)
      && (existing.sourceBankAccountId ?? null) === (dto.sourceBankAccountId ?? null)
      && (existing.destinationType ?? TransferAccountType.CASH) === (dto.destinationType ?? TransferAccountType.CASH)
      && (existing.destinationBankAccountId ?? null) === (dto.destinationBankAccountId ?? null)
      && (existing.operationKind ?? FxOperationKind.TRANSFER) === (dto.operationKind ?? FxOperationKind.TRANSFER)
      && (existing.persistRate ?? false) === (dto.persistRate ?? false)
      && (existing.workerId ?? null) === (dto.workerId ?? null)
      && (existing.workerCurrencyId ?? null) === (dto.workerCurrencyId ?? null)
      && ((existing.workerProfit ?? null) === null
        ? dto.workerProfit === undefined
        : dto.workerProfit !== undefined && new Decimal(existing.workerProfit).eq(new Decimal(dto.workerProfit)));
    if (!sameIntent) throw new ConflictException('Idempotency key was already used for a different transfer');
  }

  static assertSaleAvailable = assertSaleAvailable;

  async createTransfer(userId: number, dto: CreateFxTransferDto, idempotencyKey?: string) {
    const workerFieldsProvided = dto.workerId !== undefined || dto.workerProfit !== undefined || dto.workerCurrencyId !== undefined;
    if (workerFieldsProvided && (dto.workerId === undefined || dto.workerProfit === undefined || dto.workerCurrencyId === undefined)) {
      throw new BadRequestException('workerId, workerProfit and workerCurrencyId must be provided together');
    }
    if (dto.workerId !== undefined && (
      dto.sourceType === TransferAccountType.BANK_ACCOUNT
      || dto.destinationType === TransferAccountType.BANK_ACCOUNT
      || dto.sourceBankAccountId !== undefined
      || dto.destinationBankAccountId !== undefined
    )) {
      throw new BadRequestException('Worker FX transfers must use CASH accounts only');
    }
    if (dto.workerProfit !== undefined && dto.workerProfit < 0) {
      throw new BadRequestException('Worker profit cannot be negative');
    }
    if (idempotencyKey) {
      const existing = await this.prisma.transaction.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        include: { fxMovements: true },
      });
      if (existing) {
        if (existing.type !== undefined) this.assertSameTransferIntent(existing, userId, dto);
        return { transaction: existing, movement: existing.fxMovements[0] };
      }
    }
    const amount = new Decimal(dto.amount);
    const requestedRate = new Decimal(dto.rate);
    const currency = await this.prisma.currency.findUnique({ where: { id: dto.currencyId } });
    const primaryCurrency = await this.resolvePrimaryCurrency(userId);

    if (!currency || !currency.isActive || currency.id === primaryCurrency.id) {
      throw new NotFoundException('Active non-CUP FX currency not found');
    }

    try {
      return await serializableTransaction(this.prisma, async (tx) => {
      const currentRate = await tx.exchangeRate.findUnique({
        where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
      });
      if (!currentRate) throw new InvalidRateError('Current exchange rate is unavailable');
      const persistedRate = dto.persistRate
        ? calculatePersistedRate(dto.type, new Decimal(currentRate.referenceRate), requestedRate)
        : null;
      const rate = persistedRate?.effectiveRate ?? requestedRate;
      if (!dto.persistRate) {
        validateServerRate(dto.rate);
      }
      if (amount.mul(rate).gt(MAX_TRANSACTION_TOTAL)) throw new InvalidRateError('Transaction total exceeds the supported range');

      const existing = await tx.currencyPosition.findUnique({
        where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
      });
      if (dto.type === TransactionType.VENTA && !existing) throw new CurrencyPositionUnavailableError();
      if (dto.type === TransactionType.COMPRA && existing?.reviewStatus === 'UNREVIEWED' && !existing.saldo.eq(0)) {
        throw new CurrencyPositionUnavailableError();
      }
      if (dto.type === TransactionType.COMPRA && (!existing || existing.reviewStatus === 'UNREVIEWED')) {
        const historicalCash = typeof tx.cashBalance.findUnique === 'function'
          ? await tx.cashBalance.findUnique({ where: { userId_currencyId: { userId, currencyId: dto.currencyId } } })
          : null;
        if (historicalCash && new Decimal(historicalCash.balance).gt(0)) {
          throw new CurrencyPositionUnavailableError();
        }
      }
      const position = existing ?? await tx.currencyPosition.create({
        data: {
          userId, currencyId: dto.currencyId, saldo: 0, costoPromedio: 0,
          reviewStatus: dto.type === TransactionType.COMPRA ? 'REVIEWED' : 'UNREVIEWED',
          reviewedAt: dto.type === TransactionType.COMPRA ? new Date() : null,
        },
      });

      let nextSaldo = position.saldo;
      let average = position.costoPromedio ?? new Decimal(0);
      let costSnapshot: Decimal | undefined;
      let realizedProfit: Decimal | undefined;

      if (dto.type === TransactionType.VENTA) {
        assertSaleAvailable({ saldo: position.saldo, reviewStatus: position.reviewStatus }, amount);
        const sale = calculateSaleSnapshot(position.saldo, average, amount, rate);
        nextSaldo = sale.remainingSaldo;
        costSnapshot = sale.costSnapshot;
        realizedProfit = sale.realizedProfit;
      } else {
        nextSaldo = position.saldo.add(amount);
        average = calculateWeightedAveragePurchase(position.saldo, average, amount, rate);
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: dto.type,
          currencyId: dto.currencyId,
          amount,
          rate,
          requestedRate,
          // Legacy schema name: totalCup stores the total in the user's configured primary currency.
          totalCup: amount.mul(rate),
          marginProfit: realizedProfit ?? new Decimal(0),
          notes: dto.notes,
          idempotencyKey,
          operationKind: dto.operationKind ?? FxOperationKind.TRANSFER,
          persistRate: dto.persistRate ?? false,
          sourceType: dto.sourceType ?? TransferAccountType.CASH,
          sourceBankAccountId: dto.sourceBankAccountId,
          destinationType: dto.destinationType ?? TransferAccountType.CASH,
          destinationBankAccountId: dto.destinationBankAccountId,
          workerId: dto.workerId,
          workerProfit: dto.workerProfit === undefined ? undefined : new Decimal(dto.workerProfit),
          workerCurrencyId: dto.workerCurrencyId,
        },
      });

      const movement = await tx.currencyMovement.create({
        data: mapTransferMovement({
          userId,
          currencyId: dto.currencyId,
          positionId: position.id,
          transactionId: transaction.id,
          type: dto.type === TransactionType.COMPRA ? CurrencyMovementType.PURCHASE : CurrencyMovementType.SALE,
          amount,
          rate,
          costSnapshot,
          realizedProfit,
        }),
      });

      if (dto.persistRate) {
        const margin = persistedRate!.margin;
        await tx.exchangeRate.update({
          where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
          data: dto.type === TransactionType.COMPRA
            ? { buyMargin: margin, effectiveDate: new Date() }
            : { sellMargin: margin, effectiveDate: new Date() },
        });
        await tx.rateHistory.create({
          data: {
            userId,
            currencyFromId: dto.currencyId,
            currencyToId: primaryCurrency.id,
            rate,
            source: 'MANUAL',
            referenceType: 'FX_TRANSACTION',
            referenceId: transaction.id,
          },
        });
      }

      if (dto.type === TransactionType.VENTA) {
        const updated = await tx.currencyPosition.updateMany({
          where: { id: position.id, reviewStatus: 'REVIEWED', saldo: { gte: amount } },
          data: { saldo: { decrement: amount } },
        });
        if (updated.count !== 1) {
          const latest = await tx.currencyPosition.findUnique({ where: { id: position.id } });
          if (!latest || latest.reviewStatus !== 'REVIEWED') throw new CurrencyPositionUnavailableError();
          throw new InsufficientSaldoError();
        }
      } else {
        await tx.currencyPosition.update({
          where: { id: position.id },
          data: {
            saldo: nextSaldo, costoPromedio: average,
            ...(position.reviewStatus === 'UNREVIEWED' && position.saldo.eq(0)
              ? { reviewStatus: 'REVIEWED', reviewedAt: new Date() } : {}),
          },
        });
      }

      const sourceType = dto.sourceType ?? TransferAccountType.CASH;
      const destinationType = dto.destinationType ?? TransferAccountType.CASH;
      const sourceBankAccountId = dto.sourceBankAccountId;
      const destinationBankAccountId = dto.destinationBankAccountId;
      const sourceCurrencyId = dto.type === TransactionType.COMPRA ? primaryCurrency.id : dto.currencyId;
      const destinationCurrencyId = dto.type === TransactionType.COMPRA ? dto.currencyId : primaryCurrency.id;
      const sourceAmount = dto.type === TransactionType.COMPRA ? amount.mul(rate) : amount;
      const destinationAmount = dto.type === TransactionType.COMPRA ? amount : amount.mul(rate);
      const adjustCashSource = async (currencyId: number) => {
        if (tx.cashBalance.updateMany) {
          const result = await tx.cashBalance.updateMany({
            where: { userId, currencyId, balance: { gte: sourceAmount } },
            data: { balance: { decrement: sourceAmount } },
          });
          if (result.count !== 1) throw new InsufficientSaldoError();
          return;
        }
        await tx.cashBalance.upsert({ where: { userId_currencyId: { userId, currencyId } }, update: { balance: { decrement: sourceAmount } }, create: { userId, currencyId, balance: sourceAmount.neg() } });
      };

      const adjustBankAccount = async (accountId: number | undefined, currencyId: number, delta: Decimal, requireFunds: boolean) => {
        if (!accountId) throw new NotFoundException('Bank account is required for BANK_ACCOUNT transfers');
        const account = await tx.bankAccount.findFirst({ where: { id: accountId, userId, isActive: true } });
        if (!account || account.currencyId !== currencyId) throw new NotFoundException('Bank account not found or currency mismatch');
        const result = await tx.bankAccount.updateMany({
          where: { id: accountId, userId, isActive: true, ...(requireFunds ? { balance: { gte: sourceAmount } } : {}) },
          data: { balance: { increment: delta } },
        });
        if (result.count !== 1) throw new InsufficientSaldoError();
      };

      if (sourceType === TransferAccountType.BANK_ACCOUNT) {
        await adjustBankAccount(sourceBankAccountId, sourceCurrencyId, sourceAmount.neg(), true);
      } else if (destinationType === TransferAccountType.BANK_ACCOUNT) {
        // Cash source is kept in the legacy cash ledger below; bank destination is applied here.
      }
      if (destinationType === TransferAccountType.BANK_ACCOUNT) {
        await adjustBankAccount(destinationBankAccountId, destinationCurrencyId, destinationAmount, false);
      }

      if (sourceType === TransferAccountType.BANK_ACCOUNT || destinationType === TransferAccountType.BANK_ACCOUNT) {
        // For bank-backed legs, only apply the remaining cash leg. Bank legs were updated above.
        if (sourceType === TransferAccountType.CASH) {
          await adjustCashSource(sourceCurrencyId);
        }
        if (destinationType === TransferAccountType.CASH) {
          await tx.cashBalance.upsert({ where: { userId_currencyId: { userId, currencyId: destinationCurrencyId } }, update: { balance: { increment: destinationAmount } }, create: { userId, currencyId: destinationCurrencyId, balance: destinationAmount } });
        }
      } else if (dto.type === TransactionType.COMPRA) {
        await tx.cashBalance.upsert({ where: { userId_currencyId: { userId, currencyId: dto.currencyId } }, update: { balance: { increment: amount } }, create: { userId, currencyId: dto.currencyId, balance: amount } });
        await adjustCashSource(primaryCurrency.id);
      } else {
        await adjustCashSource(dto.currencyId);
        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: primaryCurrency.id } },
          update: { balance: { increment: amount.mul(rate) } },
          create: { userId, currencyId: primaryCurrency.id, balance: amount.mul(rate) },
        });
      }

      if (dto.workerId !== undefined) {
        const worker = await tx.worker.findFirst({ where: { id: dto.workerId, userId }, select: { id: true } });
        if (!worker) throw new NotFoundException('Trabajador no encontrado');
        const workerCurrencyId = dto.workerCurrencyId!;
        const workerBalance = await tx.workerBalance.findUnique({
          where: { workerId_currencyId: { workerId: dto.workerId, currencyId: workerCurrencyId } },
          include: { currency: true },
        });
        if (!workerBalance) throw new NotFoundException('Worker balance not found for currency');
        if (!workerBalance.currency?.isActive) throw new NotFoundException('Worker currency is inactive');
        const profit = new Decimal(dto.workerProfit!);
        // The worker funds the FX operation. Debit the selected worker currency
        // atomically; for COMPRA this is the purchased amount, never the CUP
        // source amount (amount * rate).
        const debitAmount = amount;
        const balanceBefore = new Decimal(workerBalance.balance);
        const balanceAfter = balanceBefore.sub(debitAmount);
        const updatedWorkerBalance = await tx.workerBalance.updateMany({
          where: { id: workerBalance.id, balance: { gte: debitAmount } },
          data: {
            balance: { decrement: debitAmount },
            accumulatedProfit: { increment: profit },
          },
        });
        if (updatedWorkerBalance.count !== 1) throw new InsufficientSaldoError();
        await tx.workerTransaction.create({
          data: {
            workerId: dto.workerId,
            currencyId: workerCurrencyId,
            type: 'TRANSACTION',
            amount: debitAmount,
            profit,
            balanceBefore,
            balanceAfter,
            description: 'Ganancia por operación FX',
          },
        });
      }

      return { transaction, movement, position: { ...position, saldo: nextSaldo, costoPromedio: average }, realizedProfit };
      });
    } catch (error) {
      if (idempotencyKey && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await this.prisma.transaction.findUnique({
          where: { userId_idempotencyKey: { userId, idempotencyKey } },
          include: { fxMovements: true },
        });
        if (existing) {
          this.assertSameTransferIntent(existing, userId, dto);
          return { transaction: existing, movement: existing.fxMovements[0] };
        }
      }
      throw error;
    }
  }

  async openPosition(userId: number, dto: OpenCurrencyPositionDto) {
    const currency = await this.prisma.currency.findUnique({ where: { id: dto.currencyId } });
    const primaryCurrency = await this.resolvePrimaryCurrency(userId);
    if (!currency || !currency.isActive || currency.id === primaryCurrency.id) {
      throw new NotFoundException('Active non-CUP FX currency not found');
    }
    const openingCost = new Decimal(dto.openingCost);

    return serializableTransaction(this.prisma, async (tx) => {
      const cashBalance = await tx.cashBalance.findUnique({
        where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
      });
      if (!cashBalance || new Decimal(cashBalance.balance).lte(0)) {
        throw new ConflictException({ code: 'FX_OPENING_CASH_UNAVAILABLE', message: 'A positive cash balance is required to open this position' });
      }
      const openingSaldo = new Decimal(cashBalance.balance);
      const existing = await tx.currencyPosition.findUnique({
        where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
      });
      if (existing?.reviewStatus === 'REVIEWED') {
        throw new ConflictException({ code: 'FX_POSITION_ALREADY_REVIEWED', message: 'Currency position is already reviewed' });
      }
      if (existing && !new Decimal(existing.saldo).eq(openingSaldo)) {
        throw new ConflictException({ code: 'FX_OPENING_MISMATCH', message: 'Cash balance and position saldo do not match' });
      }

      const data = {
        saldo: openingSaldo,
        costoPromedio: openingCost,
        reviewStatus: 'REVIEWED' as const,
        openingSaldo,
        openingCost,
        reviewedAt: new Date(),
      };
      const position = existing
        ? await tx.currencyPosition.update({ where: { id: existing.id }, data })
        : await tx.currencyPosition.create({ data: { userId, currencyId: dto.currencyId, ...data } });
      const movement = await tx.currencyMovement.create({
        data: {
          userId,
          currencyId: dto.currencyId,
          positionId: position.id,
          type: CurrencyMovementType.OPENING,
          amount: openingSaldo,
          rate: openingCost,
          costSnapshot: openingCost,
          realizedProfit: null,
        },
      });
      return { position, movement, cashBalance };
    });
  }
}
