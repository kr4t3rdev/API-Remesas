import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Min, IsEnum, IsNotEmpty, IsInt } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Cantidad de la transacción', type: String, example: '100.00' })
  @IsDecimalString({ min: '0' })
  amount: string;

  @ApiProperty({ description: 'Ganancia generada por la transacción', type: String, example: '5.50' })
  @IsDecimalString({ min: '0' })
  profit: string;

  @ApiProperty({ description: 'Descripción de la transacción', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tipo de destino: CASH o BANK_ACCOUNT' })
  @IsOptional()
  @IsEnum(['CASH', 'BANK_ACCOUNT'])
  destinationType?: 'CASH' | 'BANK_ACCOUNT';

  @ApiPropertyOptional({ description: 'ID del destino (bankAccountId si destinationType es BANK_ACCOUNT)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  destinationId?: number;

  @ApiProperty({ description: 'ID de la moneda' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  currencyId?: number;
}
