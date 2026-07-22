import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';

const CUP_CURRENCY_CODE = 'CUP';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private parseDate(dateStr: string, paramName: string): Date {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(
        `${paramName} inválido: "${dateStr}". Usá formato YYYY-MM-DD`,
      );
    }
    return date;
  }

  /**
   * Obtiene la tasa vigente (referenceRate) de una moneda a CUP para una fecha
   * dada. Si la moneda ya es CUP devuelve 1. Si no hay tasa registrada devuelve
   * null (no se puede convertir).
   */
  private async getRateToCup(
    userId: number,
    currencyId: number,
    currencyCode: string | undefined,
    referenceDate: Date,
  ): Promise<number | null> {
    if (currencyCode === CUP_CURRENCY_CODE) return 1;

    const rate = await this.prisma.exchangeRate.findFirst({
      where: {
        userId,
        currencyId,
        effectiveDate: { lte: referenceDate },
      },
      orderBy: { effectiveDate: 'desc' },
    });

    return rate ? Number(rate.referenceRate) : null;
  }

  /**
   * Suma los montos de los gastos en CUP usando la tasa vigente a la fecha de
   * cada gasto. Devuelve el total convertido a CUP y la lista de gastos que no
   * se pudieron convertir (sin tasa registrada).
   */
  private async sumExpensesInCup(
    userId: number,
    expenses: Array<{
      amount: any;
      date: Date;
      currencyId: number;
      currency: { code: string };
    }>,
  ): Promise<{ totalInCup: number | null; unconvertedCount: number }> {
    if (!expenses.length) return { totalInCup: 0, unconvertedCount: 0 };

    let total = 0;
    let hasAnyConversion = false;
    let unconverted = 0;

    for (const expense of expenses) {
      const rate = await this.getRateToCup(
        userId,
        expense.currencyId,
        expense.currency.code,
        expense.date,
      );
      if (rate === null) {
        unconverted += 1;
        continue;
      }
      total += Number(expense.amount) * rate;
      hasAnyConversion = true;
    }

    return {
      totalInCup: hasAnyConversion ? Number(total.toFixed(2)) : null,
      unconvertedCount: unconverted,
    };
  }

  async getDailyReport(userId: number, date?: string) {
    const targetDate = date ? this.parseDate(date, 'date') : new Date();
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
    const gastosInCup = await this.sumExpensesInCup(userId, expenses);
    const totalProfit = transactions.reduce(
      (sum, t) => sum + Number(t.marginProfit),
      0,
    );

    const totalCostsForNet =
      gastosInCup.totalInCup !== null ? gastosInCup.totalInCup : totalGastos;
    const net = totalVentas - totalCompras - totalCostsForNet;
    const marginPct = totalVentas > 0
      ? (totalProfit / totalVentas) * 100
      : 0;

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
        totalAmountInCup: gastosInCup.totalInCup,
        unconvertedCount: gastosInCup.unconvertedCount,
        byCategory: this.groupByCategory(expenses),
      },
      profit: {
        margin: Number(marginPct.toFixed(2)),
        marginProfit: totalProfit,
        net: Number(net.toFixed(2)),
      },
    };
  }

  async getPeriodReport(userId: number, startDate: string, endDate: string) {
    const start = this.parseDate(startDate, 'startDate');
    const end = this.parseDate(endDate, 'endDate');
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

    const totalExpensesAmount = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const gastosInCup = await this.sumExpensesInCup(userId, expenses);
    const totalExpensesInCup =
      gastosInCup.totalInCup !== null ? gastosInCup.totalInCup : totalExpensesAmount;

    const marginProfit = transactions.reduce(
      (sum, t) => sum + Number(t.marginProfit),
      0,
    );

    return {
      period: { startDate, endDate },
      summary: {
        totalTransactions: transactions.length,
        totalExpensesCount: expenses.length,
        totalExpensesAmount,
        totalExpensesInCup,
        unconvertedExpensesCount: gastosInCup.unconvertedCount,
        marginProfit,
        netProfit: Number((marginProfit - totalExpensesInCup).toFixed(2)),
      },
      dailyBreakdown: dailyReports,
      transactionsByCurrency: this.groupByCurrency(transactions),
      expensesByCategory: this.groupByCategory(expenses),
    };
  }

  async getProfitReport(userId: number, startDate: string, endDate: string) {
    const start = this.parseDate(startDate, 'startDate');
    const end = this.parseDate(endDate, 'endDate');
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
      if (startDate) where.createdAt.gte = this.parseDate(startDate, 'startDate');
      if (endDate) where.createdAt.lte = this.parseDate(endDate, 'endDate');
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
      if (startDate) where.date.gte = this.parseDate(startDate, 'startDate');
      if (endDate) where.date.lte = this.parseDate(endDate, 'endDate');
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      include: { currency: true },
      orderBy: { date: 'desc' },
    });

    const totalByCategory = this.groupByCategory(expenses);
    const totalByCurrency = this.groupExpensesByCurrency(expenses);
    const gastosInCup = await this.sumExpensesInCup(userId, expenses);

    return {
      total: expenses.length,
      totalAmount: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      totalAmountInCup: gastosInCup.totalInCup,
      unconvertedCount: gastosInCup.unconvertedCount,
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
        const expenseCount = await this.prisma.expense.count({
          where: { sourceBankAccountId: account.id, userId },
        });
        const transferCount = await this.prisma.transaction.count({
          where: { userId, OR: [{ sourceBankAccountId: account.id }, { destinationBankAccountId: account.id }] },
        });

        return {
          ...account,
          balance: Number(account.balance),
          transactionCount: expenseCount + transferCount,
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
    const start = this.parseDate(startDate, 'startDate');
    const end = this.parseDate(endDate, 'endDate');
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
      if (startDate) where.createdAt.gte = this.parseDate(startDate, 'startDate');
      if (endDate) where.createdAt.lte = this.parseDate(endDate, 'endDate');
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
  async getFxPerformanceReport(userId: number, startDate: string, endDate: string, currencyCode?: string) {
    let start: Date; let end: Date;
    try { start = this.parseDate(startDate, 'startDate'); end = this.parseDate(endDate, 'endDate'); } catch (error) { throw new BadRequestException({ code: 'REPORT_INVALID_PERIOD', message: (error as Error).message }); }
    if (end < start) throw new BadRequestException({ code: 'REPORT_INVALID_PERIOD', message: 'endDate must be on or after startDate' });
    end.setHours(23, 59, 59, 999);
    const movements = await this.prisma.currencyMovement.findMany({
      where: { userId, type: 'SALE', createdAt: { gte: start, lte: end }, ...(currencyCode ? { currency: { code: currencyCode } } : {}) },
      include: { currency: true }, orderBy: { createdAt: 'asc' },
    });
    const sales = movements.map((movement: any) => ({ id: movement.id, currency: movement.currency.code, amount: Number(movement.amount), rate: Number(movement.rate), costoPromedio: Number(movement.costSnapshot ?? 0), rendimiento: Number(movement.realizedProfit ?? 0), createdAt: movement.createdAt }));
    const positions = await this.prisma.currencyPosition.findMany({ where: { userId, ...(currencyCode ? { currency: { code: currencyCode } } : {}) }, include: { currency: true }, orderBy: { currencyId: 'asc' } });
    return { period: { startDate, endDate }, currency: currencyCode ?? null, totalRendimiento: sales.reduce((sum: number, sale: any) => sum + sale.rendimiento, 0), movements: sales, positions: positions.map((position: any) => ({ currencyId: position.currencyId, currency: position.currency.code, saldo: Number(position.saldo), costoPromedio: position.costoPromedio == null ? null : Number(position.costoPromedio), availableForSale: position.reviewStatus === 'REVIEWED' && Number(position.saldo) > 0 })) };
  }
}
