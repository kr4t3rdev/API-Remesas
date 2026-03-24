import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class QueryExpenseItemDto {
  @ApiPropertyOptional({ example: 'Inmuebles', description: 'Filtrar por categoría' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: '2026-03-01', description: 'Fecha de inicio (ISO)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-31', description: 'Fecha de fin (ISO)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
