import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class UpdateExpenseItemDto {
  @ApiPropertyOptional({ example: 'Mantenimiento de Inmuebles' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: '3500.00', description: 'Monto en decimal string', type: String })
  @IsOptional()
  @IsDecimalString({ min: '0.01', message: 'El monto debe ser mayor a cero' })
  amount?: string;

  @ApiPropertyOptional({ type: 'string', nullable: true, example: 'Inmuebles', description: 'Null para eliminar categoría' })
  @IsOptional()
  @IsString()
  category?: string | null;
}
