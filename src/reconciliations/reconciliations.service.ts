import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { ReconcileExpenseDto } from './dto/reconcile-expense.dto';
import { ReconcileIncomeDto } from './dto/reconcile-income.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReconciliationsService {
  constructor(private prisma: PrismaService) {}

  async reconcileExpense(dto: ReconcileExpenseDto, userId: number) {
    const expense = await this.prisma.expense.findFirst({
      where: { id: dto.expenseId, userId },
      include: { currency: true },
    });

    if (!expense) {
      throw new NotFoundException('Gasto no encontrado');
    }

    if (expense.status === 'RECONCILIADO') {
      throw new BadRequestException('El gasto ya está reconciliado');
    }

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: dto.bankAccountId, userId },
      include: { currency: true },
    });

    if (!bankAccount || !bankAccount.isActive) {
      throw new NotFoundException('Cuenta bancaria no encontrada o inactiva');
    }

    const amount = new Decimal(dto.amount);
    let appliedRate = dto.appliedRate ? new Decimal(dto.appliedRate) : null;
    const rateType = dto.rateType || 'ACTUAL';

    if (expense.currencyId !== bankAccount.currencyId && !appliedRate) {
      throw new BadRequestException(
        'Se requiere tasa de conversión cuando las monedas son diferentes',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const reconciliation = await tx.expenseReconciliation.create({
        data: {
          expenseId: dto.expenseId,
          bankAccountId: dto.bankAccountId,
          amount,
          appliedRate,
          rateType: appliedRate ? (rateType as any) : null,
          notes: dto.notes,
        },
        include: { expense: { include: { currency: true } }, bankAccount: { include: { currency: true } } },
      });

      await tx.expense.update({
        where: { id: dto.expenseId },
        data: { status: 'RECONCILIADO' },
      });

      await tx.bankAccount.update({
        where: { id: dto.bankAccountId },
        data: { balance: { decrement: amount } },
      });

      if (appliedRate && rateType === 'CUSTOM') {
        const cupCurrency = await tx.currency.findUnique({ where: { code: 'CUP' } });
        await tx.rateHistory.create({
          data: {
            userId,
            currencyFromId: bankAccount.currencyId,
            currencyToId: expense.currencyId,
            rate: appliedRate,
            source: 'MANUAL',
            referenceType: 'expense',
            referenceId: reconciliation.id,
          },
        });
      }

      return reconciliation;
    });

    return result;
  }

  async reconcileIncome(dto: ReconcileIncomeDto, userId: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: dto.transactionId, userId },
      include: { currency: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (transaction.status === 'RECONCILIADO') {
      throw new BadRequestException('La transacción ya está reconciliada');
    }

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: dto.bankAccountId, userId },
      include: { currency: true },
    });

    if (!bankAccount || !bankAccount.isActive) {
      throw new NotFoundException('Cuenta bancaria no encontrada o inactiva');
    }

    const amount = new Decimal(dto.amount);
    let appliedRate = dto.appliedRate ? new Decimal(dto.appliedRate) : null;
    const rateType = dto.rateType || 'ACTUAL';

    if (transaction.currencyId !== bankAccount.currencyId && !appliedRate) {
      throw new BadRequestException(
        'Se requiere tasa de conversión cuando las monedas son diferentes',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const reconciliation = await tx.incomeReconciliation.create({
        data: {
          transactionId: dto.transactionId,
          bankAccountId: dto.bankAccountId,
          amount,
          appliedRate,
          rateType: appliedRate ? (rateType as any) : null,
          notes: dto.notes,
        },
        include: { transaction: { include: { currency: true } }, bankAccount: { include: { currency: true } } },
      });

      await tx.transaction.update({
        where: { id: dto.transactionId },
        data: { status: 'RECONCILIADO' },
      });

      await tx.bankAccount.update({
        where: { id: dto.bankAccountId },
        data: { balance: { increment: amount } },
      });

      if (appliedRate && rateType === 'CUSTOM') {
        await tx.rateHistory.create({
          data: {
            userId,
            currencyFromId: transaction.currencyId,
            currencyToId: bankAccount.currencyId,
            rate: appliedRate,
            source: 'MANUAL',
            referenceType: 'income',
            referenceId: reconciliation.id,
          },
        });
      }

      return reconciliation;
    });

    return result;
  }

  async findAll(userId: number) {
    const expenses = await this.prisma.expenseReconciliation.findMany({
      where: {
        expense: { userId },
      },
      include: {
        expense: { include: { currency: true } },
        bankAccount: { include: { currency: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const incomes = await this.prisma.incomeReconciliation.findMany({
      where: {
        transaction: { userId },
      },
      include: {
        transaction: { include: { currency: true } },
        bankAccount: { include: { currency: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { expenses, incomes };
  }

  async findOne(id: number, type: 'expense' | 'income', userId: number) {
    if (type === 'expense') {
      return this.prisma.expenseReconciliation.findFirst({
        where: {
          id,
          expense: { userId },
        },
        include: {
          expense: { include: { currency: true } },
          bankAccount: { include: { currency: true } },
        },
      });
    } else {
      return this.prisma.incomeReconciliation.findFirst({
        where: {
          id,
          transaction: { userId },
        },
        include: {
          transaction: { include: { currency: true } },
          bankAccount: { include: { currency: true } },
        },
      });
    }
  }
}
