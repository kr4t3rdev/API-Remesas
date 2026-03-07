import { ApiProperty } from '@nestjs/swagger';
import { BillingCycle } from '@prisma/client';
import { IsEnum, IsInt } from 'class-validator';

export class RenewLicenseDto {
  @ApiProperty({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  cycle!: BillingCycle;

  @ApiProperty({ example: 1 })
  @IsInt()
  planId!: number;
}
