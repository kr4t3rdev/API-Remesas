import { Injectable, NotFoundException } from '@nestjs/common';
import { CurrencyMovementType, Prisma, TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateFxTransferDto } from './dto/create-fx-transfer.dto';
import { assertSaleAvailable, calculateSaleSnapshot, calculateWeightedAveragePurchase } from './domain/position-calculator';
import { mapTransferMovement } from './domain/movement-mapper';
import { validateServerRate } from './rate-validator';
import { CurrencyPositionUnavailableError, InsufficientSaldoError, InvalidRateError } from './domain/domain-errors';

@Injectable()
export class FxOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  static assertSaleAvailable = assertSaleAvailable;

  async createTransfer(userId: number, dto: CreateFxTransferDto) {
    const amount = new Decimal(dto.amount);
    const rate = new Decimal(dto.rate);
    const currency = await this.prisma.currency.findUnique({ where: { id: dto.currencyId } });
    const cupCurrency = await this.prisma.currency.findUnique({ where: { code: 'CUP' } });

    if (!currency || !cupCurrency) throw new NotFoundException('Currency not found');

    return this.prisma.$transaction(async (tx) => {
      const currentRate = await tx.exchangeRate.findUnique({
        where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
      });
      if (!currentRate) throw new InvalidRateError('Current exchange rate is unavailable');
      const expectedRate = dto.type === TransactionType.COMPRA
        ? new Decimal(currentRate.referenceRate).mul(new Decimal(1).sub(currentRate.buyMargin))
        : new Decimal(currentRate.referenceRate).mul(new Decimal(1).add(currentRate.sellMargin));
      validateServerRate(dto.rate, expectedRate.toNumber());

      const existing = await tx.currencyPosition.findUnique({
        where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
      });
      if (dto.type === TransactionType.VENTA && !existing) throw new CurrencyPositionUnavailableError();
      if (dto.type === TransactionType.COMPRA && existing?.reviewStatus === 'UNREVIEWED' && !existing.saldo.eq(0)) {
        throw new CurrencyPositionUnavailableError();
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
          totalCup: amount.mul(rate),
          marginProfit: realizedProfit ?? new Decimal(0),
          notes: dto.notes,
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

      if (dto.type === TransactionType.COMPRA) {
        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
          update: { balance: { increment: amount } },
          create: { userId, currencyId: dto.currencyId, balance: amount },
        });
        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: cupCurrency.id } },
          update: { balance: { decrement: amount.mul(rate) } },
          create: { userId, currencyId: cupCurrency.id, balance: amount.mul(rate).neg() },
        });
      } else {
        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: dto.currencyId } },
          update: { balance: { decrement: amount } },
          create: { userId, currencyId: dto.currencyId, balance: amount.neg() },
        });
        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: cupCurrency.id } },
          update: { balance: { increment: amount.mul(rate) } },
          create: { userId, currencyId: cupCurrency.id, balance: amount.mul(rate) },
        });
      }

      return { transaction, movement, position: { ...position, saldo: nextSaldo, costoPromedio: average }, realizedProfit };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}
