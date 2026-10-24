import { ApiProperty } from '@nestjs/swagger';
import { CurrencyDto } from '../currencies/currencies.swagger';

/**
 * Response DTOs for the Bank Accounts module.
 *
 * Monetary fields are decimal strings (task 1.14 decision). Shapes mirror
 * exactly what BankAccountsService returns.
 */

export class BankAccountDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 'Cuenta personal' })
  name!: string;

  @ApiProperty({ example: 'Banco Nacional' })
  bankName!: string;

  @ApiProperty({ example: 2 })
  currencyId!: number;

  @ApiProperty({ type: CurrencyDto, nullable: true, description: 'Null en DELETE, que no incluye la moneda' })
  currency!: CurrencyDto | null;

  @ApiProperty({ example: '0001234567' })
  accountNumber!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  balance!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class BankAccountBalanceDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Cuenta personal' })
  name!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  balance!: string;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;
}

export class BankTransferCurrencyDto {
  @ApiProperty({ example: 1, nullable: true, type: Number, description: 'Null en la pierna CUP' })
  id!: number | null;

  @ApiProperty({ example: 'CUP' })
  code!: string;

  @ApiProperty({ example: 'Peso cubano' })
  name!: string;

  @ApiProperty({ example: '$' })
  symbol!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class BankTransferDto {
  @ApiProperty({ example: 'transfer:20', description: 'Prefijo transfer + id real' })
  id!: string;

  @ApiProperty({ example: 20 })
  transactionId!: number;

  @ApiProperty({ enum: ['COMPRA', 'VENTA'] })
  type!: 'COMPRA' | 'VENTA';

  @ApiProperty({ enum: ['TRANSFER', 'REMITTANCE'], nullable: true })
  operationKind?: string | null;

  @ApiProperty({ enum: ['IN', 'OUT'], description: 'Perspectiva de la cuenta consultada' })
  direction!: 'IN' | 'OUT';

  @ApiProperty({ type: String, description: 'Decimal como string; pierna que afecta a la cuenta' })
  amount!: string;

  @ApiProperty({
    description: 'Moneda del movimiento; la pierna CUP llega como { code: CUP, id: null }',
  })
  currency!: BankTransferCurrencyDto;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  rate!: string;

  @ApiProperty({ nullable: true })
  sourceType?: string | null;

  @ApiProperty({ nullable: true })
  destinationType?: string | null;

  @ApiProperty({ nullable: true })
  sourceBankAccountId?: number | null;

  @ApiProperty({ nullable: true })
  destinationBankAccountId?: number | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class BankAccountTransactionsDto {
  @ApiProperty({ description: 'Gastos con origen en la cuenta (filas Prisma; montos como decimal-string)', type: 'array', items: { type: 'object', additionalProperties: true } })
  expenses!: Array<Record<string, unknown>>;

  @ApiProperty({ type: [BankTransferDto] })
  transfers!: BankTransferDto[];
}
