import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, IsEnum, IsNotEmpty, IsInt } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Cantidad de la transacción' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Ganancia generada por la transacción' })
  @IsNumber()
  @Min(0)
  profit: number;

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
