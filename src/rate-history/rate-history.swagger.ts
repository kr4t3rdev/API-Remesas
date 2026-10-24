import { ApiProperty } from '@nestjs/swagger';
import { CurrencyDto } from '../currencies/currencies.swagger';

/**
 * Response DTOs for the Rate History module.
 *
 * Rates are decimal strings (task 1.14 decision).
 */

export class RateHistoryEntryDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 2 })
  currencyFromId!: number;

  @ApiProperty({ example: 1 })
  currencyToId!: number;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  rate!: string;

  @ApiProperty({ enum: ['MANUAL', 'SYSTEM'] })
  source!: string;

  @ApiProperty({ example: 'exchange_rate', nullable: true })
  referenceType!: string | null;

  @ApiProperty({ example: 10, nullable: true })
  referenceId!: number | null;

  @ApiProperty({ type: CurrencyDto, nullable: true, description: 'Presente en listados; create no incluye' })
  currencyFrom?: CurrencyDto | null;

  @ApiProperty({ type: CurrencyDto, nullable: true, description: 'Presente en listados; create no incluye' })
  currencyTo?: CurrencyDto | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class RateHistoryStatsDto {
  @ApiProperty({ type: String, description: 'Decimal como string' })
  average!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  min!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  max!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  latest!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  previous!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  change!: string;

  @ApiProperty({ example: 1.48, description: 'Porcentaje redondeado (number)' })
  changePercent!: number;

  @ApiProperty({ example: 12 })
  count!: number;

  @ApiProperty({ example: 5 })
  manualCount!: number;
}

export class RateHistoryResetDto {
  @ApiProperty({ example: 'Historial de tasas reseteado correctamente' })
  message!: string;

  @ApiProperty({ example: 14 })
  count!: number;
}
