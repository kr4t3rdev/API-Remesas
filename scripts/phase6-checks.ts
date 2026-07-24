import { PrismaClient, Role } from '@prisma/client';
import { NotificationsService } from '../src/notifications/notifications.service';
import { PushNotificationsService } from '../src/notifications/push-notifications.service';
import { SubscriptionsService } from '../src/subscriptions/subscriptions.service';
import { AdminService } from '../src/admin/admin.service';
import { EmailService } from '../src/email/email.service';

const prisma = new PrismaClient();

// Mock EmailService for script execution
const mockEmailService = {
  sendEmail: async () => ({ success: true, messageId: 'mock' }),
} as unknown as EmailService;

// Mock PushNotificationsService for script execution
const mockPushNotificationsService = {
  upsertDevice: async () => ({ id: 0, userId: 0, pushToken: '', platform: '' }),
  sendPushToUser: async () => undefined,
} as unknown as PushNotificationsService;

async function main() {
  const notificationsService = new NotificationsService(prisma as any, mockEmailService, mockPushNotificationsService);
  const subscriptionsService = new SubscriptionsService(prisma as any);
  const authServiceMock = {
    revokeAllSessions: async () => ({
      revoked: false,
      strategy: 'STATELESS_JWT_NO_SESSION_STORE',
    }),
  };
  const adminService = new AdminService(
    prisma as any,
    authServiceMock as any,
    notificationsService as any,
  );

  const now = new Date();
  const probeEmail = `phase6.probe.${Date.now()}@cambios.com`;

  const probeUser = await prisma.user.create({
    data: {
      email: probeEmail,
      password: 'seeded-password-hash-placeholder',
      name: 'Phase6 Probe User',
      role: Role.USER,
      isActive: true,
    },
  });

  await notificationsService.notifyNewUserRegistered(probeUser.id, probeUser.email);
  await notificationsService.notifyUserTemporarilyBlocked(
    probeUser.id,
    new Date(now.getTime() + 30 * 60 * 1000),
    5,
  );
  await notificationsService.notifyUserBanned(probeUser.id, 'Bloqueo de prueba operacional', null);

  const notificationRows = await prisma.notification.findMany({
    where: {
      userId: probeUser.id,
      type: { in: ['NEW_USER_REGISTERED', 'USER_TEMP_BLOCKED', 'USER_BANNED'] },
    },
    select: { type: true, channel: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const groupedNotifications = notificationRows.reduce<Record<string, string[]>>((acc, item) => {
    const key = item.type;
    acc[key] = acc[key] ?? [];
    acc[key].push(item.channel);
    return acc;
  }, {});

  const standardPlan = await prisma.plan.findFirst({ where: { name: 'Licencia Estándar' } });
  if (!standardPlan) {
    throw new Error('No existe plan "Licencia Estándar" para pruebas de fase 6');
  }

  const testUser = await prisma.user.findUnique({ where: { email: 'test@cambios.com' } });
  if (!testUser) {
    throw new Error('No existe usuario test@cambios.com para pruebas de fase 6');
  }

  const testLicense = await prisma.userLicense.findFirst({
    where: { userId: testUser.id },
    orderBy: { updatedAt: 'desc' },
  });
  if (!testLicense) {
    throw new Error('No existe licencia para test@cambios.com');
  }

  await prisma.userLicense.update({
    where: { id: testLicense.id },
    data: {
      state: 'ACTIVE',
      expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  const user30Email = `phase6.window30.${Date.now()}@cambios.com`;
  const user30 = await prisma.user.create({
    data: {
      email: user30Email,
      password: 'seeded-password-hash-placeholder',
      name: 'Phase6 Window30 User',
      role: Role.USER,
      isActive: true,
    },
  });

  await prisma.userLicense.create({
    data: {
      userId: user30.id,
      planId: standardPlan.id,
      state: 'ACTIVE',
      cycle: 'MONTHLY',
      startedAt: now,
      expiresAt: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
    },
  });

  const churnEmail = `phase6.churn.${Date.now()}@cambios.com`;
  const churnUser = await prisma.user.create({
    data: {
      email: churnEmail,
      password: 'seeded-password-hash-placeholder',
      name: 'Phase6 Churn User',
      role: Role.USER,
      isActive: true,
    },
  });

  await prisma.userLicense.create({
    data: {
      userId: churnUser.id,
      planId: standardPlan.id,
      state: 'CANCELLED',
      cycle: 'MONTHLY',
      startedAt: now,
      expiresAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      cancelledAt: now,
    },
  });

  await subscriptionsService.applyPaymentToLicense({
    userId: testUser.id,
    planId: standardPlan.id,
    cycle: 'MONTHLY',
    amountUsd: 15,
    exchangeRateUsed: 380,
    notes: 'Phase6 KPI renewal probe',
  });

  const kpis = await adminService.getKpis();
  const expiring7 = await adminService.getExpiringLicenses(7);
  const expiring30 = await adminService.getExpiringLicenses(30);

  const result = {
    timestamp: new Date().toISOString(),
    notifications: {
      rows: notificationRows.length,
      groupedByType: groupedNotifications,
      expectedChannelsPerType: ['IN_APP', 'WEBHOOK', 'EMAIL'],
    },
    metrics: {
      expiring7Count: expiring7.length,
      expiring30Count: expiring30.length,
      churnPeriod: kpis.churnPeriod,
      reactivatedPeriod: kpis.reactivatedPeriod,
      mrrEstimateCup: kpis.mrrEstimateCup,
      arpuEstimateCup: kpis.arpuEstimateCup,
      trialToPaidConversionPct: kpis.trialToPaidConversionPct,
      renewalRatePct: kpis.renewalRatePct,
      cancellationRatePct: kpis.cancellationRatePct,
    },
    caveat:
      'trialToPaidConversionPct, renewalRatePct y cancellationRatePct permanecen en 0 porque AdminService actual los devuelve hardcodeados.',
  };

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
