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

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cambios.com' },
    update: {},
    create: {
      email: 'admin@cambios.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log('Admin user seeded (email: admin@cambios.com, password: admin123)');

  // Crear un usuario de prueba
  const testUserPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@cambios.com' },
    update: {},
    create: {
      email: 'test@cambios.com',
      password: testUserPassword,
      name: 'Usuario Prueba',
      role: 'USER',
    },
  });
  console.log('Test user seeded (email: test@cambios.com, password: test123)');

  // Crear tasas de cambio para el admin
  const otherCurrencies = await prisma.currency.findMany({
    where: { code: { not: 'CUP' } },
  });

  for (const currency of otherCurrencies) {
    await prisma.exchangeRate.create({
      data: {
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
    await prisma.cashBalance.create({
      data: {
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
