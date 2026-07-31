import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { serializableTransaction } from '../common/transactions/serializable-transaction';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateExpenseDto, userId: number) {
    const amount = new Decimal(createDto.amount);
    return serializableTransaction(this.prisma, async (tx) => {
      await this.validateCurrency(tx, createDto.currencyId);
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
    if (query.currencyId !== undefined) where.currencyId = query.currencyId;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.expense.findMany({
        where,
        include: { currency: true, sourceBankAccount: true },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return { items, total, page, pageSize };
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
    return serializableTransaction(this.prisma, async (tx) => {
      await tx.$queryRaw`SELECT id FROM "expenses" WHERE id = ${id} AND "userId" = ${userId} FOR UPDATE`;
      const expense = await tx.expense.findFirst({ where: { id, userId } });
      if (!expense) throw new NotFoundException('Gasto no encontrado');
      const next = {
        amount: new Decimal(updateDto.amount ?? expense.amount),
        currencyId: updateDto.currencyId ?? expense.currencyId,
        sourceType: updateDto.sourceType ?? expense.sourceType,
        sourceBankAccountId: updateDto.sourceType === 'CASH' ? undefined : (updateDto.sourceBankAccountId ?? expense.sourceBankAccountId ?? undefined),
      };
      const financialChange =
        !next.amount.eq(new Decimal(expense.amount)) ||
        next.currencyId !== expense.currencyId ||
        next.sourceType !== expense.sourceType ||
        next.sourceBankAccountId !== (expense.sourceBankAccountId ?? undefined);
      if (financialChange) {
        await this.validateCurrency(tx, next.currencyId);
        await this.refundSource(tx, userId, expense.sourceType, expense.sourceBankAccountId ?? undefined, expense.currencyId, new Decimal(expense.amount));
        await this.debitSource(tx, userId, next.sourceType, next.sourceBankAccountId, next.currencyId, next.amount);
      }
      const data: any = { ...updateDto, ...next };
      if (updateDto.date) data.date = new Date(updateDto.date);
      data.sourceBankAccountId = next.sourceType === 'BANK_ACCOUNT' ? next.sourceBankAccountId : null;
      const updated = await tx.expense.updateMany({ where: { id, userId }, data });
      if (updated.count !== 1) throw new NotFoundException('Gasto no encontrado');
      return tx.expense.findFirst({
        where: { id, userId },
        include: { currency: true, sourceBankAccount: true },
      });
    });
  }

  async remove(id: number, userId: number) {
    return serializableTransaction(this.prisma, async (tx) => {
      await tx.$queryRaw`SELECT id FROM "expenses" WHERE id = ${id} AND "userId" = ${userId} FOR UPDATE`;
      const expense = await tx.expense.findFirst({ where: { id, userId } });
      if (!expense) throw new NotFoundException('Gasto no encontrado');
      await this.refundSource(tx, userId, expense.sourceType, expense.sourceBankAccountId ?? undefined, expense.currencyId, new Decimal(expense.amount));
      const deleted = await tx.expense.deleteMany({ where: { id, userId } });
      if (deleted.count !== 1) throw new NotFoundException('Gasto no encontrado');
      return expense;
    });
  }

  private async validateCurrency(tx: any, currencyId: number) {
    const currency = await tx.currency.findFirst({ where: { id: currencyId, isActive: true }, select: { id: true } });
    if (!currency) throw new BadRequestException('La moneda especificada no existe o está inactiva');
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
