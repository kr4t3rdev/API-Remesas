import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, IsEnum, IsNotEmpty, IsInt } from 'class-validator';

export class DepositDto {
  @ApiProperty({ description: 'Monto a depositar' })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a cero' })
  amount: number;

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
