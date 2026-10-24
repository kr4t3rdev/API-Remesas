import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { toDecimalString } from '../common/utils/decimal-serialization';

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
      balance: toDecimalString(b.balance),
    }));
  }

  async findByCurrency(userId: number, currencyId: number) {
    const balance = await this.prisma.cashBalance.findUnique({
      where: { userId_currencyId: { userId, currencyId } },
      include: { currency: true },
    });

    if (!balance) {
      return { currencyId, balance: '0', currency: null };
    }

    return {
      ...balance,
      balance: toDecimalString(balance.balance),
    };
  }
}
