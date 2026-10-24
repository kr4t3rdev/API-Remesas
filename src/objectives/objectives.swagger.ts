import { ApiProperty } from '@nestjs/swagger';
import { CurrencyDto } from '../currencies/currencies.swagger';

/**
 * Response DTOs for the Objectives module.
 *
 * Monetary fields are decimal strings (task 1.14 decision).
 */

export class ObjectiveDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 'Meta de ahorro Q1' })
  name!: string;

  @ApiProperty({ example: 'Acumular USD para operativa', nullable: true, type: String })
  description!: string | null;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  targetAmount!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  currentAmount!: string;

  @ApiProperty({ example: 2 })
  currencyId!: number;

  @ApiProperty({ example: 3, nullable: true, type: Number })
  bankAccountId!: number | null;

  @ApiProperty({ enum: ['ACTIVO', 'COMPLETADO', 'PAUSADO'] })
  status!: string;

  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;

  @ApiProperty({ nullable: true, description: 'Cuenta destino; null si pertenece a otro tenant' })
  bankAccount!: Record<string, unknown> | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class ObjectiveProgressDto extends ObjectiveDto {
  @ApiProperty({ example: 45.8, description: 'Porcentaje de avance, acotado a 100' })
  percentage!: number;

  @ApiProperty({ type: String, description: 'Decimal como string; monto restante' })
  remaining!: string;
}
