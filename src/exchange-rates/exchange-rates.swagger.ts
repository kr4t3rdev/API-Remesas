import { ApiProperty } from '@nestjs/swagger';
import { CurrencyDto } from '../currencies/currencies.swagger';

/**
 * Response DTOs for the Exchange Rates module.
 *
 * Serialization notes (verified empirically):
 * - Prisma `Decimal` columns (referenceRate, buyMargin, sellMargin) are
 *   serialized by JSON.stringify as **strings**, preserving precision.
 * - `buyRate` / `sellRate` are computed in the service with exact Decimal
 *   arithmetic and serialized with the canonical decimal-string helper, so
 *   every monetary value crosses the boundary as a string (task 1.14
 *   decision: unique decimal-string representation).
 */

export class ExchangeRateDto {
  @ApiProperty({ example: 10 })
  id!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 2 })
  currencyId!: number;

  @ApiProperty({ type: String, example: '270.5000', description: 'Tasa de referencia (decimal como string)' })
  referenceRate!: string;

  @ApiProperty({ type: String, example: '0.0200', description: 'Margen de compra (decimal como string)' })
  buyMargin!: string;

  @ApiProperty({ type: String, example: '0.0300', description: 'Margen de venta (decimal como string)' })
  sellMargin!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-22T12:00:00.000Z' })
  effectiveDate!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-22T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time', example: '2026-10-22T12:00:00.000Z' })
  updatedAt!: string;
}

export class ExchangeRateWithCurrencyDto extends ExchangeRateDto {
  @ApiProperty({ type: CurrencyDto })
  currency!: CurrencyDto;
}

export class ExchangeRateComputedDto extends ExchangeRateWithCurrencyDto {
  @ApiProperty({
    type: String,
    example: '265.09',
    description: 'referenceRate * (1 - buyMargin), aritmética Decimal exacta en el servidor',
  })
  buyRate!: string;

  @ApiProperty({
    type: String,
    example: '278.615',
    description: 'referenceRate * (1 + sellMargin), aritmética Decimal exacta en el servidor',
  })
  sellRate!: string;
}

export class ExchangeRateUpdateResponseDto extends ExchangeRateComputedDto {
  @ApiProperty({ example: true, description: 'true si se creó una tasa nueva en lugar de actualizar' })
  isNewRate!: boolean;
}

export class ExchangeRatesCurrentResponseDto {
  @ApiProperty({ type: [ExchangeRateComputedDto] })
  rates!: ExchangeRateComputedDto[];

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 1,
    description: 'ID de la moneda CUP usada como referencia, o null si no existe',
  })
  cupCurrencyId!: number | null;
}

export class RemoveExchangeRateResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Tasa de cambio eliminada correctamente' })
  message!: string;
}
