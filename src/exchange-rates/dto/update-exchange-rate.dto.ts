import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateExchangeRateDto {
  @ApiProperty({ example: 200.0 })
  @IsNumber()
  @Min(0)
  referenceRate!: number;

  @ApiProperty({ example: 0.05 })
  @IsNumber()
  @Min(0)
  @Max(1)
  buyMargin!: number;

  @ApiProperty({ example: 0.05 })
  @IsNumber()
  @Min(0)
  @Max(1)
  sellMargin!: number;
}
