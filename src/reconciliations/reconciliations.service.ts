import {
  Injectable,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { ReconcileExpenseDto } from './dto/reconcile-expense.dto';
import { ReconcileIncomeDto } from './dto/reconcile-income.dto';
import { ReconcileIncomeBulkDto } from './dto/reconcile-income-bulk.dto';
import { WebhookService } from '../webhook/webhook.service';
import { Decimal } from '@prisma/client/runtime/library';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class ReconciliationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WebhookService))
    private webhookService: WebhookService,
    private subscriptionsService: SubscriptionsService,
  ) {}

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

    if (dto.planId && dto.billingCycle && dto.amountUsd && dto.exchangeRateUsed) {
      await this.subscriptionsService.applyPaymentToLicense({
        userId,
        userLicenseId: dto.userLicenseId,
        planId: dto.planId,
        cycle: dto.billingCycle,
        amountUsd: dto.amountUsd,
        exchangeRateUsed: dto.exchangeRateUsed,
        paidAt: new Date(),
        notes: dto.notes,
      });
    }

    this.webhookService.sendTransactionStatus({
      transactionId: transaction.id,
      previousStatus: 'PENDIENTE',
      newStatus: 'RECONCILIADO',
      userId,
      amount: transaction.amount.toString(),
      currency: transaction.currency.code,
      totalCup: transaction.totalCup.toString(),
      reconciledAt: new Date().toISOString(),
      bankAccountId: dto.bankAccountId,
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

  async reconcileIncomeBulk(dto: ReconcileIncomeBulkDto, userId: number) {
    const { transactionIds, bankAccountId, customRates } = dto;

    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: { id: bankAccountId, userId },
      include: { currency: true },
    });

    if (!bankAccount || !bankAccount.isActive) {
      throw new NotFoundException('Cuenta bancaria no encontrada o inactiva');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId,
      },
      include: { currency: true },
    });

    if (transactions.length !== transactionIds.length) {
      throw new NotFoundException('Una o más transacciones no encontradas');
    }

    const alreadyReconciliated = transactions.filter((t) => t.status === 'RECONCILIADO');
    if (alreadyReconciliated.length > 0) {
      throw new BadRequestException(
        `Las siguientes transacciones ya están reconciliadas: ${alreadyReconciliated.map((t) => t.id).join(', ')}`,
      );
    }

    const needRateConversion = transactions.filter(
      (t) => t.currencyId !== bankAccount.currencyId,
    );

    const hasCustomRates = customRates && customRates.length > 0;

    if (needRateConversion.length > 0 && !hasCustomRates) {
      throw new BadRequestException(
        'Se requieren tasas de conversión para transacciones con moneda diferente a la cuenta bancaria',
      );
    }

    const customRatesMap = new Map(
      (customRates || []).map((cr) => [cr.transactionId, cr.appliedRate]),
    );

    let totalAmount = new Decimal(0);
    for (const transaction of transactions) {
      const customRate = customRatesMap.get(transaction.id);
      const appliedRate = customRate !== undefined ? new Decimal(customRate) : transaction.rate;
      const amount = transaction.type === 'VENTA'
        ? transaction.amount.mul(appliedRate)
        : transaction.amount;
      totalAmount = totalAmount.add(amount);
    }

    if (bankAccount.balance.lessThan(totalAmount)) {
      throw new BadRequestException(
        `Saldo insuficiente en cuenta bancaria. Disponible: ${bankAccount.balance}, requerido: ${totalAmount}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const reconciliations = [];

      for (const transaction of transactions) {
        const customRate = customRatesMap.get(transaction.id);
        const appliedRate = customRate !== undefined ? new Decimal(customRate) : null;
        const rateType = appliedRate ? 'CUSTOM' : 'ACTUAL';

        const reconciliation = await tx.incomeReconciliation.create({
          data: {
            transactionId: transaction.id,
            bankAccountId,
            amount: transaction.amount,
            appliedRate,
            rateType: appliedRate ? (rateType as any) : null,
          },
          include: { transaction: { include: { currency: true } }, bankAccount: { include: { currency: true } } },
        });

        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'RECONCILIADO' },
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

        reconciliations.push(reconciliation);
      }

      await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: { increment: totalAmount } },
      });

      return reconciliations;
    });

    for (const reconciliation of result) {
      this.webhookService.sendTransactionStatus({
        transactionId: reconciliation.transaction.id,
        previousStatus: 'PENDIENTE',
        newStatus: 'RECONCILIADO',
        userId,
        amount: reconciliation.transaction.amount.toString(),
        currency: reconciliation.transaction.currency.code,
        totalCup: reconciliation.transaction.totalCup.toString(),
        reconciledAt: new Date().toISOString(),
        bankAccountId: reconciliation.bankAccountId,
      });
    }

    return result;
  }

  async reconcileIncomeWithTransaction(
    dto: { transactionId: number; bankAccountId: number; amount: number },
    userId: number,
  ) {
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

    const result = await this.prisma.$transaction(async (tx) => {
      const reconciliation = await tx.incomeReconciliation.create({
        data: {
          transactionId: dto.transactionId,
          bankAccountId: dto.bankAccountId,
          amount,
          appliedRate: null,
          rateType: null,
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

      return reconciliation;
    });

    this.webhookService.sendTransactionStatus({
      transactionId: transaction.id,
      previousStatus: 'PENDIENTE',
      newStatus: 'RECONCILIADO',
      userId,
      amount: transaction.amount.toString(),
      currency: transaction.currency.code,
      totalCup: transaction.totalCup.toString(),
      reconciledAt: new Date().toISOString(),
      bankAccountId: dto.bankAccountId,
    });

    return result;
  }
}
