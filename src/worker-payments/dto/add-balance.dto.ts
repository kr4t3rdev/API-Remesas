import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Min, IsEnum, IsNotEmpty, IsInt } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class AddBalanceDto {
  @ApiProperty({ description: 'Monto a entregar al trabajador', type: String, example: '100.00' })
  @IsDecimalString({ min: '0.01', message: 'El monto debe ser mayor a cero' })
  amount: string;

  @ApiPropertyOptional({ description: 'Tipo de origen: CASH o BANK_ACCOUNT' })
  @IsOptional()
  @IsEnum(['CASH', 'BANK_ACCOUNT'])
  sourceType?: 'CASH' | 'BANK_ACCOUNT';

  @ApiPropertyOptional({ description: 'ID del origen (bankAccountId si sourceType es BANK_ACCOUNT)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  sourceId?: number;

  @ApiProperty({ description: 'ID de la moneda' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  currencyId?: number;
}
