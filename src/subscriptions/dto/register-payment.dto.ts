import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class RegisterPaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  userLicenseId?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  planId!: number;

  @ApiProperty({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  cycle!: BillingCycle;

  @ApiProperty({ example: '15.00', description: 'Importe USD en decimal string', type: String })
  @IsDecimalString({ min: '0.01' })
  amountUsd!: string;

  @ApiProperty({ example: '350.00', description: 'Tasa de cambio usada (decimal string)', type: String })
  @IsDecimalString({ min: '0.0001' })
  exchangeRateUsed!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  bankAccountId?: number;

  @ApiPropertyOptional({ example: '2026-03-05T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({ example: 'Cobro mensual licencia' })
  @IsOptional()
  @IsString()
  notes?: string;
}
