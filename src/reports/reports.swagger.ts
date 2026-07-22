import { ApiProperty } from '@nestjs/swagger';

export class DailyExpenseByCategoryDto {
  @ApiProperty({ example: 5 })
  count!: number;

  @ApiProperty({ example: 125.5 })
  total!: number;
}

export class DailyReportTransactionDto {
  @ApiProperty()
  total!: number;
  @ApiProperty()
  compras!: number;
  @ApiProperty()
  ventas!: number;
  @ApiProperty()
  totalCompras!: number;
  @ApiProperty()
  totalVentas!: number;
}

export class DailyReportExpenseDto {
  @ApiProperty()
  total!: number;
  @ApiProperty({ description: 'Suma cruda mezclando currencies' })
  totalAmount!: number;
  @ApiProperty({
    nullable: true,
    description: 'Suma convertida a CUP cuando hay tasa vigente',
  })
  totalAmountInCup!: number | null;
  @ApiProperty()
  unconvertedCount!: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/DailyExpenseByCategoryDto' },
  })
  byCategory!: Record<string, DailyExpenseByCategoryDto>;
}

export class DailyReportProfitDto {
  @ApiProperty({ description: '% de retorno sobre ventas (0-100)' })
  margin!: number;
  @ApiProperty({ description: 'Suma de Transaction.marginProfit' })
  marginProfit!: number;
  @ApiProperty({ description: 'totalVentas - totalCompras - gastos (CUP)' })
  net!: number;
}

export class DailyReportDto {
  @ApiProperty({ example: '2026-07-22' })
  date!: string;
  @ApiProperty({ type: DailyReportTransactionDto })
  transactions!: DailyReportTransactionDto;
  @ApiProperty({ type: DailyReportExpenseDto })
  expenses!: DailyReportExpenseDto;
  @ApiProperty({ type: DailyReportProfitDto })
  profit!: DailyReportProfitDto;
}

export class DailyBreakdownItemDto {
  @ApiProperty()
  date!: string;
  @ApiProperty({ description: 'Cantidad de transacciones del día' })
  transactions!: number;
  @ApiProperty()
  transactionsTotalCup!: number;
  @ApiProperty()
  expenses!: number;
  @ApiProperty()
  expensesTotalCup!: number;
  @ApiProperty()
  expensesUnconverted!: number;
  @ApiProperty()
  marginProfit!: number;
}

export class PeriodReportSummaryDto {
  @ApiProperty()
  totalTransactions!: number;
  @ApiProperty()
  totalExpensesCount!: number;
  @ApiProperty()
  totalExpensesAmount!: number;
  @ApiProperty({ type: Number, nullable: true })
  totalExpensesInCup!: number | null;
  @ApiProperty()
  unconvertedExpensesCount!: number;
  @ApiProperty()
  marginProfit!: number;
  @ApiProperty()
  netProfit!: number;
}

export class PeriodReportPeriodDto {
  @ApiProperty()
  startDate!: string;
  @ApiProperty()
  endDate!: string;
}

export class PeriodReportDto {
  @ApiProperty({ type: PeriodReportPeriodDto })
  period!: PeriodReportPeriodDto;
  @ApiProperty({ type: PeriodReportSummaryDto })
  summary!: PeriodReportSummaryDto;
  @ApiProperty({ type: [DailyBreakdownItemDto] })
  dailyBreakdown!: DailyBreakdownItemDto[];
  @ApiProperty({ type: 'object', additionalProperties: true })
  transactionsByCurrency!: Record<string, { compras: number; ventas: number; count: number }>;
  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/DailyExpenseByCategoryDto' },
  })
  expensesByCategory!: Record<string, DailyExpenseByCategoryDto>;
}

export class ProfitReportTransactionDto {
  @ApiProperty()
  id!: number;
  @ApiProperty({ enum: ['COMPRA', 'VENTA'] })
  type!: 'COMPRA' | 'VENTA';
  @ApiProperty()
  currency!: string;
  @ApiProperty()
  amount!: number;
  @ApiProperty()
  rate!: number;
  @ApiProperty()
  totalCup!: number;
  @ApiProperty()
  marginProfit!: number;
  @ApiProperty()
  createdAt!: string;
}

