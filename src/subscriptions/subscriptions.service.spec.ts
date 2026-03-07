import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../database/prisma/prisma.service';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      plan: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Plan Base' }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }),
      },
      userLicense: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 20, state: 'ACTIVE' }),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      licenseEvent: {
        create: jest.fn().mockResolvedValue({}),
      },
      subscriptionPayment: {
        create: jest.fn().mockImplementation(({ data }: any) => data),
      },
      bankAccount: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get(PrismaService);
  });

  it('debería aceptar monto 15 para ciclo mensual', async () => {
    const result = await service.applyPaymentToLicense({
      userId: 1,
      planId: 1,
      cycle: 'MONTHLY',
      amountUsd: 15,
      exchangeRateUsed: 350,
    });

    expect(result.amountUsd).toBe(15);
    expect(result.amountCup).toBe(5250);
  });

  it('debería aceptar monto 85.50 para ciclo semestral', async () => {
    const result = await service.applyPaymentToLicense({
      userId: 1,
      planId: 1,
      cycle: 'SEMIANNUAL',
      amountUsd: 85.5,
      exchangeRateUsed: 350,
    });

    expect(result.amountUsd).toBe(85.5);
    expect(result.amountCup).toBe(29925);
  });

  it('debería aceptar monto 162 para ciclo anual', async () => {
    const result = await service.applyPaymentToLicense({
      userId: 1,
      planId: 1,
      cycle: 'ANNUAL',
      amountUsd: 162,
      exchangeRateUsed: 350,
    });

    expect(result.amountUsd).toBe(162);
    expect(result.amountCup).toBe(56700);
  });

  it('debería rechazar monto USD inválido por ciclo', async () => {
    await expect(
      service.applyPaymentToLicense({
        userId: 1,
        planId: 1,
        cycle: 'MONTHLY',
        amountUsd: 99,
        exchangeRateUsed: 350,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debería registrar pago y actualizar cuenta bancaria cuando viene bankAccountId', async () => {
    await service.registerPayment({
      userId: 1,
      planId: 1,
      cycle: 'MONTHLY',
      amountUsd: 15,
      exchangeRateUsed: 350,
      bankAccountId: 2,
    });

    expect(prisma.bankAccount.update).toHaveBeenCalled();
  });
});
