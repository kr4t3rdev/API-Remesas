import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for Plan. Prices are JSON numbers per the contract money
 * convention (2-decimal amounts); PlansService converts the Prisma
 * Decimal(10,2) columns to numbers at the boundary.
 */
export class PlanResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Básico' })
  name!: string;

  @ApiProperty({ type: 'string', nullable: true })
  description!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: 'number', example: 15.0 })
  monthlyUsd!: number;

  @ApiProperty({ type: 'number', example: 85.5 })
  semiannualUsd!: number;

  @ApiProperty({ type: 'number', example: 162.0 })
  annualUsd!: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: Date;
}
