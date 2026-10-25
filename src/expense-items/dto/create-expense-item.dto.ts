import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateExpenseItemDto {
  @ApiProperty({ example: 'Arrendamientos de Inmuebles', description: 'Nombre del gasto' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '5000.00', description: 'Monto del gasto en decimal string', type: String })
  @IsDecimalString({ min: '0.01', message: 'El monto debe ser mayor a cero' })
  amount: string;

  @ApiPropertyOptional({ example: 'Inmuebles', description: 'Categoría opcional' })
  @IsOptional()
  @IsString()
  category?: string;
}
