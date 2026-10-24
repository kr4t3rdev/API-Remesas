import { ApiProperty } from '@nestjs/swagger';
import { CurrencyDto } from '../currencies/currencies.swagger';

/**
 * Response DTOs for the Cash module.
 *
 * Every monetary field is a decimal string (task 1.14 decision). The
 * shapes mirror exactly what CashService returns.
 */

export class CashBalanceDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 1 })
  currencyId!: number;

  @ApiProperty({ type: CurrencyDto, nullable: true, description: 'Null en GET /cash-balances/:currencyId cuando no hay saldo registrado' })
  currency!: CurrencyDto | null;

  @ApiProperty({ type: String, example: '1500.5', description: 'Decimal como string' })
  balance!: string;
}

export class CashMovementDto {
  @ApiProperty({ example: 'transaction:20', description: 'Prefijo de kind + id real' })
  id!: string;

  @ApiProperty({ enum: ['TRANSACTION', 'ADJUSTMENT', 'EXPENSE'] })
  kind!: 'TRANSACTION' | 'ADJUSTMENT' | 'EXPENSE';

  @ApiProperty({ example: 'VENTA', description: 'Tipo de transacción o tipo de ajuste' })
  type!: string;

  @ApiProperty({ enum: ['TRANSFER', 'REMITTANCE'], nullable: true, description: 'Solo movimientos de tipo TRANSACTION' })
  operationKind?: string | null;

  @ApiProperty({ enum: ['IN', 'OUT'] })
  direction!: 'IN' | 'OUT';

  @ApiProperty({ example: 'Venta de moneda' })
  title!: string;

  @ApiProperty({ example: '270.5 USD' })
  description!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amount!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Decimal como string; presente en TRANSACTION y EXPENSE' })
  cashAmount?: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'Decimal como string; monto convertido a CUP cuando aplica' })
  totalBase!: string | null;

  @ApiProperty({ nullable: true })
  sourceType?: string | null;

  @ApiProperty({ nullable: true })
  destinationType?: string | null;

  @ApiProperty({ nullable: true })
  sourceBankAccountId?: number | null;

  @ApiProperty({ nullable: true })
  destinationBankAccountId?: number | null;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class CashAuditDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 1 })
  currencyId!: number;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  expectedBalance!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  actualBalance!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  difference!: string;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty({ nullable: true, description: 'Nombre del auditor; presente en latestAudits del overview' })
  auditorName?: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class CashOverviewDto {
  @ApiProperty({ format: 'date-time', example: '2026-10-22T12:00:00.000Z' })
  asOf!: string;

  @ApiProperty({ type: CurrencyDto, nullable: true })
  primaryCurrency!: CurrencyDto | null;

  @ApiProperty({ type: [CurrencyDto] })
  currencies!: CurrencyDto[];

  @ApiProperty({ type: [CashBalanceDto] })
  balances!: CashBalanceDto[];

  @ApiProperty({ type: [CashMovementDto] })
  recentMovements!: CashMovementDto[];

  @ApiProperty({ type: [CashAuditDto] })
  latestAudits!: CashAuditDto[];
}

export class CashPolicyDto {
  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ type: String, description: 'Decimal como string; 0 cuando la moneda no tiene política' })
  safetyBuffer!: string;

  @ApiProperty({ type: String, description: 'Decimal como string; 0 cuando la moneda no tiene política' })
  insuranceLimit!: string;
}

export class CashPolicyDetailDto extends CashPolicyDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 2 })
  currencyId!: number;
}

export class CashAuditorDto {
  @ApiProperty({ example: 7 })
  id!: number;

  @ApiProperty({ example: 'Ana' })
  name!: string;
}

export class CashClosingDto {
  @ApiProperty({ example: 3 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 1 })
  currencyId!: number;

  @ApiProperty({ example: '2026-10-21', description: 'Fecha operativa del cierre' })
  businessDate!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  expectedBalance!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  actualBalance!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  difference!: string;

  @ApiProperty({ enum: ['CLOSED'], description: 'Estado del cierre' })
  status!: string;

  @ApiProperty({ example: 7 })
  closedById!: number;

  @ApiProperty({ format: 'date-time' })
  closedAt!: string;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ example: { id: 7, name: 'Ana' } })
  closedBy!: { id: number; name: string };
}

export class CashValuationBreakdownDto {
  @ApiProperty({ example: 1 })
  currencyId!: number;

  @ApiProperty({ example: 'CUP' })
  currencyCode!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amount!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Monto convertido a la moneda destino; null si falta tasa' })
  convertedAmount!: string | null;
}

export class CashValuationDto {
  @ApiProperty({ type: String, description: 'Decimal como string' })
  total!: string;

  @ApiProperty({ type: CurrencyDto, nullable: true })
  targetCurrency!: CurrencyDto | null;

  @ApiProperty({ type: [CashValuationBreakdownDto] })
  breakdown!: CashValuationBreakdownDto[];

  @ApiProperty({ type: [String], description: 'Códigos de moneda sin tasa para convertir' })
  missingRates!: string[];
}

export class CashAdjustmentDto {
  @ApiProperty({ example: 30 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 1 })
  currencyId!: number;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amount!: string;

  @ApiProperty({ enum: ['INGRESO', 'EGRESO'] })
  type!: 'INGRESO' | 'EGRESO';

  @ApiProperty({ example: 'Ingreso manual de apertura' })
  reason!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
