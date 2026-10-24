import type { CashAudit, Currency, Expense, Transaction } from '@prisma/client';

/**
 * Monetary values are decimal strings across the API boundary (task 1.14,
 * plan de clientes nativos): every field that carries an amount, a rate or
 * a money sum is a string. Counts and rounded percentages stay numbers.
 */

export interface DailyExpenseByCategory {
  count: number;
  total: string;
}

export interface DailyExpenseCategorySummary {
  [category: string]: DailyExpenseByCategory;
}

export interface DailyReportDto {
  date: string;
  transactions: {
    total: number;
    compras: number;
    ventas: number;
    totalCompras: string;
    totalVentas: string;
  };
  expenses: {
    total: number;
    totalAmount: string;
    totalAmountInCup: string | null;
    unconvertedCount: number;
    byCategory: DailyExpenseCategorySummary;
  };
  profit: {
    margin: number;
    marginProfit: string;
    net: string | null;
  };
}

export interface DailyBreakdownItem {
  date: string;
  transactions: number;
  transactionsTotalCup: string;
  expenses: number;
  expensesTotalCup: string;
  expensesUnconverted: number;
  marginProfit: string;
}

export interface PeriodTransactionCurrencySummary {
  [code: string]: { compras: string; ventas: string; count: number };
}

export interface PeriodReportDto {
  period: { startDate: string; endDate: string };
  summary: {
    totalTransactions: number;
    totalExpensesCount: number;
    totalExpensesAmount: string;
    totalExpensesInCup: string | null;
    unconvertedExpensesCount: number;
    marginProfit: string;
    netProfit: string | null;
  };
  dailyBreakdown: DailyBreakdownItem[];
  transactionsByCurrency: PeriodTransactionCurrencySummary;
  expensesByCategory: DailyExpenseCategorySummary;
}

export type TransactionTypeLite = 'COMPRA' | 'VENTA';

export interface ProfitReportTransaction {
  id: number;
  type: TransactionTypeLite;
  currency: string;
  amount: string;
  rate: string;
  totalCup: string;
  marginProfit: string;
  createdAt: Date;
}

export interface ProfitByCurrencySummary {
  [code: string]: { marginProfit: string; count: number };
}

export interface ProfitReportDto {
  period: { startDate: string; endDate: string };
  totalMarginProfit: string;
  totalCompras: string;
  totalVentas: string;
  netFlow: string;
  byCurrency: ProfitByCurrencySummary;
  transactions: ProfitReportTransaction[];
}

export interface CurrencyReportDto {
  currencyId: number;
  currency: { id: number; code: string; name: string } | null;
  currentBalance: string;
  totalTransactions: number;
  totalCompras: string;
  totalVentas: string;
  transactions: Transaction[];
}

export interface ExpensesByCurrencySummary {
  [code: string]: { total: string; count: number };
}

export interface ExpensesReportDto {
  total: number;
  totalAmount: string;
  totalAmountInCup: string | null;
  unconvertedCount: number;
  byCategory: DailyExpenseCategorySummary;
  byCurrency: ExpensesByCurrencySummary;
  expenses: Array<Expense & { currency: { code: string } }>;
}

export interface AccountReportItem {
  id: number;
  userId: number;
  name: string;
  balance: string;
  currencyId: number;
  currency: { code: string };
  isActive: boolean;
  transactionCount: number;
}

export interface AccountsReportDto {
  totalAccounts: number;
  totalBalance: string;
  accounts: AccountReportItem[];
}

export interface ObjectiveReportItem {
  id: number;
  userId: number;
  currencyId: number;
  targetAmount: string;
  currentAmount: string;
  status: string;
  completedAt: Date | null;
  currency?: Currency | null;
  bankAccountId?: number | null;
  percentage: number;
  remaining: string;
}

export interface ObjectivesReportDto {
  total: number;
  activos: number;
  completados: number;
  pausados: number;
  objectives: ObjectiveReportItem[];
}

export interface CashFlowReportDto {
  period: { startDate: string; endDate: string };
  currencies: Array<{
    currency: { code: string; symbol: string };
    // Los tres campos de cada sección son sumas de dinero (no contadores).
    inflows: { transactions: string; adjustments: string; total: string };
    outflows: {
      transactions: string;
      expenses: string;
      adjustments: string;
      total: string;
    };
    balance: string;
  }>;
}

export interface AuditSummaryReportDto {
  totalAudits: number;
  withDiscrepancies: number;
  totalDiscrepancy: string;
  audits: Array<CashAudit & { currency: { code: string } }>;
}

export interface FxPerformanceMovement {
  id: number;
  currency: string;
  amount: string;
  rate: string;
  costoPromedio: string;
  rendimiento: string;
  createdAt: Date;
}

export interface FxPerformancePosition {
  currencyId: number;
  currency: string;
  saldo: string;
  costoPromedio: string | null;
  reviewStatus: 'UNREVIEWED' | 'REVIEWED';
  reviewedAt: Date | null;
  availableForSale: boolean;
}

export interface FxPerformanceReportDto {
  period: { startDate: string; endDate: string };
  currency: string | null;
  totalRendimiento: string;
  movements: FxPerformanceMovement[];
  positions: FxPerformancePosition[];
}
