import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTOs for the Subscriptions module.
 *
 * Monetary fields are decimal strings (task 1.14 decision). Shapes mirror
 * exactly what SubscriptionsService returns (license rows include plan and
 * a reduced user).
 */

export class SubscriptionLicenseDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ example: 2 })
  userId!: number;

  @ApiProperty({ example: 1 })
  planId!: number;

  @ApiProperty({ enum: ['TRIAL', 'ACTIVE', 'GRACE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'] })
  state!: string;

  @ApiProperty({ enum: ['MONTHLY', 'SEMIANNUAL', 'ANNUAL'] })
  cycle!: string;

  @ApiProperty({ format: 'date-time' })
  startedAt!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  graceUntil!: string | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  cancelledAt!: string | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  lastPaymentAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ description: 'Plan de la licencia', type: 'object', additionalProperties: true })
  plan!: Record<string, unknown>;

  @ApiProperty({ nullable: true, description: 'Usuario reducido (id, email, name); presente en listados' })
  user?: { id: number; email: string; name: string } | null;
}

export class SubscriptionPaymentDto {
  @ApiProperty({ example: 9 })
  id!: number;

  @ApiProperty({ example: 2 })
  userId!: number;

  @ApiProperty({ example: 5, nullable: true, type: Number })
  userLicenseId!: number | null;

  @ApiProperty({ example: 1 })
  planId!: number;

  @ApiProperty({ enum: ['MONTHLY', 'SEMIANNUAL', 'ANNUAL'] })
  cycle!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amountUsd!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  exchangeRateUsed!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  amountCup!: string;

  @ApiProperty({ format: 'date-time' })
  paidAt!: string;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
