import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: 'COMPRA' })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 180.5 })
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiPropertyOptional({ example: 1, description: 'Cuenta bancaria para reconciliación directa' })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;

  @ApiProperty({ example: 'Nota opcional', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
