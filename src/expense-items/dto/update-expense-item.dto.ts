import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class UpdateExpenseItemDto {
  @ApiPropertyOptional({ example: 'Mantenimiento de Inmuebles' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 3500.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a cero' })
  amount?: number;

  @ApiPropertyOptional({ type: 'string', nullable: true, example: 'Inmuebles', description: 'Null para eliminar categoría' })
  @IsOptional()
  @IsString()
  category?: string | null;
}
