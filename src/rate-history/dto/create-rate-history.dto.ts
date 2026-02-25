import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiProperty({ example: 200.5 })
  @IsNumber()
  @Min(0)
  rate: number;

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
