import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle, LicenseState } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class AssignLicenseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  planId!: number;

  @ApiProperty({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  cycle!: BillingCycle;

  @ApiPropertyOptional({ enum: LicenseState, example: LicenseState.ACTIVE })
  @IsOptional()
  @IsEnum(LicenseState)
  state?: LicenseState;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: 'Asignación manual admin' })
  @IsOptional()
  @IsString()
  reason?: string;
}
