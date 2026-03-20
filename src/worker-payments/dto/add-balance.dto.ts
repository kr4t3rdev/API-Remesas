import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AddBalanceDto {
  @ApiProperty({ description: 'Monto a entregar al trabajador' })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a cero' })
  amount: number;
}
