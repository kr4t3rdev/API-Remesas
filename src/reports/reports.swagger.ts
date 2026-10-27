import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class DailyExpenseByCategoryDto {
  @ApiProperty({ example: 5 })
  count!: number;

  @ApiProperty({ example: '125.5', description: 'Suma de gastos de la categoría (decimal como string)' })
  total!: string;
}

export class DailyReportTransactionDto {
  @ApiProperty({ description: 'Cantidad de transacciones del día' })
  total!: number;
  @ApiProperty()
  compras!: number;
  @ApiProperty()
  ventas!: number;
  @ApiProperty({ description: 'Total CUP de compras (decimal como string)' })
  totalCompras!: string;
  @ApiProperty({ description: 'Total CUP de ventas (decimal como string)' })
  totalVentas!: string;
}

@ApiExtraModels(DailyExpenseByCategoryDto)
export class DailyReportExpenseDto {
  @ApiProperty({ description: 'Cantidad de gastos del día' })
  total!: number;
  @ApiProperty({ description: 'Suma cruda mezclando currencies (decimal como string)' })
  totalAmount!: string;
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Suma convertida a CUP cuando hay tasa vigente (decimal como string)',
  })
  totalAmountInCup!: string | null;
  @ApiProperty()
  unconvertedCount!: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(DailyExpenseByCategoryDto) },
  })
  byCategory!: Record<string, DailyExpenseByCategoryDto>;
}

export class DailyReportProfitDto {
  @ApiProperty({ description: '% de retorno sobre ventas (0-100)' })
  margin!: number;
  @ApiProperty({ description: 'Suma de Transaction.marginProfit (decimal como string)' })
  marginProfit!: string;
  @ApiProperty({ type: String, nullable: true, description: 'Realized FX margin minus CUP-converted expenses; null when conversion is incomplete (decimal como string)' })
  net!: string | null;
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
  @ApiProperty({ description: 'Total CUP de transacciones del día (decimal como string)' })
  transactionsTotalCup!: string;
  @ApiProperty()
  expenses!: number;
  @ApiProperty({ description: 'Total CUP de gastos del día (decimal como string)' })
  expensesTotalCup!: string;
  @ApiProperty()
  expensesUnconverted!: number;
  @ApiProperty({ description: 'Decimal como string' })
  marginProfit!: string;
}

export class PeriodReportSummaryDto {
  @ApiProperty()
  totalTransactions!: number;
  @ApiProperty()
  totalExpensesCount!: number;
  @ApiProperty()
  totalExpensesAmount!: string;
  @ApiProperty({ type: String, nullable: true })
  totalExpensesInCup!: string | null;
  @ApiProperty()
  unconvertedExpensesCount!: number;
  @ApiProperty({ description: 'Decimal como string' })
  marginProfit!: string;
  @ApiProperty({ type: String, nullable: true })
  netProfit!: string | null;
}

export class PeriodReportPeriodDto {
  @ApiProperty()
  startDate!: string;
  @ApiProperty()
  endDate!: string;
}

@ApiExtraModels(DailyExpenseByCategoryDto)
export class PeriodReportDto {
  @ApiProperty({ type: PeriodReportPeriodDto })
  period!: PeriodReportPeriodDto;
  @ApiProperty({ type: PeriodReportSummaryDto })
  summary!: PeriodReportSummaryDto;
  @ApiProperty({ type: [DailyBreakdownItemDto] })
  dailyBreakdown!: DailyBreakdownItemDto[];
  @ApiProperty({ type: 'object', additionalProperties: true })
  transactionsByCurrency!: Record<string, { compras: string; ventas: string; count: number }>;
  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(DailyExpenseByCategoryDto) },
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
  @ApiProperty({ description: 'Decimal como string' })
  amount!: string;
  @ApiProperty({ description: 'Decimal como string' })
  rate!: string;
  @ApiProperty({ description: 'Decimal como string' })
  totalCup!: string;
  @ApiProperty({ description: 'Decimal como string' })
  marginProfit!: string;
  @ApiProperty()
  createdAt!: string;
}

