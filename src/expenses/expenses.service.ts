import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateExpenseDto, userId: number) {
    const amount = new Decimal(createDto.amount);
    return this.prisma.$transaction(async (tx) => {
      await this.debitSource(tx, userId, createDto.sourceType, createDto.sourceBankAccountId, createDto.currencyId, amount);

      return tx.expense.create({ data: {
        description: createDto.description,
        amount,
        currencyId: createDto.currencyId,
        category: createDto.category,
        date: new Date(createDto.date),
        notes: createDto.notes,
        userId,
        sourceType: createDto.sourceType,
        sourceBankAccountId: createDto.sourceType === 'BANK_ACCOUNT' ? createDto.sourceBankAccountId : null,
      }, include: { currency: true, sourceBankAccount: true },
      });
    });
  }

  async findAll(query: QueryExpenseDto, userId: number) {
    const where: any = { userId };

    if (query.category) where.category = query.category;
    if (query.currencyId) where.currencyId = query.currencyId;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    return this.prisma.expense.findMany({
      where,
      include: { currency: true, sourceBankAccount: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: { currency: true, sourceBankAccount: true },
    });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    return expense;
  }

  async update(id: number, updateDto: UpdateExpenseDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "expenses" WHERE id = ${id} AND "userId" = ${userId} FOR UPDATE`;
      const expense = await tx.expense.findFirst({ where: { id, userId } });
      if (!expense) throw new NotFoundException('Gasto no encontrado');
      const next = {
        amount: new Decimal(updateDto.amount ?? expense.amount),
        currencyId: updateDto.currencyId ?? expense.currencyId,
        sourceType: updateDto.sourceType ?? expense.sourceType,
        sourceBankAccountId: updateDto.sourceType === 'CASH' ? undefined : (updateDto.sourceBankAccountId ?? expense.sourceBankAccountId ?? undefined),
      };
      await this.refundSource(tx, userId, expense.sourceType, expense.sourceBankAccountId ?? undefined, expense.currencyId, new Decimal(expense.amount));
      await this.debitSource(tx, userId, next.sourceType, next.sourceBankAccountId, next.currencyId, next.amount);
      const data: any = { ...updateDto, ...next };
      if (updateDto.date) data.date = new Date(updateDto.date);
      data.sourceBankAccountId = next.sourceType === 'BANK_ACCOUNT' ? next.sourceBankAccountId : null;
      return tx.expense.update({ where: { id }, data, include: { currency: true, sourceBankAccount: true } });
    });
  }

  async remove(id: number, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "expenses" WHERE id = ${id} AND "userId" = ${userId} FOR UPDATE`;
      const expense = await tx.expense.findFirst({ where: { id, userId } });
      if (!expense) throw new NotFoundException('Gasto no encontrado');
      await this.refundSource(tx, userId, expense.sourceType, expense.sourceBankAccountId ?? undefined, expense.currencyId, new Decimal(expense.amount));
      return tx.expense.delete({ where: { id } });
    });
  }

  private async debitSource(tx: any, userId: number, sourceType: string, bankAccountId: number | undefined, currencyId: number, amount: Decimal) {
    if (sourceType === 'BANK_ACCOUNT') {
      if (!bankAccountId) throw new BadRequestException('La cuenta bancaria es requerida');
      const result = await tx.bankAccount.updateMany({
        where: { id: bankAccountId, userId, isActive: true, currencyId, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });
      if (result.count !== 1) throw new BadRequestException('Cuenta inválida o saldo bancario insuficiente');
      return;
    }
    const result = await tx.cashBalance.updateMany({
      where: { userId, currencyId, balance: { gte: amount } }, data: { balance: { decrement: amount } },
    });
    if (result.count !== 1) throw new BadRequestException('Saldo de caja insuficiente');
  }

  private async refundSource(tx: any, userId: number, sourceType: string, bankAccountId: number | undefined, currencyId: number, amount: Decimal) {
    if (sourceType === 'BANK_ACCOUNT') {
      if (!bankAccountId) throw new BadRequestException('El gasto no tiene una cuenta bancaria válida');
      const result = await tx.bankAccount.updateMany({ where: { id: bankAccountId, userId, currencyId }, data: { balance: { increment: amount } } });
      if (result.count !== 1) throw new BadRequestException('No se pudo reintegrar la cuenta bancaria');
      return;
    }
    await tx.cashBalance.upsert({
      where: { userId_currencyId: { userId, currencyId } },
      update: { balance: { increment: amount } }, create: { userId, currencyId, balance: amount },
    });
  }
}
