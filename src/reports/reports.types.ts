import type { CashAudit, Currency, Expense, Transaction } from '@prisma/client';

export interface DailyExpenseByCategory {
  count: number;
  total: number;
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
    totalCompras: number;
    totalVentas: number;
  };
  expenses: {
    total: number;
    totalAmount: number;
    totalAmountInCup: number | null;
    unconvertedCount: number;
    byCategory: DailyExpenseCategorySummary;
  };
  profit: {
    margin: number;
    marginProfit: number;
    net: number;
  };
}

export interface DailyBreakdownItem {
  date: string;
  transactions: number;
  transactionsTotalCup: number;
  expenses: number;
  expensesTotalCup: number;
  expensesUnconverted: number;
  marginProfit: number;
}

export interface PeriodTransactionCurrencySummary {
  [code: string]: { compras: number; ventas: number; count: number };
}

export interface PeriodReportDto {
  period: { startDate: string; endDate: string };
  summary: {
    totalTransactions: number;
    totalExpensesCount: number;
    totalExpensesAmount: number;
    totalExpensesInCup: number | null;
    unconvertedExpensesCount: number;
    marginProfit: number;
    netProfit: number;
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
  amount: number;
  rate: number;
  totalCup: number;
  marginProfit: number;
  createdAt: Date;
}

export interface ProfitByCurrencySummary {
  [code: string]: { marginProfit: number; count: number };
}

export interface ProfitReportDto {
  period: { startDate: string; endDate: string };
  totalMarginProfit: number;
  totalCompras: number;
  totalVentas: number;
  netFlow: number;
  byCurrency: ProfitByCurrencySummary;
  transactions: ProfitReportTransaction[];
}

export interface CurrencyReportDto {
  currencyId: number;
  currency: { id: number; code: string; name: string } | null;
  currentBalance: number;
  totalTransactions: number;
  totalCompras: number;
  totalVentas: number;
  transactions: Transaction[];
}

export interface ExpensesByCurrencySummary {
  [code: string]: { total: number; count: number };
}

export interface ExpensesReportDto {
  total: number;
  totalAmount: number;
  totalAmountInCup: number | null;
  unconvertedCount: number;
  byCategory: DailyExpenseCategorySummary;
  byCurrency: ExpensesByCurrencySummary;
  expenses: Array<Expense & { currency: { code: string } }>;
}

export interface AccountReportItem {
  id: number;
  userId: number;
  name: string;
  balance: number;
  currencyId: number;
  currency: { code: string };
  isActive: boolean;
  transactionCount: number;
}

export interface AccountsReportDto {
  totalAccounts: number;
  totalBalance: number;
  accounts: AccountReportItem[];
}

export interface ObjectiveReportItem {
  id: number;
  userId: number;
  currencyId: number;
  targetAmount: number;
  currentAmount: number;
  status: string;
  completedAt: Date | null;
  currency?: Currency | null;
  bankAccountId?: number | null;
  percentage: number;
  remaining: number;
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
  inflows: {
    /** ventas en CUP (Transaction.totalCup ya esta en CUP) */
    ventas: number;
    /** ajustes INGRESO convertidos a CUP. Si algun ajuste no se pudo convertir queda en null/unconvertedCount. */
    adjustments: number;
    /** ajustes INGRESO crudos, en su currency original mezclados. */
    adjustmentsRaw: number;
    unconvertedAdjustmentsCount: number;
  };
  outflows: {
    /** compras en CUP. */
    compras: number;
    /** gastos convertidos a CUP. Si algun gasto no se pudo convertir queda en null y unconvertedExpensesCount > 0. */
    expenses: number;
    /** gastos crudos mezclando currencies. */
    expensesRaw: number;
    unconvertedExpensesCount: number;
    adjustments: number;
    adjustmentsRaw: number;
  };
}

export interface AuditSummaryReportDto {
  totalAudits: number;
  withDiscrepancies: number;
  totalDiscrepancy: number;
  audits: Array<CashAudit & { currency: { code: string } }>;
}

export interface FxPerformanceMovement {
  id: number;
  currency: string;
  amount: number;
  rate: number;
  costoPromedio: number;
  rendimiento: number;
  createdAt: Date;
}

export interface FxPerformancePosition {
  currencyId: number;
  currency: string;
  saldo: number;
  costoPromedio: number | null;
  availableForSale: boolean;
}

export interface FxPerformanceReportDto {
  period: { startDate: string; endDate: string };
  currency: string | null;
  totalRendimiento: number;
  movements: FxPerformanceMovement[];
  positions: FxPerformancePosition[];
}
