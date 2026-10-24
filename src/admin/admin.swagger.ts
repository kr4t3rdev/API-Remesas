import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTOs for the Admin module.
 *
 * Monetary values are decimal strings (task 1.14). User responses use the
 * safe select (never include the password hash — fixed alongside task 1.12).
 */

export class AdminUserDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: 'user2@test.com' })
  email!: string;

  @ApiProperty({ example: 'User Dos' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'] })
  role!: 'ADMIN' | 'USER';

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: false })
  isBanned!: boolean;

  @ApiProperty({ type: String, nullable: true, format: 'date-time' })
  blockedUntil!: string | null;

  @ApiProperty({ type: String, nullable: true, format: 'date-time', description: 'Ausente en el alta desde consola' })
  bannedUntil!: string | null;

  @ApiProperty({ example: 0 })
  failedLoginAttempts!: number;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class AdminKpisDto {
  @ApiProperty({ example: 120 })
  totalUsers!: number;

  @ApiProperty({ example: 118, description: 'Usuarios no baneados' })
  activeUsers30d!: number;

  @ApiProperty({ example: 9 })
  newUsersPeriod!: number;

  @ApiProperty({ example: 2 })
  suspendedUsers!: number;

  @ApiProperty({ description: 'Cantidad de licencias por estado', type: 'object', additionalProperties: { type: 'integer' } })
  licensesByState!: Record<string, number>;

  @ApiProperty({ example: 4 })
  expiringIn7d!: number;

  @ApiProperty({ example: 11 })
  expiringIn30d!: number;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  mrrEstimateCup!: string;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  arpuEstimateCup!: string;

  @ApiProperty({ type: String, description: 'Decimal como string (20% del MRR)' })
  revenueAtRiskCup!: string;

  @ApiProperty({ example: 3 })
  churnPeriod!: number;

  @ApiProperty({ example: 1 })
  reactivatedPeriod!: number;

  @ApiProperty({ example: 12.5, description: 'Porcentaje redondeado (number)' })
  trialToPaidConversionPct!: number;

  @ApiProperty({ example: 88.0, description: 'Porcentaje redondeado (number)' })
  renewalRatePct!: number;

  @ApiProperty({ example: 4.2, description: 'Porcentaje redondeado (number)' })
  cancellationRatePct!: number;
}

export class AdminPlatformSeriesBucketDto {
  @ApiProperty({ example: 'MAY' })
  label!: string;

  @ApiProperty({ example: 2026 })
  year!: number;

  @ApiProperty({ example: 5 })
  month!: number;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  billingCup!: string;

  @ApiProperty({ example: 18 })
  newUsers!: number;

  @ApiProperty({ example: 4 })
  churn!: number;
}

export class AdminPlatformSeriesDto {
  @ApiProperty({ example: 6 })
  monthsBack!: number;

  @ApiProperty({ type: [AdminPlatformSeriesBucketDto] })
  series!: AdminPlatformSeriesBucketDto[];

  @ApiProperty()
  totals!: {
    billingCup: string;
    newUsers: number;
    churn: number;
  };
}

export class AdminProfileStatsDto {
  @ApiProperty({ example: 120 })
  totalUsers!: number;

  @ApiProperty({ example: 118 })
  activeUsers!: number;

  @ApiProperty({ example: 2 })
  blockedUsers!: number;

  @ApiProperty({ example: 4 })
  expiringLicenses!: number;

  @ApiProperty({ type: String, description: 'Decimal como string' })
  dailyRevenue!: string;

  @ApiProperty({ example: 96 })
  activeLicenses!: number;
}

export class AdminUserDetailLicenseDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ enum: ['TRIAL', 'ACTIVE', 'GRACE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'] })
  state!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ example: 1 })
  planId!: number;
}

export class AdminUserRecentActionDto {
  @ApiProperty({ example: 'USER_BASIC_UPDATED' })
  action!: string;

  @ApiProperty({ example: 'Actualización CRUD contextual' })
  reason!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ example: 1 })
  actorUserId!: number;
}

export class AdminUserDetailDto extends AdminUserDto {
  @ApiProperty({ type: AdminUserDetailLicenseDto, nullable: true, description: 'Licencia más reciente del usuario' })
  license!: AdminUserDetailLicenseDto | null;

  @ApiProperty({ type: [AdminUserRecentActionDto] })
  recentActions!: AdminUserRecentActionDto[];
}

export class AdminLicenseActionDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ example: 2 })
  userId!: number;

  @ApiProperty({ example: 1 })
  planId!: number;

  @ApiProperty({ enum: ['TRIAL', 'ACTIVE', 'GRACE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'] })
  state!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class AdminUserActionResultDto {
  @ApiProperty({ type: AdminUserDto, nullable: true, description: 'Usuario actualizado (acciones sobre la cuenta)' })
  user?: AdminUserDto | null;

  @ApiProperty({ example: true, nullable: true, type: Boolean, description: 'Acciones de contraseña' })
  success?: boolean | null;

  @ApiProperty({ nullable: true })
  userId?: number | null;

  @ApiProperty({ nullable: true })
  action?: string | null;

  @ApiProperty({ nullable: true, description: 'Solo RESET_PASSWORD: contraseña temporal generada' })
  newPassword?: string | null;

  @ApiProperty({ example: false, nullable: true, type: Boolean, description: 'Solo REVOKE_ALL_SESSIONS' })
  revoked?: boolean | null;

  @ApiProperty({ nullable: true, description: 'Solo REVOKE_ALL_SESSIONS' })
  strategy?: string | null;

  @ApiProperty({ type: AdminLicenseActionDto, nullable: true, description: 'Acciones sobre licencias' })
  license?: AdminLicenseActionDto | null;
}

export class AdminExpiringLicenseDto {
  @ApiProperty({ example: 5 })
  id!: number;

  @ApiProperty({ example: 2 })
  userId!: number;

  @ApiProperty({ example: 1 })
  planId!: number;

  @ApiProperty({ enum: ['TRIAL', 'ACTIVE', 'GRACE', 'EXPIRED', 'CANCELLED', 'SUSPENDED'] })
  state!: string;

  @ApiProperty({ format: 'date-time', nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ description: 'Usuario propietario', type: 'object', additionalProperties: true })
  user!: { id: number; name: string; email: string };

  @ApiProperty({ description: 'Plan de la licencia', type: 'object', additionalProperties: true })
  plan!: Record<string, unknown>;
}

export class AdminServiceMetricsDto {
  @ApiProperty({ example: 96 })
  activeCount!: number;

  @ApiProperty({ example: 7 })
  expiredCount!: number;

  @ApiProperty({ example: '+2', description: 'Delta formateado contra el período previo' })
  activeDelta!: string;

  @ApiProperty({ example: '-1', description: 'Delta formateado contra el período previo' })
  expiredDelta!: string;
}

export class AdminAuditLogDto {
  @ApiProperty({ example: 41 })
  id!: number;

  @ApiProperty({ example: 1 })
  actorUserId!: number;

  @ApiProperty({ example: 2, nullable: true, type: Number })
  targetUserId!: number | null;

  @ApiProperty({ example: 'USER_CREATE' })
  action!: string;

  @ApiProperty({ example: 'Alta de usuario desde consola admin', nullable: true, type: String })
  reason!: string | null;

  @ApiProperty({ nullable: true })
  metadata!: Record<string, unknown> | null;

  @ApiProperty({ nullable: true })
  previousValue!: Record<string, unknown> | null;

  @ApiProperty({ nullable: true })
  newValue!: Record<string, unknown> | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
