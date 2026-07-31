import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: 'COMPRA' })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999999999.99)
  amount: number;

  @ApiProperty({ example: 180.5 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  @Max(999999.9999)
  rate: number;

  @ApiPropertyOptional({ example: 1, description: 'Cuenta bancaria de destino' })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;

  @ApiProperty({ example: 'Nota opcional', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
