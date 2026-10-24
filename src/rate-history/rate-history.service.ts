import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { Decimal } from 'decimal.js';
import { toDecimalString } from '../common/utils/decimal-serialization';
import { CreateRateHistoryDto, RateSource } from './dto/create-rate-history.dto';

const dec = (value: unknown): Decimal => new Decimal(String(value ?? 0));

@Injectable()
export class RateHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createDto: CreateRateHistoryDto) {
    return this.prisma.rateHistory.create({
      data: {
        userId,
        currencyFromId: createDto.currencyFromId,
        currencyToId: createDto.currencyToId,
        rate: new Decimal(createDto.rate),
        source: createDto.source,
        referenceType: createDto.referenceType,
        referenceId: createDto.referenceId,
      },
      include: {
        currencyFrom: true,
        currencyTo: true,
      },
    });
  }

  async findAll(userId: number, currencyId?: number) {
    const where: any = { userId };

    if (currencyId) {
      where.OR = [
        { currencyFromId: currencyId },
        { currencyToId: currencyId },
      ];
    }

    return this.prisma.rateHistory.findMany({
      where,
      include: {
        currencyFrom: true,
        currencyTo: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findByPair(userId: number, currencyFromId: number, currencyToId: number) {
    return this.prisma.rateHistory.findMany({
      where: { userId, currencyFromId, currencyToId },
      include: {
        currencyFrom: true,
        currencyTo: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getLatestRate(userId: number, currencyFromId: number, currencyToId: number) {
    const rate = await this.prisma.rateHistory.findFirst({
      where: { userId, currencyFromId, currencyToId },
      orderBy: { createdAt: 'desc' },
    });

    return rate ? toDecimalString(rate.rate) : null;
  }

  async getManualEntries(userId: number, currencyId?: number) {
    const where: any = { userId, source: RateSource.MANUAL };

    if (currencyId) {
      where.OR = [
        { currencyFromId: currencyId },
        { currencyToId: currencyId },
      ];
    }

    return this.prisma.rateHistory.findMany({
      where,
      include: {
        currencyFrom: true,
        currencyTo: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getStats(userId: number, currencyFromId: number, currencyToId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const rates = await this.prisma.rateHistory.findMany({
      where: {
        userId,
        currencyFromId,
        currencyToId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (rates.length === 0) {
      return null;
    }

    const rateValues = rates.map(r => dec(r.rate));
    const sum = rateValues.reduce((a, b) => a.plus(b), new Decimal(0));
    const avg = sum.div(rateValues.length);
    const min = Decimal.min(...rateValues);
    const max = Decimal.max(...rateValues);
    const latest = rateValues[rateValues.length - 1];
    const previous = rateValues.length > 1 ? rateValues[rateValues.length - 2] : latest;
    const change = latest.minus(previous);
    const changePercent = previous.gt(0) ? change.div(previous).mul(100) : new Decimal(0);

    return {
      average: toDecimalString(avg),
      min: toDecimalString(min),
      max: toDecimalString(max),
      latest: toDecimalString(latest),
      previous: toDecimalString(previous),
      change: toDecimalString(change),
      changePercent: Number(changePercent.toDecimalPlaces(2)),
      count: rates.length,
      manualCount: rates.filter(r => r.source === 'MANUAL').length,
    };
  }

  async resetHistory(userId: number, currencyId?: number) {
    const where: any = { userId };

    if (currencyId) {
      where.OR = [
        { currencyFromId: currencyId },
        { currencyToId: currencyId },
      ];
    }

    const result = await this.prisma.rateHistory.deleteMany({ where });

    return {
      message: currencyId
        ? `Historial de tasas reseteado para la moneda ${currencyId}`
        : 'Historial de tasas reseteado correctamente',
      count: result.count,
    };
  }
}
