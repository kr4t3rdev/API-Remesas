import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDailyReport(userId: number, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { currency: true },
    });

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: { currency: true },
    });

    const totalCompras = transactions
      .filter((t) => t.type === 'COMPRA')
      .reduce((sum, t) => sum + Number(t.totalCup), 0);

    const totalVentas = transactions
      .filter((t) => t.type === 'VENTA')
      .reduce((sum, t) => sum + Number(t.totalCup), 0);

    const totalGastos = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalProfit = transactions.reduce(
      (sum, t) => sum + Number(t.marginProfit),
      0,
    );

    return {
      date: targetDate.toISOString().split('T')[0],
      transactions: {
        total: transactions.length,
        compras: transactions.filter((t) => t.type === 'COMPRA').length,
        ventas: transactions.filter((t) => t.type === 'VENTA').length,
        totalCompras,
        totalVentas,
      },
      expenses: {
        total: expenses.length,
        totalAmount: totalGastos,
        byCategory: this.groupByCategory(expenses),
      },
      profit: {
        margin: totalProfit,
        net: totalVentas - totalCompras - totalGastos,
      },
    };
  }

  async getPeriodReport(userId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: start, lte: end },
      },
      include: { currency: true },
    });

    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: { currency: true },
    });

    const dailyReports = await this.getDailyBreakdown(userId, start, end);

    return {
      period: { startDate, endDate },
      summary: {
        totalTransactions: transactions.length,
        totalExpenses: expenses.length,
        totalProfit: transactions.reduce(
          (sum, t) => sum + Number(t.marginProfit),
          0,
        ),
      },
      dailyBreakdown: dailyReports,
      transactionsByCurrency: this.groupByCurrency(transactions),
      expensesByCategory: this.groupByCategory(expenses),
    };
  }

  async getProfitReport(userId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: { gte: start, lte: end },
      },
      include: { currency: true },
    });

    const byCurrency = this.groupProfitByCurrency(transactions);
    const totalMarginProfit = transactions.reduce(
      (sum, t) => sum + Number(t.marginProfit),
      0,
    );
    const totalCompras = transactions
      .filter((t) => t.type === 'COMPRA')
      .reduce((sum, t) => sum + Number(t.totalCup), 0);
    const totalVentas = transactions
      .filter((t) => t.type === 'VENTA')
      .reduce((sum, t) => sum + Number(t.totalCup), 0);

    return {
      period: { startDate, endDate },
      totalMarginProfit,
      totalCompras,
      totalVentas,
      netFlow: totalVentas - totalCompras,
      byCurrency,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        currency: t.currency.code,
        amount: Number(t.amount),
        rate: Number(t.rate),
        totalCup: Number(t.totalCup),
        marginProfit: Number(t.marginProfit),
        createdAt: t.createdAt,
      })),
    };
  }

  async getCurrencyReport(userId: number, currencyId: number, startDate?: string, endDate?: string) {
    const where: any = { userId, currencyId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });

    const cashBalance = await this.prisma.cashBalance.findUnique({
      where: { userId_currencyId: { userId, currencyId } },
    });

    return {
      currencyId,
      currency: transactions[0]?.currency || null,
      currentBalance: cashBalance ? Number(cashBalance.balance) : 0,
      totalTransactions: transactions.length,
      totalCompras: transactions
        .filter((t) => t.type === 'COMPRA')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      totalVentas: transactions
        .filter((t) => t.type === 'VENTA')
        .reduce((sum, t) => sum + Number(t.amount), 0),
      transactions,
    };
  }

  async getExpensesReport(userId: number, startDate?: string, endDate?: string, category?: string) {
    const where: any = { userId };
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      include: { currency: true },
      orderBy: { date: 'desc' },
    });

    const totalByCategory = this.groupByCategory(expenses);
    const totalByCurrency = this.groupExpensesByCurrency(expenses);

    return {
      total: expenses.length,
      totalAmount: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      byCategory: totalByCategory,
      byCurrency: totalByCurrency,
      expenses,
    };
  }

  async getAccountsReport(userId: number) {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      include: { currency: true },
    });

    const accountsWithSummary = await Promise.all(
      accounts.map(async (account) => {
        const expenseCount = await this.prisma.expenseReconciliation.count({
          where: { bankAccountId: account.id },
        });
        const incomeCount = await this.prisma.incomeReconciliation.count({
          where: { bankAccountId: account.id },
        });

        return {
          ...account,
          balance: Number(account.balance),
          transactionCount: expenseCount + incomeCount,
        };
      }),
    );

    return {
      totalAccounts: accounts.length,
      totalBalance: accounts.reduce(
        (sum, a) => sum + Number(a.balance),
        0,
      ),
      accounts: accountsWithSummary,
    };
  }

  async getObjectivesReport(userId: number) {
    const objectives = await this.prisma.objective.findMany({
      where: { userId },
      include: { currency: true, bankAccount: true },
    });

    const objectivesWithProgress = objectives.map((obj) => {
      const targetAmount = Number(obj.targetAmount);
      const currentAmount = Number(obj.currentAmount);
      const percentage =
        targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

      return {
        ...obj,
        targetAmount,
        currentAmount,
        percentage: Math.min(percentage, 100),
        remaining: Math.max(targetAmount - currentAmount, 0),
      };
    });

    return {
      total: objectives.length,
      activos: objectives.filter((o) => o.status === 'ACTIVO').length,
      completados: objectives.filter((o) => o.status === 'COMPLETADO').length,
      pausados: objectives.filter((o) => o.status === 'PAUSADO').length,
      objectives: objectivesWithProgress,
    };
  }

  async getCashFlowReport(userId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
      include: { currency: true },
    });

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { currency: true },
    });

    const adjustments = await this.prisma.cashAdjustment.findMany({
      where: { userId, createdAt: { gte: start, lte: end } },
      include: { currency: true },
    });

    return {
      period: { startDate, endDate },
      inflows: {
        ventas: transactions
          .filter((t) => t.type === 'VENTA')
          .reduce((sum, t) => sum + Number(t.totalCup), 0),
        adjustments: adjustments
          .filter((a) => a.type === 'INGRESO')
          .reduce((sum, a) => sum + Number(a.amount), 0),
      },
      outflows: {
        compras: transactions
          .filter((t) => t.type === 'COMPRA')
          .reduce((sum, t) => sum + Number(t.totalCup), 0),
        expenses: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
        adjustments: adjustments
          .filter((a) => a.type === 'EGRESO')
          .reduce((sum, a) => sum + Number(a.amount), 0),
      },
    };
  }

  async getAuditSummary(userId: number, startDate?: string, endDate?: string) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const audits = await this.prisma.cashAudit.findMany({
      where,
      include: { currency: true },
      orderBy: { createdAt: 'desc' },
    });

    const discrepancies = audits.filter((a) => Number(a.difference) !== 0);

    return {
      totalAudits: audits.length,
      withDiscrepancies: discrepancies.length,
      totalDiscrepancy: discrepancies.reduce(
        (sum, a) => sum + Number(a.difference),
        0,
      ),
      audits,
    };
  }

  private groupByCategory(expenses: any[]) {
    return expenses.reduce((acc, expense) => {
      const cat = expense.category;
      if (!acc[cat]) {
        acc[cat] = { count: 0, total: 0 };
      }
      acc[cat].count++;
      acc[cat].total += Number(expense.amount);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);
  }

  private groupByCurrency(transactions: any[]) {
    return transactions.reduce((acc, t) => {
      const code = t.currency.code;
      if (!acc[code]) {
        acc[code] = { compras: 0, ventas: 0, count: 0 };
      }
      acc[code].count++;
      if (t.type === 'COMPRA') {
        acc[code].compras += Number(t.amount);
      } else {
        acc[code].ventas += Number(t.amount);
      }
      return acc;
    }, {} as Record<string, { compras: number; ventas: number; count: number }>);
  }

  private groupProfitByCurrency(transactions: any[]) {
    return transactions.reduce((acc, t) => {
      const code = t.currency.code;
      if (!acc[code]) {
        acc[code] = { marginProfit: 0, count: 0 };
      }
      acc[code].marginProfit += Number(t.marginProfit);
      acc[code].count++;
      return acc;
    }, {} as Record<string, { marginProfit: number; count: number }>);
  }

  private groupExpensesByCurrency(expenses: any[]) {
    return expenses.reduce((acc, e) => {
      const code = e.currency.code;
      if (!acc[code]) {
        acc[code] = { total: 0, count: 0 };
      }
      acc[code].total += Number(e.amount);
      acc[code].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);
  }

  private async getDailyBreakdown(userId: number, start: Date, end: Date) {
    const days: any[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTransactions = await this.prisma.transaction.count({
        where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
      });

      const dayExpenses = await this.prisma.expense.count({
        where: { userId, date: { gte: dayStart, lte: dayEnd } },
      });

      days.push({
        date: current.toISOString().split('T')[0],
        transactions: dayTransactions,
        expenses: dayExpenses,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }
}
