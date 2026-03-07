import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Crear monedas (compartidas entre todos los usuarios)
  const currencies = [
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'MEX', name: 'Peso Mexicano', symbol: 'MX$' },
    { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$' },
    { code: 'CUP', name: 'Peso Cubano', symbol: '$' },
    { code: 'MLC', name: 'Moneda Libremente Convertible', symbol: 'MLC' },
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: currency,
      create: currency,
    });
  }
  console.log('Currencies seeded');
  const cupCurrency = await prisma.currency.findUnique({ where: { code: 'CUP' } });

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cambios.com' },
    update: {
      role: 'ADMIN',
      isActive: true,
      isBanned: false,
      blockedUntil: null,
      failedLoginAttempts: 0,
      ...(cupCurrency ? { primaryCurrencyId: cupCurrency.id } : {}),
    },
    create: {
      email: 'admin@cambios.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true,
      ...(cupCurrency ? { primaryCurrencyId: cupCurrency.id } : {}),
    },
  });
  console.log('Admin user seeded (email: admin@cambios.com, password: admin123)');

  // Crear un usuario de prueba
  const testUserPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@cambios.com' },
    update: {
      role: 'USER',
      isActive: true,
      isBanned: false,
      blockedUntil: null,
      failedLoginAttempts: 0,
      ...(cupCurrency ? { primaryCurrencyId: cupCurrency.id } : {}),
    },
    create: {
      email: 'test@cambios.com',
      password: testUserPassword,
      name: 'Usuario Prueba',
      role: 'USER',
      isActive: true,
      ...(cupCurrency ? { primaryCurrencyId: cupCurrency.id } : {}),
    },
  });
  console.log('Test user seeded (email: test@cambios.com, password: test123)');

  const planCatalog = [
    {
      name: 'Licencia Estándar',
      description: 'Plan base para operación de usuarios finales',
      monthlyUsd: '15.00',
      semiannualUsd: '85.50',
      annualUsd: '162.00',
      isActive: true,
    },
    {
      name: 'Licencia Corporativa',
      description: 'Plan corporativo con soporte operativo',
      monthlyUsd: '15.00',
      semiannualUsd: '85.50',
      annualUsd: '162.00',
      isActive: true,
    },
  ];

  for (const planData of planCatalog) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: planData.name },
      select: { id: true },
    });

    if (existingPlan) {
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: planData,
      });
    } else {
      await prisma.plan.create({ data: planData });
    }
  }
  console.log('Plan catalog seeded (USD fixed pricing by cycle)');

  const defaultPlan = await prisma.plan.findFirst({
    where: { name: 'Licencia Estándar' },
    orderBy: { id: 'asc' },
  });

  if (!defaultPlan) {
    throw new Error('No se pudo crear/obtener el plan base para seed de licencias');
  }

  const now = new Date();
  const adminExpiresAt = new Date(now);
  adminExpiresAt.setMonth(adminExpiresAt.getMonth() + 12);
  const testExpiresAt = new Date(now);
  testExpiresAt.setMonth(testExpiresAt.getMonth() + 1);

  const ensureActiveLicense = async (userId: number, cycle: 'ANNUAL' | 'MONTHLY', expiresAt: Date) => {
    const existingActive = await prisma.userLicense.findFirst({
      where: { userId, state: 'ACTIVE' },
      orderBy: { expiresAt: 'desc' },
      select: { id: true, expiresAt: true },
    });

    if (existingActive) {
      await prisma.userLicense.update({
        where: { id: existingActive.id },
        data: {
          planId: defaultPlan.id,
          cycle,
          startedAt: now,
          expiresAt,
          graceUntil: null,
          cancelledAt: null,
          lastPaymentAt: now,
        },
      });
      return;
    }

    const newLicense = await prisma.userLicense.create({
      data: {
        userId,
        planId: defaultPlan.id,
        state: 'ACTIVE',
        cycle,
        startedAt: now,
        expiresAt,
        lastPaymentAt: now,
      },
    });

    await prisma.licenseEvent.create({
      data: {
        userLicenseId: newLicense.id,
        fromState: null,
        toState: 'ACTIVE',
        reason: 'Seed inicial de licencia activa',
      },
    });
  };

  await ensureActiveLicense(admin.id, 'ANNUAL', adminExpiresAt);
  await ensureActiveLicense(testUser.id, 'MONTHLY', testExpiresAt);
  console.log('Seeded active licenses for admin/test users');

  // Crear tasas de cambio para el admin
  const otherCurrencies = await prisma.currency.findMany({
    where: { code: { not: 'CUP' } },
  });

  for (const currency of otherCurrencies) {
    await prisma.exchangeRate.upsert({
      where: {
        userId_currencyId: {
          userId: admin.id,
          currencyId: currency.id,
        },
      },
      update: {
        referenceRate: currency.code === 'USD' ? 200 : 150,
        buyMargin: 0.05,
        sellMargin: 0.05,
      },
      create: {
        userId: admin.id,
        currencyId: currency.id,
        referenceRate: currency.code === 'USD' ? 200 : 150,
        buyMargin: 0.05,
        sellMargin: 0.05,
      },
    });
  }
  console.log('Exchange rates seeded for admin');

  // Crear saldos de caja para el admin
  const allCurrencies = await prisma.currency.findMany();
  for (const currency of allCurrencies) {
    await prisma.cashBalance.upsert({
      where: {
        userId_currencyId: {
          userId: admin.id,
          currencyId: currency.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        currencyId: currency.id,
        balance: 0,
      },
    });
  }
  console.log('Cash balances seeded for admin');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