export class ProfitReportDto {
  @ApiProperty({ type: PeriodReportPeriodDto })
  period!: PeriodReportPeriodDto;
  @ApiProperty()
  totalMarginProfit!: number;
  @ApiProperty()
  totalCompras!: number;
  @ApiProperty()
  totalVentas!: number;
  @ApiProperty()
  netFlow!: number;
  @ApiProperty({ type: 'object', additionalProperties: true })
  byCurrency!: Record<string, { marginProfit: number; count: number }>;
  @ApiProperty({ type: [ProfitReportTransactionDto] })
  transactions!: ProfitReportTransactionDto[];
}

export class CurrencyReportDto {
  @ApiProperty()
  currencyId!: number;
  @ApiProperty({ type: 'object', nullable: true, additionalProperties: true })
  currency!: { id: number; code: string; name: string } | null;
  @ApiProperty()
  currentBalance!: number;
  @ApiProperty()
  totalTransactions!: number;
  @ApiProperty()
  totalCompras!: number;
  @ApiProperty()
  totalVentas!: number;
  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true } })
  transactions!: any[];
}

export class ExpensesReportDto {
  @ApiProperty()
  total!: number;
  @ApiProperty()
  totalAmount!: number;
  @ApiProperty({ type: Number, nullable: true })
  totalAmountInCup!: number | null;
  @ApiProperty()
  unconvertedCount!: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/DailyExpenseByCategoryDto' },
  })
  byCategory!: Record<string, DailyExpenseByCategoryDto>;
  @ApiProperty({ type: 'object', additionalProperties: true })
  byCurrency!: Record<string, { total: number; count: number }>;
  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true } })
  expenses!: any[];
}

export class AccountReportItemDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  userId!: number;
  @ApiProperty()
  name!: string;
  @ApiProperty()
  balance!: number;
  @ApiProperty()
  currencyId!: number;
  @ApiProperty()
  isActive!: boolean;
  @ApiProperty()
  transactionCount!: number;
}

export class AccountsReportDto {
  @ApiProperty()
  totalAccounts!: number;
  @ApiProperty()
  totalBalance!: number;
  @ApiProperty({ type: [AccountReportItemDto] })
  accounts!: AccountReportItemDto[];
}

export class ObjectiveReportItemDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  targetAmount!: number;
  @ApiProperty()
  currentAmount!: number;
  @ApiProperty()
  percentage!: number;
  @ApiProperty()
  remaining!: number;
}

export class ObjectivesReportDto {
  @ApiProperty()
  total!: number;
  @ApiProperty()
  activos!: number;
  @ApiProperty()
  completados!: number;
  @ApiProperty()
  pausados!: number;
  @ApiProperty({ type: [ObjectiveReportItemDto] })
  objectives!: ObjectiveReportItemDto[];
}

export class CashFlowReportDtoSwagger {
  @ApiProperty({ type: PeriodReportPeriodDto })
  period!: PeriodReportPeriodDto;
  @ApiProperty()
  inflows!: { ventas: number; adjustments: number };
  @ApiProperty()
  outflows!: { compras: number; expenses: number; adjustments: number };
}

export class AuditSummaryReportDtoSwagger {
  @ApiProperty()
  totalAudits!: number;
  @ApiProperty()
  withDiscrepancies!: number;
  @ApiProperty()
  totalDiscrepancy!: number;
  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true } })
  audits!: any[];
}

export class FxPerformanceMovementDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  currency!: string;
  @ApiProperty()
  amount!: number;
  @ApiProperty()
  rate!: number;
  @ApiProperty()
  costoPromedio!: number;
  @ApiProperty()
  rendimiento!: number;
  @ApiProperty()
  createdAt!: string;
}

export class FxPerformancePositionDto {
  @ApiProperty()
  currencyId!: number;
  @ApiProperty()
  currency!: string;
  @ApiProperty()
  saldo!: number;
  @ApiProperty({ type: Number, nullable: true })
  costoPromedio!: number | null;
  @ApiProperty()
  availableForSale!: boolean;
}

export class FxPerformanceReportDto {
  @ApiProperty({ type: PeriodReportPeriodDto })
  period!: PeriodReportPeriodDto;
  @ApiProperty({ type: String, nullable: true })
  currency!: string | null;
  @ApiProperty()
  totalRendimiento!: number;
  @ApiProperty({ type: [FxPerformanceMovementDto] })
  movements!: FxPerformanceMovementDto[];
  @ApiProperty({ type: [FxPerformancePositionDto] })
  positions!: FxPerformancePositionDto[];
}
