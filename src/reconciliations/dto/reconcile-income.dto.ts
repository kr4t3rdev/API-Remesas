import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { BillingCycle, RateType } from '@prisma/client';

export class ReconcileIncomeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  transactionId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  bankAccountId: number;

  @ApiProperty({ example: 10000.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ enum: RateType, example: 'ACTUAL' })
  @IsOptional()
  @IsEnum(RateType)
  rateType?: RateType;

  @ApiPropertyOptional({ example: 200.0 })
  @IsOptional()
  @IsNumber()
  appliedRate?: number;

  @ApiPropertyOptional({ example: 'Nota opcional' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID de suscripción relacionada al ingreso' })
  @IsOptional()
  @IsInt()
  subscriptionId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de licencia relacionada al ingreso' })
  @IsOptional()
  @IsInt()
  userLicenseId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del plan de suscripción' })
  @IsOptional()
  @IsInt()
  planId?: number;

  @ApiPropertyOptional({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({ example: 15, description: 'Monto nominal en USD' })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amountUsd?: number;

  @ApiPropertyOptional({ example: 350, description: 'Tasa de cambio usada al cobrar (USD->CUP)' })
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  exchangeRateUsed?: number;
}
