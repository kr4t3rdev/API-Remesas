import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateObjectiveDto {
  @ApiProperty({ example: 'Meta de ventas Q1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Alcanzar $50,000 en ventas' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '50000.00', description: 'Meta en decimal string', type: String })
  @IsDecimalString({ min: '0.01' })
  targetAmount: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;
}
