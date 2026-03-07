import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomRateDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  transactionId: number;

  @ApiProperty({ example: 180.0 })
  @IsInt()
  appliedRate: number;
}

export class ReconcileIncomeBulkDto {
  @ApiProperty({ example: [1, 2, 3], type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsInt({ each: true })
  transactionIds: number[];

  @ApiProperty({ example: 1 })
  @IsInt()
  bankAccountId: number;

  @ApiPropertyOptional({ example: [{ transactionId: 1, appliedRate: 180 }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomRateDto)
  customRates?: CustomRateDto[];
}
