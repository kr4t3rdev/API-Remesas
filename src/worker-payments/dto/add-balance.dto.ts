import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, IsEnum, IsNotEmpty, IsInt } from 'class-validator';

export class AddBalanceDto {
  @ApiProperty({ description: 'Monto a entregar al trabajador' })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a cero' })
  amount: number;

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
