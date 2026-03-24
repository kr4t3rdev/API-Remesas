import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty, MaxLength, Min } from 'class-validator';

export class CreateExpenseItemDto {
  @ApiProperty({ example: 'Arrendamientos de Inmuebles', description: 'Nombre del gasto' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 5000.0, description: 'Monto del gasto' })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a cero' })
  amount: number;

  @ApiPropertyOptional({ example: 'Inmuebles', description: 'Categoría opcional' })
  @IsOptional()
  @IsString()
  category?: string;
}
