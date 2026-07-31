import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class OpenCurrencyPositionDto {
  @ApiProperty({ description: 'Currency whose existing cash balance is being opened' })
  @IsInt()
  @Min(1)
  currencyId!: number;

  @ApiProperty({ description: 'Historical weighted average cost per unit' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @Max(999999.9999)
  openingCost!: number;
}
