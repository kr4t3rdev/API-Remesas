import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class OpenCurrencyPositionDto {
  @ApiProperty({ description: 'Currency whose existing cash balance is being opened' })
  @IsInt()
  @Min(1)
  currencyId!: number;

  @ApiProperty({ description: 'Historical weighted average cost per unit', type: String, example: '240.5000' })
  @IsDecimalString({ min: '0.0001', max: '999999.9999', maxDecimalPlaces: 4 })
  openingCost!: string;
}
