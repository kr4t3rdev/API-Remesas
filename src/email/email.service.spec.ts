import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn(),
  }),
}));

describe('EmailService', () => {
  let service: EmailService;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          SMTP_HOST: 'smtp.test.com',
          SMTP_PORT: '587',
          SMTP_USER: 'test@test.com',
          SMTP_PASSWORD: 'password123',
          SMTP_FROM: 'noreply@test.com',
          SMTP_FROM_NAME: 'Test App',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('debería retornar success=true cuando el email se envía correctamente', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({
        messageId: 'msg-123',
      });

      const result = await service.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-123');
    });

    it('debería retornar success=false cuando el servidor SMTP no está configurado', async () => {
      // Create service without SMTP config
      const mockConfigService = {
        get: jest.fn((key: string) => {
          const config: Record<string, string | undefined> = {
            SMTP_HOST: undefined,
            SMTP_USER: undefined,
            SMTP_PASSWORD: undefined,
          };
          return config[key];
        }),
      };

      const noConfigModule: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const noConfigService = noConfigModule.get<EmailService>(EmailService);

      const result = await noConfigService.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP not configured');
    });

    it('debería retornar error cuando el email es inválido', async () => {
      const result = await service.sendEmail({
        to: 'invalid-email',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email address format');
    });

    it('debería retornar success=false cuando hay error de conexión', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await service.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
    });

    it('debería usar el email "to" correcto en el envío', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'msg-123' });

      await service.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@test.com',
        }),
      );
    });

    it('debería incluir from con nombre y email', async () => {
      mockTransporter.sendMail.mockResolvedValueOnce({ messageId: 'msg-123' });

      await service.sendEmail({
        to: 'recipient@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: '"Test App" <noreply@test.com>',
        }),
      );
    });
  });
});
