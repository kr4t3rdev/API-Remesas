import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreatePlanDto {
  @ApiProperty({ example: 'Plan Estándar' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Plan base con licencia por usuario' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '25.00', description: 'Precio mensual USD en decimal string', type: String })
  @IsDecimalString({ min: '0' })
  monthlyUsd!: string;

  @ApiPropertyOptional({ example: '85.50', description: 'Precio semestral USD en decimal string', type: String })
  @IsOptional()
  @IsDecimalString({ min: '0' })
  semiannualUsd?: string;

  @ApiPropertyOptional({ example: '162.00', description: 'Precio anual USD en decimal string', type: String })
  @IsOptional()
  @IsDecimalString({ min: '0' })
  annualUsd?: string;
}
