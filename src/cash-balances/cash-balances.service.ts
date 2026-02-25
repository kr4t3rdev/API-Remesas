import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class CashBalancesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    const balances = await this.prisma.cashBalance.findMany({
      where: { userId },
      include: { currency: true },
      orderBy: { currency: { code: 'asc' } },
    });

    return balances.map((b) => ({
      ...b,
      balance: Number(b.balance),
    }));
  }

  async findByCurrency(userId: number, currencyId: number) {
    const balance = await this.prisma.cashBalance.findUnique({
      where: { userId_currencyId: { userId, currencyId } },
      include: { currency: true },
    });

    if (!balance) {
      return { currencyId, balance: 0, currency: null };
    }

    return {
      ...balance,
      balance: Number(balance.balance),
    };
  }
}
