import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateExpenseDto, userId: number) {
    return this.prisma.expense.create({
      data: {
        description: createDto.description,
        amount: new Decimal(createDto.amount),
        currencyId: createDto.currencyId,
        category: createDto.category,
        date: new Date(createDto.date),
        notes: createDto.notes,
        userId,
      },
      include: { currency: true },
    });
  }

  async findAll(query: QueryExpenseDto, userId: number) {
    const where: any = { userId };

    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.currencyId) where.currencyId = query.currencyId;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    return this.prisma.expense.findMany({
      where,
      include: { currency: true, reconciliation: true },
      orderBy: { date: 'desc' },
    });
  }

  async findPending(userId: number) {
    return this.prisma.expense.findMany({
      where: { status: 'PENDIENTE', userId },
      include: { currency: true },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: { currency: true, reconciliation: true },
    });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    return expense;
  }

  async update(id: number, updateDto: UpdateExpenseDto, userId: number) {
    await this.findOne(id, userId);

    const data: any = { ...updateDto };
    if (updateDto.amount) data.amount = new Decimal(updateDto.amount);
    if (updateDto.date) data.date = new Date(updateDto.date);

    return this.prisma.expense.update({
      where: { id },
      data,
      include: { currency: true },
    });
  }

  async remove(id: number, userId: number) {
    const expense = await this.findOne(id, userId);

    if (expense.status === 'RECONCILIADO') {
      throw new Error('No se puede eliminar un gasto ya reconciliado');
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
