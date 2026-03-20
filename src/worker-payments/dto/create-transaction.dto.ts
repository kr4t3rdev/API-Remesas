import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

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
}
