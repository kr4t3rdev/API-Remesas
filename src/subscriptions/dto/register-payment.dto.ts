import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0.01)
  amountUsd!: number;

  @ApiProperty({ example: 350 })
  @IsNumber()
  @Min(0.0001)
  exchangeRateUsed!: number;

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
