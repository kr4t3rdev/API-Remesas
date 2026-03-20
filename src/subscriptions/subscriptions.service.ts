import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BillingCycle, LicenseState } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';

const CYCLE_DAYS: Record<BillingCycle, number> = {
  MONTHLY: 30,
  SEMIANNUAL: 180,
  ANNUAL: 365,
};

const CYCLE_USD: Record<BillingCycle, number> = {
  MONTHLY: 15,
  SEMIANNUAL: 85.5,
  ANNUAL: 162,
};

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private async assertPlanExists(planId: number) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan no encontrado');
    return plan;
  }

  private async logEvent(userLicenseId: number, toState: LicenseState, fromState?: LicenseState, reason?: string) {
    await this.prisma.licenseEvent.create({
      data: { userLicenseId, fromState, toState, reason },
    });
  }

  listLicenses(userId?: number) {
    return this.prisma.userLicense.findMany({
      where: userId ? { userId } : undefined,
      include: { plan: true, user: { select: { id: true, email: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getLicense(id: number) {
    const license = await this.prisma.userLicense.findUnique({
      where: { id },
      include: { plan: true, user: { select: { id: true, email: true, name: true } } },
    });
    if (!license) throw new NotFoundException('Licencia no encontrada');
    return license;
  }

  async assignLicense(input: { userId: number; planId: number; cycle: BillingCycle; state?: LicenseState; expiresAt?: Date; reason?: string }) {
    await this.assertPlanExists(input.planId);
    const user = await this.prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const now = new Date();
    const expiresAt = input.expiresAt ?? this.addDays(now, CYCLE_DAYS[input.cycle]);

    const license = await this.prisma.userLicense.create({
      data: {
        userId: input.userId,
        planId: input.planId,
        cycle: input.cycle,
        state: input.state ?? 'ACTIVE',
        startedAt: now,
        expiresAt,
      },
    });

    await this.logEvent(license.id, license.state, undefined, input.reason ?? 'Asignación de licencia');

    return license;
  }

  async renewLicense(userLicenseId: number, input: { planId: number; cycle: BillingCycle }) {
    const license = await this.prisma.userLicense.findUnique({ where: { id: userLicenseId } });
    if (!license) throw new NotFoundException('Licencia no encontrada');

    await this.assertPlanExists(input.planId);

    const baseDate = license.expiresAt > new Date() ? license.expiresAt : new Date();
    const expiresAt = this.addDays(baseDate, CYCLE_DAYS[input.cycle]);

    const updated = await this.prisma.userLicense.update({
      where: { id: userLicenseId },
      data: {
        planId: input.planId,
        cycle: input.cycle,
        state: 'ACTIVE',
        expiresAt,
        lastPaymentAt: new Date(),
      },
    });

    await this.logEvent(userLicenseId, 'ACTIVE', license.state, 'Renovación de licencia');

    return updated;
  }

  async suspendLicense(userLicenseId: number, reason?: string) {
    const license = await this.prisma.userLicense.findUnique({ where: { id: userLicenseId } });
    if (!license) throw new NotFoundException('Licencia no encontrada');

    const updated = await this.prisma.userLicense.update({
      where: { id: userLicenseId },
      data: { state: 'SUSPENDED' },
    });

    await this.logEvent(userLicenseId, 'SUSPENDED', license.state, reason ?? 'Suspensión manual');
    return updated;
  }

  async reactivateLicense(userLicenseId: number, reason?: string) {
    const license = await this.prisma.userLicense.findUnique({ where: { id: userLicenseId } });
    if (!license) throw new NotFoundException('Licencia no encontrada');

    const updated = await this.prisma.userLicense.update({
      where: { id: userLicenseId },
      data: { state: 'ACTIVE' },
    });

    await this.logEvent(userLicenseId, 'ACTIVE', license.state, reason ?? 'Reactivación manual');
    return updated;
  }

  async applyPaymentToLicense(input: {
    userId: number;
    userLicenseId?: number;
    planId: number;
    cycle: BillingCycle;
    amountUsd: number;
    exchangeRateUsed: number;
    paidAt?: Date;
    notes?: string;
  }) {
    const expectedAmount = CYCLE_USD[input.cycle];
    if (Number(input.amountUsd.toFixed(2)) !== expectedAmount) {
      throw new BadRequestException(`Monto USD inválido para ${input.cycle}. Esperado: ${expectedAmount}`);
    }

    if (input.exchangeRateUsed <= 0) {
      throw new BadRequestException('La tasa de cambio debe ser mayor que 0');
    }

    const now = input.paidAt ?? new Date();
    const amountCup = input.amountUsd * input.exchangeRateUsed;

    let userLicenseId = input.userLicenseId;

    if (!userLicenseId) {
      const latest = await this.prisma.userLicense.findFirst({
        where: { userId: input.userId },
        orderBy: { updatedAt: 'desc' },
      });

      if (latest) {
        userLicenseId = latest.id;
      }
    }

    if (userLicenseId) {
      await this.renewLicense(userLicenseId, { planId: input.planId, cycle: input.cycle });
    } else {
      const created = await this.assignLicense({
        userId: input.userId,
        planId: input.planId,
        cycle: input.cycle,
        state: 'ACTIVE',
        reason: 'Activación por pago',
      });
      userLicenseId = created.id;
    }

    const payment = await this.prisma.subscriptionPayment.create({
      data: {
        userId: input.userId,
        userLicenseId,
        planId: input.planId,
        cycle: input.cycle,
        amountUsd: input.amountUsd,
        exchangeRateUsed: input.exchangeRateUsed,
        amountCup,
        paidAt: now,
        notes: input.notes,
      },
    });

    return payment;
  }

  async registerPayment(input: {
    userId: number;
    userLicenseId?: number;
    planId: number;
    cycle: BillingCycle;
    amountUsd: number;
    exchangeRateUsed: number;
    bankAccountId?: number;
    paidAt?: Date;
    notes?: string;
  }) {
    const payment = await this.applyPaymentToLicense(input);

    if (input.bankAccountId) {
      await this.prisma.bankAccount.update({
        where: { id: input.bankAccountId },
        data: {
          balance: { increment: payment.amountCup },
        },
      });
    }

    return payment;
  }
}
