import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCashAuditDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId!: number;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  actualBalance!: number;

  @ApiPropertyOptional({ example: 'Nota del arqueo' })
  @IsOptional()
  @IsString()
  notes?: string;
}
