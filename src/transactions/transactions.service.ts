import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createDto: CreateTransactionDto) {
    const currency = await this.prisma.currency.findUnique({
      where: { id: createDto.currencyId },
    });

    if (!currency) {
      throw new NotFoundException('Moneda no encontrada');
    }

    if (!currency.isActive) {
      throw new BadRequestException('La moneda no está activa');
    }

    const amount = new Decimal(createDto.amount);
    const rate = new Decimal(createDto.rate);
    const totalCup = amount.mul(rate);

    const cupCurrency = await this.prisma.currency.findUnique({
      where: { code: 'CUP' },
    });

    if (!cupCurrency) {
      throw new NotFoundException('Moneda CUP no encontrada');
    }

    const marginProfit = new Decimal(0);

    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: createDto.type,
          currencyId: createDto.currencyId,
          amount,
          rate,
          totalCup,
          marginProfit,
          notes: createDto.notes,
        },
        include: { currency: true },
      });

      if (createDto.type === 'COMPRA') {
        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: createDto.currencyId } },
          update: { balance: { increment: amount } },
          create: { userId, currencyId: createDto.currencyId, balance: amount },
        });

        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: cupCurrency.id } },
          update: { balance: { decrement: totalCup } },
          create: { userId, currencyId: cupCurrency.id, balance: new Decimal(0).minus(totalCup) },
        });
      } else {
        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: createDto.currencyId } },
          update: { balance: { decrement: amount } },
          create: { userId, currencyId: createDto.currencyId, balance: new Decimal(0).minus(amount) },
        });

        await tx.cashBalance.upsert({
          where: { userId_currencyId: { userId, currencyId: cupCurrency.id } },
          update: { balance: { increment: totalCup } },
          create: { userId, currencyId: cupCurrency.id, balance: totalCup },
        });
      }

      return transaction;
    });

    return result;
  }

  async findAll(userId: number, query: QueryTransactionDto) {
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.currencyId) where.currencyId = query.currencyId;
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    return this.prisma.transaction.findMany({
      where,
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending(userId: number) {
    return this.prisma.transaction.findMany({
      where: { userId, status: 'PENDIENTE' },
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { currency: true, incomeReconciliation: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaction;
  }
}
