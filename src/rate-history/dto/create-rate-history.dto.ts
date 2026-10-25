import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export enum RateSource {
  MANUAL = 'MANUAL',
  SYSTEM = 'SYSTEM',
}

export class CreateRateHistoryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  currencyFromId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  currencyToId: number;

  @ApiProperty({ example: '200.50', description: 'Tasa en decimal string', type: String })
  @IsDecimalString({ min: '0' })
  rate: string;

  @ApiProperty({ enum: RateSource, example: RateSource.MANUAL })
  @IsEnum(RateSource)
  source: RateSource;

  @ApiProperty({ example: 'transaction', required: false })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  referenceId?: number;
}
