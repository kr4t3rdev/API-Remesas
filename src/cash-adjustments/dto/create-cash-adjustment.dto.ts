import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsEnum, IsString } from 'class-validator';
import { AdjustmentType } from '@prisma/client';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateCashAdjustmentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId: number;

  @ApiProperty({ example: '100.00', description: 'Importe en decimal string', type: String })
  @IsDecimalString({ min: '0.01' })
  amount: string;

  @ApiProperty({ enum: AdjustmentType, example: 'INGRESO' })
  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @ApiProperty({ example: 'Depósito inicial' })
  @IsString()
  reason: string;
}
