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
} from 'class-validator';

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

  @ApiProperty({ enum: ExpenseCategory, example: 'renta' })
  @IsEnum(ExpenseCategory)
  category: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Nota opcional' })
  @IsOptional()
  @IsString()
  notes?: string;
}
