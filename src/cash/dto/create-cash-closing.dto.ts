import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateCashClosingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId!: number;

  @ApiProperty({ example: '2026-07-11', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString()
  businessDate!: string;

  @ApiProperty({ example: '1500.50', description: 'Saldo real en decimal string', type: String })
  @IsDecimalString({ min: '0', maxDecimalPlaces: 2 })
  actualBalance!: string;

  @ApiPropertyOptional({ example: 'Cierre sin diferencias' })
  @IsOptional()
  @IsString()
  notes?: string;
}
