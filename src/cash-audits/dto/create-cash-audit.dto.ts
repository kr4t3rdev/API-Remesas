import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class CreateCashAuditDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  currencyId!: number;

  @ApiProperty({ example: '5000.00', description: 'Saldo real en decimal string', type: String })
  @IsDecimalString({ min: '0' })
  actualBalance!: string;

  @ApiPropertyOptional({ example: 'Nota del arqueo' })
  @IsOptional()
  @IsString()
  notes?: string;
}
