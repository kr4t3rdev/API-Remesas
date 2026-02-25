import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { RateType } from '@prisma/client';

export class ReconcileExpenseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  expenseId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  bankAccountId: number;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ enum: RateType, example: 'ACTUAL' })
  @IsOptional()
  @IsEnum(RateType)
  rateType?: RateType;

  @ApiPropertyOptional({ example: 200.0 })
  @IsOptional()
  @IsNumber()
  appliedRate?: number;

  @ApiPropertyOptional({ example: 'Nota opcional' })
  @IsOptional()
  @IsString()
  notes?: string;
}
