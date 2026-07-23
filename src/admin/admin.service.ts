import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LicenseState, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUserActionDto, AdminUserControlActionType } from './dto/admin-user-action.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

const DEFAULT_BLOCK_MINUTES = 30;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getKpis(dateFrom?: string, dateTo?: string, planId?: number) {
    const now = new Date();
    const from = dateFrom ? new Date(dateFrom) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const to = dateTo ? new Date(dateTo) : now;

    const totalUsers = await this.prisma.user.count();
    const suspendedUsers = await this.prisma.user.count({ where: { isBanned: true } });
    const newUsersPeriod = await this.prisma.user.count({
      where: { createdAt: { gte: from, lte: to } },
    });

    const licensesWhere = {
      ...(planId ? { planId } : {}),
    };

    const licenses = await this.prisma.userLicense.findMany({ where: licensesWhere });
    const licensesByState = licenses.reduce<Record<string, number>>((acc, license) => {
      acc[license.state] = (acc[license.state] ?? 0) + 1;
      return acc;
    }, {});

    const expiringIn7d = await this.prisma.userLicense.count({
      where: {
        ...licensesWhere,
        expiresAt: { gte: now, lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const expiringIn30d = await this.prisma.userLicense.count({
      where: {
        ...licensesWhere,
        expiresAt: { gte: now, lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
      },
    });

    const payments = await this.prisma.subscriptionPayment.findMany({
      where: { paidAt: { gte: from, lte: to } },
    });

    const mrrEstimateCup = payments.reduce((sum, p) => sum + Number(p.amountCup), 0);
    const arpuEstimateCup = totalUsers > 0 ? mrrEstimateCup / totalUsers : 0;

    // trialToPaidConversionPct: licencias que pasaron TRIAL -> ACTIVE en el
    // período (transition registrada en LicenseEvent) sobre total de TRIAL
    // iniciados en el período.
    const trialStartedInPeriod = licenses.filter(
      (l) => l.state === 'TRIAL' && l.startedAt >= from && l.startedAt <= to,
    ).length;
    const trialToActiveEvents = await this.prisma.licenseEvent.count({
      where: {
        fromState: 'TRIAL',
        toState: 'ACTIVE',
        createdAt: { gte: from, lte: to },
      },
    });
    const trialToPaidConversionPct =
      trialStartedInPeriod > 0
        ? Math.min(100, (trialToActiveEvents / trialStartedInPeriod) * 100)
        : 0;

    // renewalRatePct: % de licencias activas actualmente con al menos 1
    // pago registrado despues de la fecha de inicio (es decir, no estan en
    // trial puro). Sobre todas las licencias del scope.
    const activeLicenses = licenses.filter((l) => l.state === 'ACTIVE').length;
    const renewalsCount = licenses.filter(
      (l) => l.state === 'ACTIVE' && l.lastPaymentAt && l.lastPaymentAt > l.startedAt,
    ).length;
    const renewalRatePct =
      activeLicenses > 0 ? (renewalsCount / activeLicenses) * 100 : 0;

    // cancellationRatePct: % de licencias que pasaron a CANCELLED en el
    // período respecto al total de licencias registradas antes del fin del
    // período.
    const licensesRegisteredByTo = await this.prisma.userLicense.count({
      where: { startedAt: { lte: to }, ...(planId ? { planId } : {}) },
    });
    const cancelledEvents = await this.prisma.licenseEvent.count({
      where: { toState: 'CANCELLED', createdAt: { gte: from, lte: to } },
    });
    const cancellationRatePct =
      licensesRegisteredByTo > 0
        ? Math.min(100, (cancelledEvents / licensesRegisteredByTo) * 100)
        : 0;

    // reactivatedPeriod: licencias que pasaron a ACTIVE en el período
    // (LicenseEvent con toState=ACTIVE, desde cualquier estado previo).
    const reactivatedPeriod = await this.prisma.licenseEvent.count({
      where: { toState: 'ACTIVE', createdAt: { gte: from, lte: to } },
    });

    return {
      totalUsers,
      activeUsers30d: totalUsers - suspendedUsers,
      newUsersPeriod,
      suspendedUsers,
      licensesByState,
      expiringIn7d,
      expiringIn30d,
      mrrEstimateCup,
      arpuEstimateCup,
      revenueAtRiskCup: mrrEstimateCup * 0.2,
      churnPeriod: licensesByState.CANCELLED ?? 0,
      reactivatedPeriod,
      trialToPaidConversionPct: Number(trialToPaidConversionPct.toFixed(2)),
      renewalRatePct: Number(renewalRatePct.toFixed(2)),
      cancellationRatePct: Number(cancellationRatePct.toFixed(2)),
    };
  }

  /**
   * Series temporales de plataforma para el Admin Reports dashboard.
   * Devuelve 6 buckets (meses) con:
   * - billingCup: suma de SubscriptionPayment.amountCup de pagos en el mes
   * - newUsers: nuevos usuarios (User.createdAt) en el mes
   * - churn: LicenseEvent(toState=CANCELLED) en el mes
   *
   * El último bucket es el mes en curso.
   */
  async getPlatformSeries(monthsBack = 6) {
    const referenceDate = new Date();
    const buckets: Array<{
      label: string;
      year: number;
      month: number;
      start: Date;
      end: Date;
    }> = [];

    for (let i = monthsBack - 1; i >= 0; i -= 1) {
      const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
      const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i + 1, 0, 23, 59, 59, 999);
      buckets.push({
        label: start.toLocaleString('es', { month: 'short' }).toUpperCase(),
        year: start.getFullYear(),
        month: start.getMonth(),
        start,
        end,
      });
    }

    const bucketStart = buckets[0].start;
    const bucketEnd = buckets[buckets.length - 1].end;

    const [payments, users, churnEvents] = await Promise.all([
      this.prisma.subscriptionPayment.findMany({
        where: { paidAt: { gte: bucketStart, lte: bucketEnd } },
        select: { amountCup: true, paidAt: true },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: bucketStart, lte: bucketEnd } },
        select: { createdAt: true },
      }),
      this.prisma.licenseEvent.findMany({
        where: { toState: 'CANCELLED', createdAt: { gte: bucketStart, lte: bucketEnd } },
        select: { createdAt: true },
      }),
    ]);

    const series = buckets.map((bucket) => {
      const billing = payments
        .filter((p) => p.paidAt >= bucket.start && p.paidAt <= bucket.end)
        .reduce((sum, p) => sum + Number(p.amountCup), 0);

      const newUsers = users.filter(
        (u) => u.createdAt >= bucket.start && u.createdAt <= bucket.end,
      ).length;

      const churn = churnEvents.filter(
        (e) => e.createdAt >= bucket.start && e.createdAt <= bucket.end,
      ).length;

      return {
        label: bucket.label,
        year: bucket.year,
        month: bucket.month,
        billingCup: Number(billing.toFixed(2)),
        newUsers,
        churn,
      };
    });

    return {
      monthsBack,
      series,
      totals: {
        billingCup: series.reduce((sum, s) => sum + s.billingCup, 0),
        newUsers: series.reduce((sum, s) => sum + s.newUsers, 0),
        churn: series.reduce((sum, s) => sum + s.churn, 0),
      },
    };
  }

  /**
   * Get admin profile statistics - simplified stats for admin dashboard
   * Returns: totalUsers, activeUsers, blockedUsers, expiringLicenses, dailyRevenue, activeLicenses
   */
  async getProfileStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Total users count
    const totalUsers = await this.prisma.user.count();

    // Active users (not banned)
    const activeUsers = await this.prisma.user.count({
      where: { isBanned: false },
    });

    // Blocked users
    const blockedUsers = await this.prisma.user.count({
      where: {
        OR: [
          { isBanned: true },
          { blockedUntil: { gt: now } },
        ],
      },
    });

    // Expiring licenses (next 7 days)
    const expiringLicenses = await this.prisma.userLicense.count({
      where: {
        state: 'ACTIVE',
        expiresAt: {
          gte: now,
          lt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Active licenses
    const activeLicenses = await this.prisma.userLicense.count({
      where: { state: 'ACTIVE' },
    });

    // Daily revenue (today's payments)
    const dailyPayments = await this.prisma.subscriptionPayment.findMany({
      where: {
        paidAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    const dailyRevenue = dailyPayments.reduce((sum, p) => sum + Number(p.amountCup), 0);

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      expiringLicenses,
      dailyRevenue,
      activeLicenses,
    };
  }

  getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        blockedUntil: true,
        isBanned: true,
        bannedUntil: true,
        failedLoginAttempts: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUserFromAdminConsole(actorUserId: number, dto: CreateAdminUserDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const temporaryPassword = `tmp-${Math.random().toString(36).slice(-10)}A1!`;
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail,
        role: dto.role,
        password: hashedPassword,
        isActive: dto.access?.isActive ?? true,
        isBanned: false,
        blockedUntil: null,
        failedLoginAttempts: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isBanned: true,
        blockedUntil: true,
        failedLoginAttempts: true,
        createdAt: true,
      },
    });

    const hasExtendedCapture = Boolean(
      dto.profile || dto.contact || dto.access || dto.security || dto.preferences || dto.licenseSetup,
    );

    const extendedCapture = JSON.parse(
      JSON.stringify({
        profile: dto.profile ?? null,
        contact: dto.contact ?? null,
        access: dto.access ?? null,
        security: dto.security ?? null,
        preferences: dto.preferences ?? null,
        licenseSetup: dto.licenseSetup ?? null,
      }),
    ) as Prisma.InputJsonValue;

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId,
        targetUserId: createdUser.id,
        action: 'USER_CREATE',
        reason: 'Alta de usuario desde consola admin',
        metadata: {
          source: 'admin-user-management-console',
          requiresPasswordRotation: dto.access?.forcePasswordChangeOnFirstLogin ?? true,
          inviteDispatchRequested: dto.access?.sendInviteEmail ?? false,
          hasExtendedCapture,
          extendedCapture,
        },
        newValue: {
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
          isActive: createdUser.isActive,
        },
      },
    });

    return createdUser;
  }

  async getUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isBanned: true,
        blockedUntil: true,
        failedLoginAttempts: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const license = await this.prisma.userLicense.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        state: true,
        expiresAt: true,
        planId: true,
      },
    });

    const recentActions = await this.prisma.adminAuditLog.findMany({
      where: { targetUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        action: true,
        reason: true,
        createdAt: true,
        actorUserId: true,
      },
    });

    return {
      ...user,
      license,
      recentActions,
    };
  }

  async updateUserBasic(userId: number, actorUserId: number, dto: UpdateAdminUserDto) {
    const current = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!current) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const payload: Prisma.UserUpdateInput = {};
    if (typeof dto.name !== 'undefined') payload.name = dto.name;
    if (typeof dto.email !== 'undefined') payload.email = dto.email;
    if (typeof dto.isActive !== 'undefined') payload.isActive = dto.isActive;

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException('Debe enviar al menos un campo actualizable');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isBanned: true,
        blockedUntil: true,
        failedLoginAttempts: true,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId,
        targetUserId: userId,
        action: 'USER_BASIC_UPDATED',
        reason: 'Actualización CRUD contextual',
        previousValue: {
          email: current.email,
          name: current.name,
          isActive: current.isActive,
        },
        newValue: {
          email: updated.email,
          name: updated.name,
          isActive: updated.isActive,
        },
      },
    });

    return updated;
  }

  private assertSensitiveAction(actionType: AdminUserControlActionType) {
    return [
      AdminUserControlActionType.FORCE_PASSWORD_RESET,
      AdminUserControlActionType.REVOKE_ALL_SESSIONS,
      AdminUserControlActionType.CHANGE_ROLE,
      AdminUserControlActionType.SUSPEND_ACCOUNT,
    ].includes(actionType);
  }

  private async createActionAudit(params: {
    actorUserId: number;
    targetUserId: number;
    action: AdminUserControlActionType;
    reason: string;
    previousValue?: Prisma.InputJsonValue;
    newValue?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
  }) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: params.actorUserId,
        targetUserId: params.targetUserId,
        action: params.action,
        reason: params.reason,
        previousValue: params.previousValue,
        newValue: params.newValue,
        metadata: params.metadata,
      },
    });
  }

  async applyUserControlAction(userId: number, actorUserId: number, dto: AdminUserActionDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (this.assertSensitiveAction(dto.actionType) && !dto.reason?.trim()) {
      throw new BadRequestException('El motivo es obligatorio para acciones sensibles');
    }

    const now = new Date();

    switch (dto.actionType) {
      case AdminUserControlActionType.TEMP_BLOCK: {
        const blockUntil = dto.payload?.blockUntil
          ? new Date(dto.payload.blockUntil)
          : new Date(now.getTime() + DEFAULT_BLOCK_MINUTES * 60 * 1000);

        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: {
            blockedUntil: blockUntil,
            failedLoginAttempts: 0,
          },
        });

        await this.createActionAudit({
          actorUserId,
          targetUserId: userId,
          action: dto.actionType,
          reason: dto.reason,
          previousValue: { blockedUntil: user.blockedUntil },
          newValue: { blockedUntil: updated.blockedUntil },
        });

        return updated;
      }

      case AdminUserControlActionType.UNBLOCK: {
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: {
            blockedUntil: null,
            failedLoginAttempts: 0,
          },
        });

        await this.createActionAudit({
          actorUserId,
          targetUserId: userId,
          action: dto.actionType,
          reason: dto.reason,
          previousValue: { blockedUntil: user.blockedUntil },
          newValue: { blockedUntil: null },
        });

        return updated;
      }

      case AdminUserControlActionType.SUSPEND_ACCOUNT: {
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        });

        await this.createActionAudit({
          actorUserId,
          targetUserId: userId,
          action: dto.actionType,
          reason: dto.reason,
          previousValue: { isActive: user.isActive },
          newValue: { isActive: false },
        });

        return updated;
      }

      case AdminUserControlActionType.REACTIVATE_ACCOUNT: {
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: {
            isActive: true,
            isBanned: false,
            blockedUntil: null,
          },
        });

        await this.createActionAudit({
          actorUserId,
          targetUserId: userId,
          action: dto.actionType,
          reason: dto.reason,
          previousValue: { isActive: user.isActive, isBanned: user.isBanned },
          newValue: { isActive: true, isBanned: false },
        });

        return updated;
      }

      case AdminUserControlActionType.FORCE_PASSWORD_RESET:
      case AdminUserControlActionType.RESET_PASSWORD: {
          const newPassword = dto.payload?.newPassword;
          if (dto.actionType === AdminUserControlActionType.RESET_PASSWORD && !newPassword) {
            throw new BadRequestException('newPassword es requerido para RESET_PASSWORD');
          }

          const passwordToUse = newPassword || `tmp-${Math.random().toString(36).slice(-10)}A1!`;
          const bcrypt = await import('bcrypt');
          const hashedPassword = await bcrypt.hash(passwordToUse, 10);

         await this.prisma.user.update({
           where: { id: userId },
           data: {
             password: hashedPassword,
             failedLoginAttempts: 0,
             blockedUntil: null,
             mustChangePassword: true, // Forzar cambio de contraseña en próximo login
           },
         });

          await this.createActionAudit({
            actorUserId,
            targetUserId: userId,
            action: dto.actionType,
            reason: dto.reason,
            metadata: { passwordReset: true, mustChangePassword: true },
          });

          const user = await this.prisma.user.findUnique({ where: { id: userId } });
          if (user?.email) {
            await this.notificationsService.notifyAdminPasswordReset(
              userId,
              'Su contraseña ha sido cambiada por motivos de seguridad',
            );
          }

          return {
            success: true,
            userId,
            action: dto.actionType,
            newPassword: dto.actionType === AdminUserControlActionType.RESET_PASSWORD ? passwordToUse : undefined,
          };
        }

      case AdminUserControlActionType.REVOKE_ALL_SESSIONS: {
        const revokeResult = await this.authService.revokeAllSessions(userId);

        await this.createActionAudit({
          actorUserId,
          targetUserId: userId,
          action: dto.actionType,
          reason: dto.reason,
          metadata: revokeResult as Prisma.InputJsonValue,
        });

        return revokeResult;
      }

      case AdminUserControlActionType.CHANGE_ROLE: {
        const newRole = dto.payload?.newRole;
        if (!newRole || !Object.values(Role).includes(newRole)) {
          throw new BadRequestException('newRole es requerido para CHANGE_ROLE');
        }

        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: { role: newRole },
        });

        await this.createActionAudit({
          actorUserId,
          targetUserId: userId,
          action: dto.actionType,
          reason: dto.reason,
          previousValue: { role: user.role },
          newValue: { role: updated.role },
        });

        return updated;
      }

      case AdminUserControlActionType.SUSPEND_LICENSE: {
        const license = await this.prisma.userLicense.findFirst({
          where: { id: dto.payload?.licenseId, userId },
          orderBy: { updatedAt: 'desc' },
        });
        if (!license) {
          throw new NotFoundException('Licencia no encontrada para suspender');
        }

        const updated = await this.prisma.userLicense.update({
          where: { id: license.id },
          data: { state: LicenseState.SUSPENDED },
        });

        await this.createActionAudit({
          actorUserId,
          targetUserId: userId,
          action: dto.actionType,
          reason: dto.reason,
          previousValue: { licenseState: license.state },
          newValue: { licenseState: updated.state },
          metadata: { licenseId: license.id },
        });

        return updated;
      }

      case AdminUserControlActionType.EXTEND_LICENSE: {
        const extendDays = dto.payload?.extendDays ?? 30;
        const license = await this.prisma.userLicense.findFirst({
          where: { id: dto.payload?.licenseId, userId },
          orderBy: { updatedAt: 'desc' },
        });
        if (!license) {
          throw new NotFoundException('Licencia no encontrada para extender');
        }

        const baseDate = license.expiresAt > now ? license.expiresAt : now;
        const expiresAt = new Date(baseDate.getTime() + extendDays * 24 * 60 * 60 * 1000);

        const updated = await this.prisma.userLicense.update({
          where: { id: license.id },
          data: {
            expiresAt,
            state: license.state === LicenseState.SUSPENDED ? LicenseState.ACTIVE : license.state,
          },
        });

        await this.createActionAudit({
          actorUserId,
          targetUserId: userId,
          action: dto.actionType,
          reason: dto.reason,
          previousValue: { expiresAt: license.expiresAt.toISOString() },
          newValue: { expiresAt: updated.expiresAt.toISOString() },
          metadata: { licenseId: license.id, extendDays },
        });

        return updated;
      }

      default:
        throw new BadRequestException('Acción de control no soportada');
    }
  }

  getBlockedUsers() {
    const now = new Date();
    return this.prisma.user.findMany({
      where: {
        OR: [{ isBanned: true }, { blockedUntil: { gt: now } }],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  getExpiringLicenses(windowDays: number) {
    const now = new Date();
    const to = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

    return this.prisma.userLicense.findMany({
      where: {
        expiresAt: { gte: now, lte: to },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        plan: true,
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  getAuditLogs() {
    return this.prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async getServiceMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period: last 30 days
    const currentPeriodStart = thirtyDaysAgo;
    const currentPeriodEnd = now;

    // Previous period: 30-60 days ago
    const previousPeriodStart = sixtyDaysAgo;
    const previousPeriodEnd = thirtyDaysAgo;

    // ACTIVE/TRIAL use their contractual expiry. GRACE remains usable only
    // while its explicit grace window is still open.
    const activeLicenseStates = [LicenseState.ACTIVE, LicenseState.TRIAL, LicenseState.GRACE];
    const totalActive = await this.prisma.userLicense.count({
      where: {
        OR: [
          {
            state: { in: [LicenseState.ACTIVE, LicenseState.TRIAL] },
            expiresAt: { gt: now },
          },
          {
            state: LicenseState.GRACE,
            graceUntil: { gt: now },
          },
        ],
      },
    });

    // Count expired licenses currently
    const expiredLicensesCurrent = await this.prisma.userLicense.count({
      where: {
        OR: [
          { state: { in: [LicenseState.EXPIRED, LicenseState.CANCELLED, LicenseState.SUSPENDED] } },
          {
            state: LicenseState.ACTIVE,
            expiresAt: { lt: now },
          },
        ],
      },
    });

    // Count active licenses in previous period (30-60 days ago)
    const activeLicensesPrevious = await this.prisma.userLicense.count({
      where: {
        state: { in: activeLicenseStates },
        startedAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
      },
    });

    // Count expired licenses in previous period
    const expiredLicensesPrevious = await this.prisma.userLicense.count({
      where: {
        OR: [
          { 
            state: { in: [LicenseState.EXPIRED, LicenseState.CANCELLED, LicenseState.SUSPENDED] },
            updatedAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
          },
          {
            state: LicenseState.ACTIVE,
            expiresAt: { gte: previousPeriodStart, lt: previousPeriodEnd },
          },
        ],
      },
    });

    // Calculate deltas
    const activeDelta = this.calculateDelta(totalActive, activeLicensesPrevious);
    const expiredDelta = this.calculateDelta(expiredLicensesCurrent, expiredLicensesPrevious);

    return {
      activeCount: totalActive,
      expiredCount: expiredLicensesCurrent,
      activeDelta,
      expiredDelta,
    };
  }

  private calculateDelta(current: number, previous: number): string {
    if (previous === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    const delta = ((current - previous) / previous) * 100;
    if (delta === 0) {
      return '0%';
    }
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${Math.round(delta)}%`;
  }
}
