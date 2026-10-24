import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { toDecimalString } from "../common/utils/decimal-serialization";
import { Decimal } from "decimal.js";
import { CreateExpenseItemDto } from './dto/create-expense-item.dto';
import { UpdateExpenseItemDto } from './dto/update-expense-item.dto';
import { QueryExpenseItemDto } from './dto/query-expense-item.dto';

@Injectable()
export class ExpenseItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateExpenseItemDto, userId: number) {
    // Round amount to 2 decimal places
    const amount = Math.round(createDto.amount * 100) / 100;

    return this.prisma.expenseItem.create({
      data: {
        name: createDto.name.trim(),
        amount: new Decimal(amount),
        category: createDto.category?.trim() || null,
        userId,
      },
    });
  }

  async findAll(query: QueryExpenseItemDto, userId: number) {
    const where: any = { userId };

    if (query.category) {
      where.category = query.category;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    return this.prisma.expenseItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const expenseItem = await this.prisma.expenseItem.findFirst({
      where: { id, userId },
    });

    if (!expenseItem) {
      throw new NotFoundException('Elemento de gasto no encontrado');
    }

    return expenseItem;
  }

  async update(id: number, updateDto: UpdateExpenseItemDto, userId: number) {
    await this.findOne(id, userId);

    const data: any = {};

    if (updateDto.name !== undefined) {
      data.name = updateDto.name.trim();
    }

    if (updateDto.amount !== undefined) {
      const amount = Math.round(updateDto.amount * 100) / 100;
      data.amount = new Decimal(amount);
    }

    if (updateDto.category !== undefined) {
      data.category = updateDto.category?.trim() || null;
    }

    return this.prisma.expenseItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    return this.prisma.expenseItem.delete({
      where: { id },
    });
  }

  async getReport(period: string, userId: number, dateParam?: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let periodLabel = '';

    switch (period) {
      case 'month': {
        const [year, month] = (dateParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`).split('-');
        startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
        periodLabel = `${year}-${month}`;
        break;
      }
      case 'quarter': {
        const [year, quarter] = (dateParam || `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`).split('-Q');
        const q = parseInt(quarter);
        startDate = new Date(parseInt(year), (q - 1) * 3, 1);
        endDate = new Date(parseInt(year), q * 3, 0, 23, 59, 59, 999);
        periodLabel = `${year}-Q${q}`;
        break;
      }
      case 'semester': {
        const [year, semester] = (dateParam || `${now.getFullYear()}-S${Math.ceil((now.getMonth() + 1) / 6)}`).split('-S');
        const s = parseInt(semester);
        startDate = new Date(parseInt(year), (s - 1) * 6, 1);
        endDate = new Date(parseInt(year), s * 6, 0, 23, 59, 59, 999);
        periodLabel = `${year}-S${s}`;
        break;
      }
      case 'year': {
        const year = dateParam || String(now.getFullYear());
        startDate = new Date(parseInt(year), 0, 1);
        endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
        periodLabel = year;
        break;
      }
      case 'all': {
        const items = await this.prisma.expenseItem.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        return this.buildReport(items, period);
      }
      case 'single': {
        if (!dateParam || isNaN(parseInt(dateParam))) {
          throw new BadRequestException('Se requiere ID del elemento');
        }
        const item = await this.findOne(parseInt(dateParam), userId);
        return this.buildReport([item], period);
      }
      default: {
        throw new BadRequestException('Período inválido. Use: month, quarter, semester, year, all, single');
      }
    }

    // Validate date range
    if (startDate > endDate) {
      throw new BadRequestException('La fecha inicio debe ser anterior a la fecha fin');
    }

    const items = await this.prisma.expenseItem.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return this.buildReport(items, period, {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });
  }

  private buildReport(items: any[], period: string, periodInfo?: { start: string; end: string }) {
    const count = items.length;
    let total = new Decimal(0);

    const itemsWithAmounts = items.map((item) => {
      const amount = new Decimal(String(item.amount ?? 0));
      total = total.plus(amount);
      return {
        ...item,
        amount: toDecimalString(amount),
      };
    });

    const average = count > 0 ? total.div(count) : new Decimal(0);

    return {
      items: itemsWithAmounts,
      total: toDecimalString(total),
      count,
      average: toDecimalString(average),
      period: periodInfo,
    };
  }

  async getCategories(userId: number): Promise<string[]> {
    const items = await this.prisma.expenseItem.findMany({
      where: {
        userId,
        category: { not: null },
      },
      select: { category: true },
      distinct: ['category'],
    });

    return items.map((item) => item.category as string).filter(Boolean);
  }
}
