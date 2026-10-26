import { ApiProperty } from '@nestjs/swagger';
import { CurrencyDto } from '../../currencies/currencies.swagger';

/**
 * Compact shared DTOs for the remaining modules (expenses, plans,
 * remittances, transactions, fx-operations, upload).
 *
 * Monetary fields are decimal strings (task 1.14 decision).
 */

export class ExpenseDto {
  @ApiProperty({ example: 30 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 'Alquiler de oficina' })
  description!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amount!: string;

  @ApiProperty({ example: 2 })
  currencyId!: number;

  @ApiProperty({ example: 'renta' })
  category!: string;

  @ApiProperty({ format: 'date-time' })
  date!: string;

  @ApiProperty({ example: 'CASH' })
  sourceType!: string;

  @ApiProperty({ example: 1, nullable: true, type: Number })
  sourceBankAccountId!: number | null;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ nullable: true, description: 'Cuenta de origen cuando es BANK_ACCOUNT' })
  sourceBankAccount!: Record<string, unknown> | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class ExpenseListDto {
  @ApiProperty({ type: [ExpenseDto] })
  items!: ExpenseDto[];

  @ApiProperty({ example: 42, description: 'Total de filas para la paginación' })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 50 })
  pageSize!: number;
}

export class PlanDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Plan Mensual' })
  name!: string;

  @ApiProperty({ example: 'Suscripción mensual', nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  monthlyUsd!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  semiannualUsd!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  annualUsd!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class RemittanceDto {
  @ApiProperty({ example: 4 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 'provider-x' })
  provider!: string;

  @ApiProperty({ example: 'SRC-1234' })
  sourceId!: string;

  @ApiProperty({ enum: ['PENDING', 'COMPLETED', 'FAILED'], description: 'Estados del enum RemittanceStatus' })
  status!: string;

  @ApiProperty({ nullable: true })
  idempotencyKey!: string | null;

  @ApiProperty({ example: true, description: 'Solo en ingest: true si el evento ya existía' })
  duplicate?: boolean;

  @ApiProperty({ type: 'array', items: { type: 'object', additionalProperties: true }, nullable: true })
  movements?: Array<Record<string, unknown>> | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class ReconcilePositionDto {
  @ApiProperty({ example: 2 })
  currencyId!: number;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  positionSaldo!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  movementSaldo!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  difference!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Decimal como string; null si no hay caja para la moneda' })
  cashBalance!: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'Decimal como string' })
  cashPositionDifference!: string | null;

  @ApiProperty({ enum: ['UNREVIEWED', 'REVIEWED'] })
  reviewStatus!: string;

  @ApiProperty({ example: 2 })
  movementCount!: number;

  @ApiProperty({ example: true })
  ok!: boolean;
}

export class ReconcileIssueDto {
  @ApiProperty({ example: 4 })
  remittanceId!: number;

  @ApiProperty({ example: 2 })
  movementCount!: number;

  @ApiProperty({ example: true })
  localLegValid!: boolean;

  @ApiProperty({ example: true })
  ok!: boolean;
}

export class RemittanceReconcileDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ example: 6 })
  completedRemittances!: number;

  @ApiProperty({ example: 5 })
  providerRemittances!: number;

  @ApiProperty({ example: 1 })
  manualRemittances!: number;

  @ApiProperty({ example: 12 })
  linkedProviderMovements!: number;

  @ApiProperty({ example: 30 })
  linkedMovements!: number;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'boolean' } })
  checks!: Record<string, boolean>;

  @ApiProperty({ type: [ReconcilePositionDto] })
  positions!: ReconcilePositionDto[];

  @ApiProperty({ type: [ReconcileIssueDto] })
  remittanceIssues!: ReconcileIssueDto[];

  @ApiProperty({ description: 'NOT_APPLICABLE | NOT_VERIFIABLE | VERIFIED', type: 'object', additionalProperties: true })
  primaryCashLedger!: Record<string, unknown>;
}

export class TransactionDto {
  @ApiProperty({ example: 20 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ enum: ['COMPRA', 'VENTA'] })
  type!: 'COMPRA' | 'VENTA';

  @ApiProperty({ example: 2 })
  currencyId!: number;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amount!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  rate!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Decimal como string' })
  requestedRate!: string | null;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  totalCup!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  marginProfit!: string;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty({ enum: ['TRANSFER', 'REMITTANCE'] })
  operationKind!: string;

  @ApiProperty({ example: 'CASH' })
  sourceType!: string;

  @ApiProperty({ nullable: true })
  sourceBankAccountId!: number | null;

  @ApiProperty({ example: 'CASH' })
  destinationType!: string;

  @ApiProperty({ nullable: true })
  destinationBankAccountId!: number | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class FxTransferResultDto {
  @ApiProperty({ type: TransactionDto })
  transaction!: TransactionDto;

  @ApiProperty({ description: 'Movimiento de posición generado', type: 'object', additionalProperties: true })
  movement!: Record<string, unknown>;

  @ApiProperty({ nullable: true, description: 'Posición afectada', type: 'object', additionalProperties: true })
  position?: Record<string, unknown> | null;

  @ApiProperty({ type: String, nullable: true, description: 'Decimal como string; solo ventas desde posición' })
  realizedProfit?: string | null;
}

/**
 * Respuesta de `POST /fx-operations/positions/open`.
 *
 * Abrir una posición histórica **no** crea una `Transaction` (crea un
 * `CurrencyMovement` de tipo OPENING), así que la respuesta real no tiene
 * `transaction`: declararla como `FxTransferResultDto` obligaba al cliente a
 * decodificar un campo inexistente y el SDK generado fallaba al abrir la
 * posición.
 */
export class FxOpenPositionResultDto {
  @ApiProperty({ description: 'Posición abierta o actualizada', type: 'object', additionalProperties: true })
  position!: Record<string, unknown>;

  @ApiProperty({ description: 'Movimiento de apertura generado', type: 'object', additionalProperties: true })
  movement!: Record<string, unknown>;

  @ApiProperty({ description: 'Saldo de caja usado como saldo inicial', type: 'object', additionalProperties: true })
  cashBalance!: Record<string, unknown>;
}
