import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { ReconciliationStatus } from '@prisma/client';
import { ExpenseCategory } from './create-expense.dto';

export class QueryExpenseDto {
  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: string;

  @ApiPropertyOptional({ enum: ReconciliationStatus })
  @IsOptional()
  @IsEnum(ReconciliationStatus)
  status?: ReconciliationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  currencyId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
