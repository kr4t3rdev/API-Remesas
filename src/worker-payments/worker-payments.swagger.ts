import { ApiProperty } from '@nestjs/swagger';
import { CurrencyDto } from '../currencies/currencies.swagger';

/**
 * Response DTOs for the Worker Payments module.
 *
 * Monetary fields are decimal strings (task 1.14 decision). Shapes mirror
 * exactly what WorkerPaymentsService returns.
 */

export class WorkerBalanceDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  workerId!: number;

  @ApiProperty({ example: 2 })
  currencyId!: number;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  balance!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  costBasisPrimary!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  accumulatedProfit!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  totalDelivered!: string;
}

export class WorkerTransactionDto {
  @ApiProperty({ example: 20 })
  id!: number;

  @ApiProperty({ example: 1 })
  workerId!: number;

  @ApiProperty({ example: 2 })
  currencyId!: number;

  @ApiProperty({ example: 'TRANSACTION', description: 'TRANSACTION | BALANCE | DEPOSIT' })
  type!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amount!: string;

  @ApiProperty({ type: String, nullable: true, description: 'Solo TRANSACTION' })
  profit!: string | null;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  balanceBefore!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  balanceAfter!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class WorkerDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 'Carlos' })
  name!: string;

  @ApiProperty({ example: '+53 5xxx xxxx', nullable: true, type: String })
  phone!: string | null;

  @ApiProperty({ nullable: true })
  photoUrl!: string | null;

  @ApiProperty({ example: 'CAR' })
  initials!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  balance!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  accumulatedProfit!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  totalDelivered!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ type: [WorkerBalanceDto], nullable: true, description: 'Con currency en listado/detalle; ausente en update/delete' })
  balances?: Array<WorkerBalanceDto & { currency: CurrencyDto }>;

  @ApiProperty({ type: [WorkerTransactionDto], nullable: true, description: 'Con currency en listado/detalle; ausente en update/delete' })
  transactions?: Array<WorkerTransactionDto & { currency: CurrencyDto }>;
}

export class WorkerMutationResultDto {
  @ApiProperty({ type: WorkerTransactionDto })
  transaction!: WorkerTransactionDto;

  @ApiProperty({ type: WorkerBalanceDto })
  workerBalance!: WorkerBalanceDto;
}
