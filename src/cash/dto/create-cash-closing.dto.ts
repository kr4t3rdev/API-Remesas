import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateCashClosingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId!: number;

  @ApiProperty({ example: '2026-07-11', format: 'date' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString()
  businessDate!: string;

  @ApiProperty({ example: 1500.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualBalance!: number;

  @ApiPropertyOptional({ example: 'Cierre sin diferencias' })
  @IsOptional()
  @IsString()
  notes?: string;
}
