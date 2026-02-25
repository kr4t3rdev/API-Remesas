import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateObjectiveDto {
  @ApiProperty({ example: 'Meta de ventas Q1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Alcanzar $50,000 en ventas' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 50000.0 })
  @IsNumber()
  @Min(0.01)
  targetAmount: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;
}
