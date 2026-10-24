import { Injectable, BadRequestException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { toDecimalString } from '../common/utils/decimal-serialization';
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

/** Coerce any Decimal-like value (Prisma Decimal, string, number) to decimal.js. */
const dec = (value: unknown): Decimal => new Decimal(String(value ?? 0));

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
    end.setUTCHours(23, 59, 59, 999);
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
  ): Promise<Decimal | null> {
    if (currencyCode === primaryCurrencyCode) return new Decimal(1);

    const rate = await this.prisma.rateHistory.findFirst({
      where: {
        userId,
        currencyFromId: currencyId,
        currencyTo: { code: primaryCurrencyCode },
        createdAt: { lte: referenceDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rate ? dec(rate.rate) : null;
  }

  /**
   * Suma los montos de los gastos en CUP usando la tasa vigente a la fecha de
   * cada gasto. Devuelve el total convertido a CUP y la lista de gastos que no
   * se pudieron convertir (sin tasa registrada).
   */
  private async sumExpensesInCupDecimal(
    userId: number,
    expenses: Array<{
      amount: any;
      date: Date;
      currencyId: number;
      currency: { code: string };
    }>,
  ): Promise<{ total: Decimal | null; unconvertedCount: number }> {
    if (!expenses.length) return { total: new Decimal(0), unconvertedCount: 0 };

    const primaryCurrencyCode = await this.getPrimaryCurrencyCode(userId);
    let total = new Decimal(0);
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
      total = total.plus(dec(expense.amount).mul(rate));
      hasAnyConversion = true;
    }

    return {
      total: hasAnyConversion ? total : null,
      unconvertedCount: unconverted,
    };
  }

  private async sumExpensesInCup(
    userId: number,
    expenses: Array<{
      amount: any;
      date: Date;
      currencyId: number;
      currency: { code: string };
    }>,
  ): Promise<{ totalInCup: string | null; unconvertedCount: number }> {
    const result = await this.sumExpensesInCupDecimal(userId, expenses);
    return {
      totalInCup: result.total === null ? null : toDecimalString(result.total),
      unconvertedCount: result.unconvertedCount,
    };
  }

  async getDailyReport(userId: number, date?: string): Promise<DailyReportDto> {
    const targetDate = date ? this.parseDate(date, 'date') : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

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
      .reduce((sum, t) => sum.plus(t.totalCup), new Decimal(0));

    const totalVentas = transactions
      .filter((t) => t.type === 'VENTA')
      .reduce((sum, t) => sum.plus(t.totalCup), new Decimal(0));

    const totalGastos = expenses.reduce((sum, e) => sum.plus(e.amount), new Decimal(0));
    const gastosInCup = await this.sumExpensesInCupDecimal(userId, expenses);
    const totalProfit = transactions.reduce(
      (sum, t) => sum.plus(t.marginProfit),
      new Decimal(0),
    );

    const net = gastosInCup.unconvertedCount > 0
      ? null
      : totalProfit.minus(gastosInCup.total ?? 0);
    const marginPct = totalVentas.gt(0)
      ? Number(totalProfit.div(totalVentas).mul(100).toDecimalPlaces(2))
      : 0;

    return {
      date: targetDate.toISOString().split('T')[0],
      transactions: {
        total: transactions.length,
        compras: transactions.filter((t) => t.type === 'COMPRA').length,
        ventas: transactions.filter((t) => t.type === 'VENTA').length,
        totalCompras: toDecimalString(totalCompras),
        totalVentas: toDecimalString(totalVentas),
      },
      expenses: {
        total: expenses.length,
        totalAmount: toDecimalString(totalGastos),
        totalAmountInCup: gastosInCup.total === null ? null : toDecimalString(gastosInCup.total),
        unconvertedCount: gastosInCup.unconvertedCount,
        byCategory: this.groupByCategory(expenses),
      },
      profit: {
        margin: marginPct,
        marginProfit: toDecimalString(totalProfit),
        net: net === null ? null : toDecimalString(net),
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
      (sum, e) => sum.plus(e.amount),
      new Decimal(0),
    );
    const gastosInCup = await this.sumExpensesInCupDecimal(userId, expenses);
    const totalExpensesInCup = gastosInCup.total;

    const marginProfit = transactions.reduce(
      (sum, t) => sum.plus(t.marginProfit),
      new Decimal(0),
    );

    return {
      period: { startDate, endDate },
      summary: {
        totalTransactions: transactions.length,
        totalExpensesCount: expenses.length,
        totalExpensesAmount: toDecimalString(totalExpensesAmount),
        totalExpensesInCup: totalExpensesInCup === null ? null : toDecimalString(totalExpensesInCup),
        unconvertedExpensesCount: gastosInCup.unconvertedCount,
        marginProfit: toDecimalString(marginProfit),
        netProfit: gastosInCup.unconvertedCount > 0
          ? null
          : toDecimalString(marginProfit.minus(totalExpensesInCup ?? 0)),
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
      (sum, t) => sum.plus(t.marginProfit),
      new Decimal(0),
    );
    const totalCompras = transactions
      .filter((t) => t.type === 'COMPRA')
      .reduce((sum, t) => sum.plus(t.totalCup), new Decimal(0));
    const totalVentas = transactions
      .filter((t) => t.type === 'VENTA')
      .reduce((sum, t) => sum.plus(t.totalCup), new Decimal(0));

    return {
      period: { startDate, endDate },
      totalMarginProfit: toDecimalString(totalMarginProfit),
      totalCompras: toDecimalString(totalCompras),
      totalVentas: toDecimalString(totalVentas),
      netFlow: toDecimalString(totalVentas.minus(totalCompras)),
      byCurrency,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        currency: t.currency.code,
        amount: toDecimalString(t.amount),
        rate: toDecimalString(t.rate),
        totalCup: toDecimalString(t.totalCup),
        marginProfit: toDecimalString(t.marginProfit),
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
      currentBalance: cashBalance ? toDecimalString(cashBalance.balance) : '0',
      totalTransactions: transactions.length,
      totalCompras: toDecimalString(transactions
        .filter((t) => t.type === 'COMPRA')
        .reduce((sum, t) => sum.plus(t.amount), new Decimal(0))),
      totalVentas: toDecimalString(transactions
        .filter((t) => t.type === 'VENTA')
        .reduce((sum, t) => sum.plus(t.amount), new Decimal(0))),
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
      totalAmount: toDecimalString(expenses.reduce((sum, e) => sum.plus(e.amount), new Decimal(0))),
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
        totalBalance: '0',
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
        balance: toDecimalString(account.balance),
        transactionCount: expenseCount + transferCount,
      };
    });

    return {
      totalAccounts: accounts.length,
      totalBalance: toDecimalString(accounts.reduce(
        (sum, a) => sum.plus(a.balance),
        new Decimal(0),
      )),
      accounts: accountsWithSummary,
    };
  }

  async getObjectivesReport(userId: number): Promise<ObjectivesReportDto> {
    const objectives = await this.prisma.objective.findMany({
      where: { userId },
      include: { currency: true, bankAccount: true },
    });

    const objectivesWithProgress: ObjectivesReportDto['objectives'] = objectives.map((obj) => {
      const targetAmount = dec(obj.targetAmount);
      const currentAmount = dec(obj.currentAmount);
      const percentage =
        targetAmount.gt(0) ? Number(currentAmount.div(targetAmount).mul(100)) : 0;

      return {
        ...obj,
        targetAmount: toDecimalString(targetAmount),
        currentAmount: toDecimalString(currentAmount),
        percentage: Math.min(percentage, 100),
        remaining: toDecimalString(Decimal.max(targetAmount.minus(currentAmount), 0)),
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

    // Los tres campos de cada sección son acumuladores de dinero (no contadores),
    // igual que en la implementación original.
    type SectionAcc = { transactions: Decimal; expenses: Decimal; adjustments: Decimal; total: Decimal };
    type BucketAcc = {
      currency: { code: string; symbol: string };
      inflows: SectionAcc;
      outflows: SectionAcc;
    };
    const emptySection = (): SectionAcc => ({ transactions: new Decimal(0), expenses: new Decimal(0), adjustments: new Decimal(0), total: new Decimal(0) });
    const emptyBucket = (code: string, symbol: string): BucketAcc => ({
      currency: { code, symbol },
      inflows: emptySection(),
      outflows: emptySection(),
    });
    const buckets = new Map<string, BucketAcc>();
    const add = (
      code: string,
      symbol: string,
      section: 'inflows' | 'outflows',
      field: 'transactions' | 'expenses' | 'adjustments',
      amount: Decimal,
    ) => {
      const bucket = buckets.get(code) ?? emptyBucket(code, symbol);
      const current = bucket[section];
      const nextSection: SectionAcc = {
        ...current,
        [field]: (current[field] as Decimal).plus(amount),
        total: current.total.plus(amount),
      };
      buckets.set(code, { ...bucket, [section]: nextSection });
    };

    transactions.forEach((transaction) => {
      add(
        CUP_CURRENCY_CODE,
        '$',
        transaction.type === 'VENTA' ? 'inflows' : 'outflows',
        'transactions',
        dec(transaction.totalCup),
      );
    });
    expenses.forEach((expense) => {
      add(
        expense.currency.code,
        expense.currency.symbol,
        'outflows',
        'expenses',
        dec(expense.amount),
      );
    });
    adjustments.forEach((adjustment) => {
      add(
        adjustment.currency.code,
        adjustment.currency.symbol,
        adjustment.type === 'INGRESO' ? 'inflows' : 'outflows',
        'adjustments',
        dec(adjustment.amount),
      );
    });

    return {
      period: { startDate, endDate },
      currencies: [...buckets.values()]
        .map((bucket) => ({
          currency: bucket.currency,
          inflows: {
            transactions: toDecimalString(bucket.inflows.transactions),
            adjustments: toDecimalString(bucket.inflows.adjustments),
            total: toDecimalString(bucket.inflows.total),
          },
          outflows: {
            transactions: toDecimalString(bucket.outflows.transactions),
            expenses: toDecimalString(bucket.outflows.expenses),
            adjustments: toDecimalString(bucket.outflows.adjustments),
            total: toDecimalString(bucket.outflows.total),
          },
          balance: toDecimalString(
            bucket.inflows.total.minus(bucket.outflows.total),
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

    const discrepancies = audits.filter((a) => !dec(a.difference).isZero());

    return {
      totalAudits: audits.length,
      withDiscrepancies: discrepancies.length,
      totalDiscrepancy: toDecimalString(discrepancies.reduce(
        (sum, a) => sum.plus(a.difference),
        new Decimal(0),
      )),
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
    startDay.setUTCHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setUTCHours(23, 59, 59, 999);

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
        transactionsTotalCup: Decimal;
        expenses: number;
        expensesTotalCup: Decimal;
        expensesUnconverted: number;
        marginProfit: Decimal;
      }
    >();

    const dateKey = (d: Date) => d.toISOString().split('T')[0];

    // Build all days in range first (so empty days show as 0)
    const cursor = new Date(startDay);
    while (cursor <= endDay) {
      buckets.set(dateKey(cursor), {
        transactions: 0,
        transactionsTotalCup: new Decimal(0),
        expenses: 0,
        expensesTotalCup: new Decimal(0),
        expensesUnconverted: 0,
        marginProfit: new Decimal(0),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    for (const tx of transactions) {
      const key = dateKey(tx.createdAt);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.transactions += 1;
      bucket.transactionsTotalCup = bucket.transactionsTotalCup.plus(tx.totalCup);
      bucket.marginProfit = bucket.marginProfit.plus(tx.marginProfit);
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
        bucket.expensesTotalCup = bucket.expensesTotalCup.plus(dec(expense.amount).mul(rate));
      }
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, b]) => ({
        date,
        transactions: b.transactions,
        transactionsTotalCup: toDecimalString(b.transactionsTotalCup),
        expenses: b.expenses,
        expensesTotalCup: toDecimalString(b.expensesTotalCup),
        expensesUnconverted: b.expensesUnconverted,
        marginProfit: toDecimalString(b.marginProfit),
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
    const sales = movements.map((movement: any) => ({ id: movement.id, currency: movement.currency.code, amount: toDecimalString(movement.amount), rate: toDecimalString(movement.rate), costoPromedio: toDecimalString(movement.costSnapshot ?? 0), rendimiento: toDecimalString(movement.realizedProfit ?? 0), createdAt: movement.createdAt }));
    const positions = await this.prisma.currencyPosition.findMany({ where: { userId, ...(currencyCode ? { currency: { code: currencyCode } } : {}) }, include: { currency: true }, orderBy: { currencyId: 'asc' } });
    const totalRendimiento = sales.reduce((sum: Decimal, sale: any) => sum.plus(sale.rendimiento), new Decimal(0));
    return { period: { startDate, endDate }, currency: currencyCode ?? null, totalRendimiento: toDecimalString(totalRendimiento), movements: sales, positions: positions.map((position: any) => ({ currencyId: position.currencyId, currency: position.currency.code, saldo: toDecimalString(position.saldo), costoPromedio: position.costoPromedio == null ? null : toDecimalString(position.costoPromedio), reviewStatus: position.reviewStatus, reviewedAt: position.reviewedAt, availableForSale: position.reviewStatus === 'REVIEWED' && dec(position.saldo).gt(0) })) };
  }
}
