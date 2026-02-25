import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateCashAdjustmentDto } from './dto/create-cash-adjustment.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CashAdjustmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCashAdjustmentDto, userId: number) {
    const currency = await this.prisma.currency.findUnique({
      where: { id: createDto.currencyId },
    });

    if (!currency) {
      throw new NotFoundException('Moneda no encontrada');
    }

    const amount = new Decimal(createDto.amount);
    const adjustmentAmount = createDto.type === 'INGRESO' ? amount : amount.neg();

    const result = await this.prisma.$transaction(async (tx) => {
      const adjustment = await tx.cashAdjustment.create({
        data: {
          userId,
          currencyId: createDto.currencyId,
          amount,
          type: createDto.type,
          reason: createDto.reason,
        },
        include: { currency: true },
      });

      await tx.cashBalance.upsert({
        where: { userId_currencyId: { userId, currencyId: createDto.currencyId } },
        update: { balance: { increment: adjustmentAmount } },
        create: { userId, currencyId: createDto.currencyId, balance: adjustmentAmount },
      });

      return adjustment;
    });

    return result;
  }

  async findAll(userId: number, currencyId?: number) {
    const where: any = { userId };
    if (currencyId) where.currencyId = currencyId;

    return this.prisma.cashAdjustment.findMany({
      where,
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
