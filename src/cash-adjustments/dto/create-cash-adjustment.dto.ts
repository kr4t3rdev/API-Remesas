import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsEnum, IsString, Min } from 'class-validator';
import { AdjustmentType } from '@prisma/client';

export class CreateCashAdjustmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId: number;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: AdjustmentType, example: 'INGRESO' })
  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @ApiProperty({ example: 'Depósito inicial' })
  @IsString()
  reason: string;
}