export class ProfitReportDto {
  @ApiProperty({ type: PeriodReportPeriodDto })
  period!: PeriodReportPeriodDto;
  @ApiProperty()
  totalMarginProfit!: string;
  @ApiProperty({ description: 'Decimal como string' })
  totalCompras!: string;
  @ApiProperty({ description: 'Decimal como string' })
  totalVentas!: string;
  @ApiProperty({ description: 'Decimal como string' })
  netFlow!: string;
  @ApiProperty({ type: 'object', additionalProperties: true })
  byCurrency!: Record<string, { marginProfit: string; count: number }>;
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

@ApiExtraModels(DailyExpenseByCategoryDto)
export class ExpensesReportDto {
  @ApiProperty()
  total!: number;
  @ApiProperty({ description: 'Decimal como string' })
  totalAmount!: string;
  @ApiProperty({ type: String, nullable: true })
  totalAmountInCup!: string | null;
  @ApiProperty()
  unconvertedCount!: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(DailyExpenseByCategoryDto) },
  })
  byCategory!: Record<string, DailyExpenseByCategoryDto>;
  @ApiProperty({ type: 'object', additionalProperties: true })
  byCurrency!: Record<string, { total: string; count: number }>;
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
  @ApiProperty({ description: 'Decimal como string' })
  balance!: string;
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
  @ApiProperty({ description: 'Decimal como string (mezcla currencies, igual que antes)' })
  totalBalance!: string;
  @ApiProperty({ type: [AccountReportItemDto] })
  accounts!: AccountReportItemDto[];
}

export class ObjectiveReportItemDto {
  @ApiProperty()
  id!: number;
  @ApiProperty({ description: 'Decimal como string' })
  targetAmount!: string;
  @ApiProperty({ description: 'Decimal como string' })
  currentAmount!: string;
  @ApiProperty()
  percentage!: number;
  @ApiProperty({ description: 'Decimal como string' })
  remaining!: string;
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

export class CashFlowReportCurrencyRefDto {
  @ApiProperty({ example: 'USD' })
  code!: string;

  @ApiProperty({ example: '$' })
  symbol!: string;
}

export class CashFlowReportInflowsDto {
  @ApiProperty({ type: String, description: 'Decimal como string' })
  transactions!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  adjustments!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  total!: string;
}

export class CashFlowReportOutflowsDto {
  @ApiProperty({ type: String, description: 'Decimal como string' })
  transactions!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  expenses!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  adjustments!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  total!: string;
}

export class CashFlowReportCurrencyDto {
  @ApiProperty({ type: CashFlowReportCurrencyRefDto })
  currency!: CashFlowReportCurrencyRefDto;

  @ApiProperty({ type: CashFlowReportInflowsDto })
  inflows!: CashFlowReportInflowsDto;

  @ApiProperty({ type: CashFlowReportOutflowsDto })
  outflows!: CashFlowReportOutflowsDto;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  balance!: string;
}

export class CashFlowReportDtoSwagger {
  @ApiProperty({ type: PeriodReportPeriodDto })
  period!: PeriodReportPeriodDto;
  @ApiProperty({ type: [CashFlowReportCurrencyDto] })
  currencies!: CashFlowReportCurrencyDto[];
}

export class AuditSummaryReportDtoSwagger {
  @ApiProperty()
  totalAudits!: number;
  @ApiProperty()
  withDiscrepancies!: number;
  @ApiProperty({ description: 'Decimal como string' })
  totalDiscrepancy!: string;
  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true } })
  audits!: any[];
}

export class FxPerformanceMovementDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  currency!: string;
  @ApiProperty({ description: 'Decimal como string' })
  amount!: string;
  @ApiProperty({ description: 'Decimal como string' })
  rate!: string;
  @ApiProperty({ description: 'Decimal como string' })
  costoPromedio!: string;
  @ApiProperty({ description: 'Decimal como string' })
  rendimiento!: string;
  @ApiProperty()
  createdAt!: string;
}

export class FxPerformancePositionDto {
  @ApiProperty()
  currencyId!: number;
  @ApiProperty()
  currency!: string;
  @ApiProperty()
  saldo!: string;
  @ApiProperty({ type: String, nullable: true })
  costoPromedio!: string | null;
  @ApiProperty({ enum: ['UNREVIEWED', 'REVIEWED'] })
  reviewStatus!: 'UNREVIEWED' | 'REVIEWED';
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  reviewedAt!: Date | null;
  @ApiProperty()
  availableForSale!: boolean;
}

export class FxPerformanceReportDto {
  @ApiProperty({ type: PeriodReportPeriodDto })
  period!: PeriodReportPeriodDto;
  @ApiProperty({ type: String, nullable: true })
  currency!: string | null;
  @ApiProperty()
  totalRendimiento!: string;
  @ApiProperty({ type: [FxPerformanceMovementDto] })
  movements!: FxPerformanceMovementDto[];
  @ApiProperty({ type: [FxPerformancePositionDto] })
  positions!: FxPerformancePositionDto[];
}
