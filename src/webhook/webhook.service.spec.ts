import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from './webhook.service';

global.fetch = jest.fn() as jest.Mock;

describe('WebhookService', () => {
  let service: WebhookService;
  let mockFetch: jest.Mock;

  beforeEach(async () => {
    mockFetch = jest.fn();
    (global.fetch as jest.Mock) = mockFetch;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendTransactionStatus', () => {
    const payload = {
      transactionId: 1,
      previousStatus: 'PENDIENTE' as const,
      newStatus: 'RECONCILIADO' as const,
      userId: 1,
      amount: '100',
      currency: 'USD',
      totalCup: '18000',
      reconciledAt: '2024-01-01T00:00:00.000Z',
      bankAccountId: 1,
    };

    it('debería enviar webhook a todas las URLs configuradas', async () => {
      const configService = service['configService'] as jest.Mocked<ConfigService>;
      configService.get.mockReturnValue('https://webhook1.com,https://webhook2.com');

      mockFetch.mockResolvedValue({ ok: true, status: 200 });

      await service.sendTransactionStatus(payload);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://webhook1.com',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        'https://webhook2.com',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      );
    });

    it('debería omitir webhook si WEBHOOK_URLS no está configurado', async () => {
      const configService = service['configService'] as jest.Mocked<ConfigService>;
      configService.get.mockReturnValue(undefined);

      await service.sendTransactionStatus(payload);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('debería omitir webhook si no hay URLs válidas', async () => {
      const configService = service['configService'] as jest.Mocked<ConfigService>;
      configService.get.mockReturnValue('');

      await service.sendTransactionStatus(payload);

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('debería continuar si un webhook falla', async () => {
      const configService = service['configService'] as jest.Mocked<ConfigService>;
      configService.get.mockReturnValue('https://webhook1.com,https://webhook2.com');

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, status: 200 });

      await service.sendTransactionStatus(payload);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('debería manejar respuesta no exitosa', async () => {
      const configService = service['configService'] as jest.Mocked<ConfigService>;
      configService.get.mockReturnValue('https://webhook1.com');

      mockFetch.mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' });

      await service.sendTransactionStatus(payload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
