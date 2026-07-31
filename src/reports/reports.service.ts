import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import type {
  AccountsReportDto,
  AuditSummaryReportDto,
  CashFlowReportDto,
  CurrencyReportDto,
  DailyReportDto,
  ExpensesReportDto,
  FxPerformanceReportDto,
  ObjectivesReportDto,
  PeriodReportDto,
  ProfitReportDto,
} from './reports.types';

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
   * Resuelve las fechas (start, end) y valida que start <= end. Si end tiene
   * horas:0:0:0:0 (caso inicio de dia), lo extiende al fin del dia (23:59:59.999)
   * para que inclusivo en el dia exacto. Lanza BadRequestException con codigo
   * REPORT_INVALID_PERIOD si end < start.
   */
  private resolvePeriod(
    startDate: string,
    endDate: string,
  ): { start: Date; end: Date } {
    const start = this.parseDate(startDate, 'startDate');
    const end = this.parseDate(endDate, 'endDate');
    if (end < start) {
      throw new BadRequestException({
        code: 'REPORT_INVALID_PERIOD',
        message: 'endDate must be on or after startDate',
      });
    }
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private async getPrimaryCurrencyCode(userId: number): Promise<string> {
    const userDelegate = (this.prisma as any).user;
    const user = typeof userDelegate?.findUnique === 'function'
      ? await userDelegate.findUnique({
        where: { id: userId },
        select: { primaryCurrency: { select: { code: true, isActive: true } } },
      })
      : null;

    return user?.primaryCurrency?.isActive
      ? user.primaryCurrency.code
      : CUP_CURRENCY_CODE;
  }

  /**
   * Obtiene la última tasa histórica registrada antes de una fecha para una
   * conversión a la moneda primaria configurada. ExchangeRate es mutable y no
   * puede reconstruir reportes históricos; RateHistory es append-only.
   */
  private async getRateToPrimary(
    userId: number,
    currencyId: number,
    currencyCode: string | undefined,
    referenceDate: Date,
    primaryCurrencyCode: string,
  ): Promise<number | null> {
    if (currencyCode === primaryCurrencyCode) return 1;

    const rate = await this.prisma.rateHistory.findFirst({
      where: {
        userId,
        currencyFromId: currencyId,
        currencyTo: { code: primaryCurrencyCode },
        createdAt: { lte: referenceDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rate ? Number(rate.rate) : null;
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

    const primaryCurrencyCode = await this.getPrimaryCurrencyCode(userId);
    let total = 0;
    let hasAnyConversion = false;
    let unconverted = 0;

    for (const expense of expenses) {
      const rate = await this.getRateToPrimary(
        userId,
        expense.currencyId,
        expense.currency.code,
        expense.date,
        primaryCurrencyCode,
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

  async getDailyReport(userId: number, date?: string): Promise<DailyReportDto> {
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

    const net = gastosInCup.unconvertedCount > 0
      ? null
      : totalProfit - (gastosInCup.totalInCup ?? 0);
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
        net: net === null ? null : Number(net.toFixed(2)),
      },
    };
  }

  async getPeriodReport(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<PeriodReportDto> {
    const { start, end } = this.resolvePeriod(startDate, endDate);

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
    const totalExpensesInCup = gastosInCup.totalInCup;

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
        netProfit: gastosInCup.unconvertedCount > 0
          ? null
          : Number((marginProfit - (totalExpensesInCup ?? 0)).toFixed(2)),
      },
      dailyBreakdown: dailyReports,
      transactionsByCurrency: this.groupByCurrency(transactions),
      expensesByCategory: this.groupByCategory(expenses),
    };
  }

  async getProfitReport(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<ProfitReportDto> {
    const { start, end } = this.resolvePeriod(startDate, endDate);

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

  async getCurrencyReport(
    userId: number,
    currencyId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<CurrencyReportDto> {
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

  async getExpensesReport(
    userId: number,
    startDate?: string,
    endDate?: string,
    category?: string,
  ): Promise<ExpensesReportDto> {
    const where: any = { userId };
    if (category) where.category = category;
    if (startDate || endDate) {
      if (startDate && endDate) {
        const { start, end } = this.resolvePeriod(startDate, endDate);
        where.date = { gte: start, lte: end };
      } else {
        where.date = {};
        if (startDate) where.date.gte = this.parseDate(startDate, 'startDate');
        if (endDate) where.date.lte = this.parseDate(endDate, 'endDate');
      }
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

  async getAccountsReport(userId: number): Promise<AccountsReportDto> {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { userId, isActive: true },
      include: { currency: true },
    });

    const accountIds = accounts.map((a) => a.id);

    if (!accountIds.length) {
      return {
        totalAccounts: 0,
        totalBalance: 0,
        accounts: [],
      };
    }

    // En vez de N*2 queries por cuenta, hacemos 3 queries globales
    // (1 findMany + 3 groupBy en paralelo) que escalan con la cantidad
    // de cuentas, no con el producto cuentas * (expenses + transfers).
    const [expenseGroupsByAccount, transferGroupsBySource, transferGroupsByDest] = await Promise.all([
      this.prisma.expense.groupBy({
        by: ['sourceBankAccountId'],
        where: { userId, sourceBankAccountId: { in: accountIds } },
        _count: { _all: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['sourceBankAccountId'],
        where: { userId, sourceBankAccountId: { in: accountIds } },
        _count: { _all: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['destinationBankAccountId'],
        where: { userId, destinationBankAccountId: { in: accountIds } },
        _count: { _all: true },
      }),
    ]);

    const expenseCountByAccount = new Map<number, number>();
    for (const g of expenseGroupsByAccount) {
      if (g.sourceBankAccountId != null) {
        expenseCountByAccount.set(g.sourceBankAccountId, g._count._all);
      }
    }
    const transferCountByAccount = new Map<number, number>();
    for (const g of transferGroupsBySource) {
      if (g.sourceBankAccountId != null) {
        transferCountByAccount.set(
          g.sourceBankAccountId,
          (transferCountByAccount.get(g.sourceBankAccountId) ?? 0) + g._count._all,
        );
      }
    }
    for (const g of transferGroupsByDest) {
      if (g.destinationBankAccountId != null) {
        transferCountByAccount.set(
          g.destinationBankAccountId,
          (transferCountByAccount.get(g.destinationBankAccountId) ?? 0) + g._count._all,
        );
      }
    }

    const accountsWithSummary = accounts.map((account) => {
      const expenseCount = expenseCountByAccount.get(account.id) ?? 0;
      const transferCount = transferCountByAccount.get(account.id) ?? 0;

      return {
        ...account,
        balance: Number(account.balance),
        transactionCount: expenseCount + transferCount,
      };
    });

    return {
      totalAccounts: accounts.length,
      totalBalance: accounts.reduce(
        (sum, a) => sum + Number(a.balance),
        0,
      ),
      accounts: accountsWithSummary,
    };
  }

  async getObjectivesReport(userId: number): Promise<ObjectivesReportDto> {
    const objectives = await this.prisma.objective.findMany({
      where: { userId },
      include: { currency: true, bankAccount: true },
    });

    const objectivesWithProgress: ObjectivesReportDto['objectives'] = objectives.map((obj) => {
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

  async getCashFlowReport(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<CashFlowReportDto> {
    const { start, end } = this.resolvePeriod(startDate, endDate);

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

    type Bucket = CashFlowReportDto['currencies'][number];
    const emptyBucket = (code: string, symbol: string): Bucket => ({
      currency: { code, symbol },
      inflows: { transactions: 0, adjustments: 0, total: 0 },
      outflows: { transactions: 0, expenses: 0, adjustments: 0, total: 0 },
      balance: 0,
    });
    const buckets = new Map<string, Bucket>();
    const add = (
      code: string,
      symbol: string,
      section: 'inflows' | 'outflows',
      field: 'transactions' | 'expenses' | 'adjustments',
      amount: number,
    ) => {
      const bucket = buckets.get(code) ?? emptyBucket(code, symbol);
      const currentAmount = (bucket[section] as Record<string, number>)[field] ?? 0;
      const nextSection = {
        ...bucket[section],
        [field]: Number((currentAmount + amount).toFixed(2)),
      };
      const total = Object.entries(nextSection)
        .filter(([key]) => key !== 'total')
        .reduce((sum, [, value]) => sum + value, 0);
      buckets.set(code, {
        ...bucket,
        [section]: { ...nextSection, total: Number(total.toFixed(2)) },
      });
    };

    transactions.forEach((transaction) => {
      add(
        CUP_CURRENCY_CODE,
        '$',
        transaction.type === 'VENTA' ? 'inflows' : 'outflows',
        'transactions',
        Number(transaction.totalCup),
      );
    });
    expenses.forEach((expense) => {
      add(
        expense.currency.code,
        expense.currency.symbol,
        'outflows',
        'expenses',
        Number(expense.amount),
      );
    });
    adjustments.forEach((adjustment) => {
      add(
        adjustment.currency.code,
        adjustment.currency.symbol,
        adjustment.type === 'INGRESO' ? 'inflows' : 'outflows',
        'adjustments',
        Number(adjustment.amount),
      );
    });

    return {
      period: { startDate, endDate },
      currencies: [...buckets.values()]
        .map((bucket) => ({
          ...bucket,
          balance: Number(
            (bucket.inflows.total - bucket.outflows.total).toFixed(2),
          ),
        }))
        .sort((a, b) =>
          a.currency.code === CUP_CURRENCY_CODE
            ? -1
            : b.currency.code === CUP_CURRENCY_CODE
              ? 1
              : a.currency.code.localeCompare(b.currency.code),
        ),
    };
  }

  async getAuditSummary(
    userId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<AuditSummaryReportDto> {
    const where: any = { userId };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate && endDate) {
        const { start, end } = this.resolvePeriod(startDate, endDate);
        where.createdAt = { gte: start, lte: end };
      } else {
        if (startDate) where.createdAt.gte = this.parseDate(startDate, 'startDate');
        if (endDate) where.createdAt.lte = this.parseDate(endDate, 'endDate');
      }
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
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(23, 59, 59, 999);

    // Un solo aggregate por tabla: agrupamos por fecha (truncada a día) y
    // sumamos monto y marginProfit. Prisma no soporta date_trunc directo,
    // así que traemos todas las filas del rango y agrupamos en JS. Sigue
    // siendo O(N) en la DB pero con 2 queries en vez de N*2, y sin counts
    // separados por día.
    const [transactions, expenses] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, createdAt: { gte: startDay, lte: endDay } },
        select: { createdAt: true, marginProfit: true, totalCup: true, type: true },
      }),
      this.prisma.expense.findMany({
        where: { userId, date: { gte: startDay, lte: endDay } },
        select: { date: true, amount: true, currencyId: true, currency: { select: { code: true } } },
      }),
    ]);
    const primaryCurrencyCode = await this.getPrimaryCurrencyCode(userId);

    const buckets = new Map<
      string,
      {
        transactions: number;
        transactionsTotalCup: number;
        expenses: number;
        expensesTotalCup: number;
        expensesUnconverted: number;
        marginProfit: number;
      }
    >();

    const dateKey = (d: Date) => d.toISOString().split('T')[0];

    // Build all days in range first (so empty days show as 0)
    const cursor = new Date(startDay);
    while (cursor <= endDay) {
      buckets.set(dateKey(cursor), {
        transactions: 0,
        transactionsTotalCup: 0,
        expenses: 0,
        expensesTotalCup: 0,
        expensesUnconverted: 0,
        marginProfit: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const tx of transactions) {
      const key = dateKey(tx.createdAt);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.transactions += 1;
      bucket.transactionsTotalCup += Number(tx.totalCup);
      bucket.marginProfit += Number(tx.marginProfit);
    }

    for (const expense of expenses) {
      const key = dateKey(expense.date);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.expenses += 1;
      const rate = await this.getRateToPrimary(
        userId,
        expense.currencyId,
        expense.currency?.code,
        expense.date,
        primaryCurrencyCode,
      );
      if (rate === null) {
        bucket.expensesUnconverted += 1;
      } else {
        bucket.expensesTotalCup += Number(expense.amount) * rate;
      }
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, b]) => ({
        date,
        transactions: b.transactions,
        transactionsTotalCup: Number(b.transactionsTotalCup.toFixed(2)),
        expenses: b.expenses,
        expensesTotalCup: Number(b.expensesTotalCup.toFixed(2)),
        expensesUnconverted: b.expensesUnconverted,
        marginProfit: Number(b.marginProfit.toFixed(2)),
      }));
  }
  async getFxPerformanceReport(
    userId: number,
    startDate: string,
    endDate: string,
    currencyCode?: string,
  ): Promise<FxPerformanceReportDto> {
    let start: Date; let end: Date;
    try {
      ({ start, end } = this.resolvePeriod(startDate, endDate));
    } catch (error) {
      throw new BadRequestException({
        code: 'REPORT_INVALID_PERIOD',
        message: (error as Error).message,
      });
    }
    const movements = await this.prisma.currencyMovement.findMany({
      where: { userId, type: 'SALE', createdAt: { gte: start, lte: end }, ...(currencyCode ? { currency: { code: currencyCode } } : {}) },
      include: { currency: true }, orderBy: { createdAt: 'asc' },
    });
    const sales = movements.map((movement: any) => ({ id: movement.id, currency: movement.currency.code, amount: Number(movement.amount), rate: Number(movement.rate), costoPromedio: Number(movement.costSnapshot ?? 0), rendimiento: Number(movement.realizedProfit ?? 0), createdAt: movement.createdAt }));
    const positions = await this.prisma.currencyPosition.findMany({ where: { userId, ...(currencyCode ? { currency: { code: currencyCode } } : {}) }, include: { currency: true }, orderBy: { currencyId: 'asc' } });
    return { period: { startDate, endDate }, currency: currencyCode ?? null, totalRendimiento: sales.reduce((sum: number, sale: any) => sum + sale.rendimiento, 0), movements: sales, positions: positions.map((position: any) => ({ currencyId: position.currencyId, currency: position.currency.code, saldo: Number(position.saldo), costoPromedio: position.costoPromedio == null ? null : Number(position.costoPromedio), reviewStatus: position.reviewStatus, reviewedAt: position.reviewedAt, availableForSale: position.reviewStatus === 'REVIEWED' && Number(position.saldo) > 0 })) };
  }
}
