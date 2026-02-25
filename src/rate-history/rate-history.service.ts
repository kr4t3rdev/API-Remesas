import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateRateHistoryDto, RateSource } from './dto/create-rate-history.dto';
import { Decimal } from '@prisma/client/runtime/library';

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

    return rate ? Number(rate.rate) : null;
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

    const rateValues = rates.map(r => Number(r.rate));
    const sum = rateValues.reduce((a, b) => a + b, 0);
    const avg = sum / rateValues.length;
    const min = Math.min(...rateValues);
    const max = Math.max(...rateValues);
    const latest = rateValues[rateValues.length - 1];
    const previous = rateValues.length > 1 ? rateValues[rateValues.length - 2] : latest;
    const change = latest - previous;
    const changePercent = previous !== 0 ? ((change / previous) * 100) : 0;

    return {
      average: avg,
      min,
      max,
      latest,
      previous,
      change,
      changePercent,
      count: rates.length,
      manualCount: rates.filter(r => r.source === 'MANUAL').length,
    };
  }
}
