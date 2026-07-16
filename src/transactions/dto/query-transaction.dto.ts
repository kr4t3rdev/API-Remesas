import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { FxOperationKind, TransactionType } from '@prisma/client';

export class QueryTransactionDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ enum: FxOperationKind })
  @IsOptional()
  @IsEnum(FxOperationKind)
  operationKind?: FxOperationKind;

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
