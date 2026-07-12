import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateFxTransferDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsInt()
  currencyId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.000001)
  rate: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
