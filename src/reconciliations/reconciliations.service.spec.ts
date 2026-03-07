import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { ReconciliationsService } from './reconciliations.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { WebhookService } from '../webhook/webhook.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

describe('ReconciliationsService', () => {
  let service: ReconciliationsService;
  let prismaService: any;
  let webhookService: any;
  let subscriptionsService: any;

  beforeEach(async () => {
    const mockPrisma: any = {
      transaction: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      bankAccount: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      incomeReconciliation: {
        create: jest.fn(),
      },
      currency: {
        findUnique: jest.fn(),
      },
      rateHistory: {
        create: jest.fn(),
      },
      $transaction: jest.fn((callback: any) => callback(mockPrisma)),
    };

    const mockWebhookService = {
      sendTransactionStatus: jest.fn(),
    };
    const mockSubscriptionsService = {
      applyPaymentToLicense: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReconciliationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WebhookService, useValue: mockWebhookService },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
      ],
    }).compile();

    service = module.get<ReconciliationsService>(ReconciliationsService);
    prismaService = module.get(PrismaService);
    webhookService = module.get(WebhookService);
    subscriptionsService = module.get(SubscriptionsService);
  });

  describe('reconcileIncomeBulk', () => {
    const userId = 1;

    const mockBankAccount: any = {
      id: 1,
      userId: 1,
      name: 'Cuenta Principal',
      currencyId: 1,
      balance: new Decimal(50000),
      isActive: true,
      currency: { id: 1, code: 'USD' },
    };

    const mockTransactions: any = [
      {
        id: 1,
        userId: 1,
        type: 'VENTA',
        currencyId: 1,
        amount: new Decimal(100),
        rate: new Decimal(180),
        totalCup: new Decimal(18000),
        status: 'PENDIENTE',
        currency: { id: 1, code: 'USD' },
      },
      {
        id: 2,
        userId: 1,
        type: 'VENTA',
        currencyId: 1,
        amount: new Decimal(50),
        rate: new Decimal(180),
        totalCup: new Decimal(9000),
        status: 'PENDIENTE',
        currency: { id: 1, code: 'USD' },
      },
    ];

    it('debería reconciliar múltiples transacciones exitosamente', async () => {
      prismaService.bankAccount.findFirst.mockResolvedValue(mockBankAccount);
      prismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      prismaService.incomeReconciliation.create
        .mockResolvedValueOnce({
          id: 1,
          transactionId: 1,
          bankAccountId: 1,
          transaction: mockTransactions[0],
        })
        .mockResolvedValueOnce({
          id: 2,
          transactionId: 2,
          bankAccountId: 1,
          transaction: mockTransactions[1],
        });

      prismaService.transaction.update.mockResolvedValue({});
      prismaService.bankAccount.update.mockResolvedValue({});
      prismaService.rateHistory.create.mockResolvedValue({});

      const dto = {
        transactionIds: [1, 2],
        bankAccountId: 1,
      };

      const result = await service.reconcileIncomeBulk(dto, userId);

      expect(result).toHaveLength(2);
      expect(prismaService.transaction.update).toHaveBeenCalledTimes(2);
      expect(prismaService.bankAccount.update).toHaveBeenCalledTimes(1);
      expect(webhookService.sendTransactionStatus).toHaveBeenCalledTimes(2);
    });

    it('debería lanzar error si una transacción ya está reconciliada', async () => {
      const alreadyReconciliated = [
        ...mockTransactions,
        { ...mockTransactions[0], id: 3, status: 'RECONCILIADO' },
      ];

      prismaService.bankAccount.findFirst.mockResolvedValue(mockBankAccount);
      prismaService.transaction.findMany.mockResolvedValue(alreadyReconciliated);

      const dto = {
        transactionIds: [1, 2, 3],
        bankAccountId: 1,
      };

      await expect(service.reconcileIncomeBulk(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar error si el balance es insuficiente', async () => {
      const lowBalanceAccount = {
        ...mockBankAccount,
        balance: new Decimal(1000),
      };

      prismaService.bankAccount.findFirst.mockResolvedValue(lowBalanceAccount);
      prismaService.transaction.findMany.mockResolvedValue(mockTransactions);

      const dto = {
        transactionIds: [1, 2],
        bankAccountId: 1,
      };

      await expect(service.reconcileIncomeBulk(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar error si la cuenta bancaria no existe', async () => {
      prismaService.bankAccount.findFirst.mockResolvedValue(null);

      const dto = {
        transactionIds: [1, 2],
        bankAccountId: 999,
      };

      await expect(service.reconcileIncomeBulk(dto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería requerir customRates para moneda diferente', async () => {
      const differentCurrencyTransaction = {
        ...mockTransactions[0],
        currencyId: 2,
        currency: { id: 2, code: 'EUR' },
      };

      const accountWithDifferentCurrency = {
        ...mockBankAccount,
        currencyId: 1,
      };

      prismaService.bankAccount.findFirst.mockResolvedValue(accountWithDifferentCurrency);
      prismaService.transaction.findMany.mockResolvedValue([differentCurrencyTransaction]);

      const dto = {
        transactionIds: [1],
        bankAccountId: 1,
      };

      await expect(service.reconcileIncomeBulk(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('reconcileIncome', () => {
    it('debería aplicar pago a licencia cuando vienen datos de suscripción', async () => {
      const userId = 1;
      const transaction: any = {
        id: 1,
        userId,
        status: 'PENDIENTE',
        currencyId: 1,
        amount: new Decimal(100),
        totalCup: new Decimal(18000),
        currency: { id: 1, code: 'USD' },
      };
      const bankAccount: any = {
        id: 2,
        userId,
        isActive: true,
        currencyId: 1,
        currency: { id: 1, code: 'USD' },
      };
      const reconciliation: any = {
        id: 10,
        transaction,
        bankAccount,
      };

      prismaService.transaction.findFirst.mockResolvedValue(transaction);
      prismaService.bankAccount.findFirst.mockResolvedValue(bankAccount);
      prismaService.incomeReconciliation.create.mockResolvedValue(reconciliation);
      prismaService.transaction.update.mockResolvedValue({});
      prismaService.bankAccount.update.mockResolvedValue({});

      const dto: any = {
        transactionId: 1,
        bankAccountId: 2,
        amount: 100,
        planId: 1,
        billingCycle: 'MONTHLY',
        amountUsd: 15,
        exchangeRateUsed: 350,
      };

      await service.reconcileIncome(dto, userId);

      expect(subscriptionsService.applyPaymentToLicense).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          planId: 1,
          cycle: 'MONTHLY',
          amountUsd: 15,
          exchangeRateUsed: 350,
        }),
      );
    });
  });
});
