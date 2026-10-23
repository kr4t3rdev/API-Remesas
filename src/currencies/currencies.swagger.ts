import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTOs for the Currencies module, mirroring the shapes
 * returned by CurrenciesService.
 */
export class CurrencyResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'USD' })
  code!: string;

  @ApiProperty({ example: 'Dólar estadounidense' })
  name!: string;

  @ApiProperty({ example: '$' })
  symbol!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: Date;
}

export class CurrenciesWithPrimaryResponseDto {
  @ApiProperty({ type: [CurrencyResponseDto] })
  currencies!: CurrencyResponseDto[];

  @ApiProperty({ type: 'integer', nullable: true })
  primaryCurrencyId!: number | null;
}
