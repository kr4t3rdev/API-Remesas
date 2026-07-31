import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  Min,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TransferAccountType } from '@prisma/client';

export enum ExpenseCategory {
  RENTA = 'renta',
  SERVICIOS = 'servicios',
  SALARIO = 'salario',
  INSUMOS = 'insumos',
  OTROS = 'otros',
}

export class CreateExpenseDto {
  @ApiProperty({ example: 'Renta del local' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId: number;

  @ApiProperty({ enum: TransferAccountType })
  @IsEnum(TransferAccountType)
  sourceType: TransferAccountType;

  @ApiPropertyOptional({ description: 'Required when sourceType is BANK_ACCOUNT' })
  @ValidateIf((dto) => dto.sourceType === TransferAccountType.BANK_ACCOUNT)
  @IsInt()
  sourceBankAccountId?: number;

  @ApiProperty({ enum: ExpenseCategory, example: 'renta' })
  @IsEnum(ExpenseCategory)
  category: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Nota opcional' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  notes?: string;
}
