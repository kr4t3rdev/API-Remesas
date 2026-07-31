import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExchangeRatesService {
  constructor(private prisma: PrismaService) {}

  private async resolvePrimaryCurrencyId(userId: number, fallbackId?: number) {
    const userDelegate = (this.prisma as any).user;
    const user = typeof userDelegate?.findUnique === 'function'
      ? await userDelegate.findUnique({ where: { id: userId }, select: { primaryCurrencyId: true } })
      : null;
    return user?.primaryCurrencyId ?? fallbackId;
  }

  async findAll(userId: number) {
    const rates = await this.prisma.exchangeRate.findMany({
      where: { userId },
      include: { currency: true },
      orderBy: [{ currency: { code: 'asc' } }, { effectiveDate: 'desc' }],
    });

    return rates.map((rate) => ({
      ...rate,
      buyRate: Number(rate.referenceRate) * (1 - Number(rate.buyMargin)),
      sellRate: Number(rate.referenceRate) * (1 + Number(rate.sellMargin)),
    }));
  }

  async findCurrent(userId: number) {
    const cupCurrency = await this.prisma.currency.findFirst({
      where: { code: 'CUP' },
    });
    const rates = await this.prisma.exchangeRate.findMany({
      where: {
        userId,
        currency: { isActive: true, code: { not: 'CUP' } },
      },
      include: { currency: true },
    });

    const serializedRates = rates.map((rate) => ({
      ...rate,
      buyRate: Number(rate.referenceRate) * (1 - Number(rate.buyMargin)),
      sellRate: Number(rate.referenceRate) * (1 + Number(rate.sellMargin)),
    }));

    return { rates: serializedRates, cupCurrencyId: cupCurrency?.id };
  }

  async findByCurrency(userId: number, currencyId: number) {
    return this.prisma.exchangeRate.findMany({
      where: { userId, currencyId },
      orderBy: { effectiveDate: 'desc' },
    });
  }

  async update(userId: number, currencyId: number, updateDto: UpdateExchangeRateDto) {
    const currency = await this.prisma.currency.findUnique({
      where: { id: currencyId },
    });

    if (!currency) {
      throw new NotFoundException(`Moneda con ID ${currencyId} no encontrada`);
    }

    const cupCurrency = await this.prisma.currency.findFirst({
      where: { code: 'CUP' },
    });
    const primaryCurrencyId = await this.resolvePrimaryCurrencyId(userId, cupCurrency?.id);

    const existingRate = await this.prisma.exchangeRate.findUnique({
      where: { userId_currencyId: { userId, currencyId } },
    });

    const isNewRate = !existingRate;

    const result = await this.prisma.$transaction(async (tx) => {
      const exchangeRate = await tx.exchangeRate.upsert({
        where: { userId_currencyId: { userId, currencyId } },
        update: {
          referenceRate: new Decimal(updateDto.referenceRate),
          buyMargin: new Decimal(updateDto.buyMargin),
          sellMargin: new Decimal(updateDto.sellMargin),
        },
        create: {
          userId,
          currencyId,
          referenceRate: new Decimal(updateDto.referenceRate),
          buyMargin: new Decimal(updateDto.buyMargin),
          sellMargin: new Decimal(updateDto.sellMargin),
        },
        include: { currency: true },
      });

      if (primaryCurrencyId) {
        try {
          await tx.rateHistory.create({
            data: {
              userId,
              currencyFromId: currencyId,
              currencyToId: primaryCurrencyId,
              rate: new Decimal(updateDto.referenceRate),
              source: 'MANUAL',
              referenceType: 'exchange_rate',
              referenceId: exchangeRate.id,
            },
          });
        } catch (historyError) {
          console.error('Error saving rate history:', historyError);
        }
      }

      return exchangeRate;
    });

    return {
      ...result,
      buyRate: Number(result.referenceRate) * (1 - Number(result.buyMargin)),
      sellRate: Number(result.referenceRate) * (1 + Number(result.sellMargin)),
      isNewRate,
    };
  }

  async getBuyRate(userId: number, currencyId: number): Promise<number> {
    const rate = await this.prisma.exchangeRate.findFirst({
      where: { userId, currencyId },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!rate) return 0;
    return Number(rate.referenceRate) * (1 - Number(rate.buyMargin));
  }

  async getSellRate(userId: number, currencyId: number): Promise<number> {
    const rate = await this.prisma.exchangeRate.findFirst({
      where: { userId, currencyId },
      orderBy: { effectiveDate: 'desc' },
    });

    if (!rate) return 0;
    return Number(rate.referenceRate) * (1 + Number(rate.sellMargin));
  }

  async getHistory(userId: number, currencyId?: number) {
    const where: any = { userId };
    if (currencyId) where.currencyId = currencyId;

    return this.prisma.exchangeRate.findMany({
      where,
      include: { currency: true },
      orderBy: { effectiveDate: 'desc' },
      take: 100,
    });
  }

  async remove(userId: number, currencyId: number) {
    const rate = await this.prisma.exchangeRate.findUnique({
      where: { userId_currencyId: { userId, currencyId } },
    });

    if (!rate) {
      throw new NotFoundException(`Tasa de cambio para moneda con ID ${currencyId} no encontrada`);
    }

    // Attempt to delete. Since ExchangeRate might be linked to RateHistory, 
    // we need to remove the associated history first if they reference this rate
    try {
      await this.prisma.$transaction(async (tx) => {
        // Delete the history entries that reference this exchange rate
        await tx.rateHistory.deleteMany({
          where: { 
            userId,
            referenceType: 'exchange_rate',
            referenceId: rate.id
          }
        });

        // Finally, delete the rate
        await tx.exchangeRate.delete({
          where: { userId_currencyId: { userId, currencyId } },
        });
      });
      
      return { success: true, message: 'Tasa de cambio eliminada correctamente' };
    } catch (error) {
      // In case there's another foreign key constraint (like Transactions depending on ExchangeRate directly)
      // Note: If transactions depend on the currency but NOT directly on the exchange rate record, 
      // deleting the rate is safe. We only catch Prisma FK violations here.
      throw new BadRequestException('No se puede eliminar la tasa de cambio porque tiene transacciones o movimientos asociados');
    }
  }
}
