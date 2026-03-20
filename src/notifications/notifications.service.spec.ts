import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;
  let emailService: any;

  beforeEach(async () => {
    const mockPrisma = {
      notification: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ email: 'test@user.com' }),
      },
    };

    const mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
    emailService = module.get(EmailService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('notifyNewUserRegistered', () => {
    it('debería crear notificaciones para todos los canales incluyendo EMAIL', async () => {
      await service.notifyNewUserRegistered(1, 'new@user.com');

      // 3 channels: IN_APP, WEBHOOK + EMAIL (which calls both db + email)
      expect(prisma.notification.create).toHaveBeenCalled();
    });

    it('debería llamar a EmailService cuando el canal incluye EMAIL', async () => {
      await service.notifyNewUserRegistered(1, 'new@user.com');

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@user.com',
          subject: expect.any(String),
          html: expect.any(String),
          text: expect.any(String),
        }),
      );
    });
  });

  describe('notifyUserTemporarilyBlocked', () => {
    it('debería crear notificaciones para bloqueo temporal', async () => {
      await service.notifyUserTemporarilyBlocked(1, new Date('2026-03-01T00:00:00.000Z'), 5);

      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('notifyUserBanned', () => {
    it('debería crear notificaciones para ban de usuario', async () => {
      await service.notifyUserBanned(1, 'Violación de política', null);

      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('notifyMixed con EMAIL canal', () => {
    it('debería llamar a EmailService cuando el canal incluye EMAIL', async () => {
      await service.notifyMixed({
        userId: 1,
        type: 'NEW_USER_REGISTERED' as NotificationType,
        title: 'Test',
        message: 'Test message',
        channels: ['EMAIL'],
      });

      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('NO debería llamar a EmailService cuando el canal NO incluye EMAIL', async () => {
      await service.notifyMixed({
        userId: 1,
        type: 'NEW_USER_REGISTERED' as NotificationType,
        title: 'Test',
        message: 'Test message',
        channels: ['IN_APP'],
      });

      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });
});
