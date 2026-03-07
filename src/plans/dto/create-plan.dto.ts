import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyUsd?: number;

  @ApiPropertyOptional({ example: 85.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  semiannualUsd?: number;

  @ApiPropertyOptional({ example: 162 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualUsd?: number;
}
