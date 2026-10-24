import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTOs for the Currencies module.
 *
 * Shapes mirror the `Currency` model (id, code, name, symbol, isActive)
 * as returned by `CurrenciesService`.
 */
export class CurrencyDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'USD' })
  code!: string;

  @ApiProperty({ example: 'Dólar estadounidense' })
  name!: string;

  @ApiProperty({ example: '$' })
  symbol!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class CurrenciesWithPrimaryResponseDto {
  @ApiProperty({ type: [CurrencyDto] })
  currencies!: CurrencyDto[];

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 2,
    description: 'ID de la moneda principal del usuario, o null si no definió una',
  })
  primaryCurrencyId!: number | null;
}
