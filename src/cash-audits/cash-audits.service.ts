import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateCashAuditDto } from './dto/create-cash-audit.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CashAuditsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createDto: CreateCashAuditDto) {
    const currency = await this.prisma.currency.findUnique({
      where: { id: createDto.currencyId },
    });

    if (!currency) {
      throw new NotFoundException('Moneda no encontrada');
    }

    const cashBalance = await this.prisma.cashBalance.findUnique({
      where: { userId_currencyId: { userId, currencyId: createDto.currencyId } },
    });

    const expectedBalance = cashBalance ? cashBalance.balance : new Decimal(0);
    const actualBalance = new Decimal(createDto.actualBalance);
    const difference = actualBalance.minus(expectedBalance);

    return this.prisma.cashAudit.create({
      data: {
        userId,
        currencyId: createDto.currencyId,
        expectedBalance,
        actualBalance,
        difference,
        notes: createDto.notes,
      },
      include: { currency: true },
    });
  }

  async findAll(userId: number, currencyId?: number) {
    const where: any = { userId };
    if (currencyId) where.currencyId = currencyId;
    
    return this.prisma.cashAudit.findMany({
      where,
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const audit = await this.prisma.cashAudit.findFirst({
      where: { id, userId },
      include: { currency: true },
    });

    if (!audit) {
      throw new NotFoundException('Arqueo no encontrado');
    }

    return audit;
  }
}
