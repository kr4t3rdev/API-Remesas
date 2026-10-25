import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: 'COMPRA' })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId: number;

  @ApiProperty({ example: '100.00', description: 'Importe en decimal string', type: String })
  @IsDecimalString({ min: '0.01', max: '999999999.99', maxDecimalPlaces: 2 })
  amount: string;

  @ApiProperty({ example: '180.5', description: 'Tasa en decimal string', type: String })
  @IsDecimalString({ min: '0.0001', max: '999999.9999', maxDecimalPlaces: 4 })
  rate: string;

  @ApiPropertyOptional({ example: 1, description: 'Cuenta bancaria de destino' })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;

  @ApiProperty({ example: 'Nota opcional', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
