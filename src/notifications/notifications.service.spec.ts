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
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({ email: 'test@user.com' }),
        findMany: jest.fn().mockResolvedValue([]),
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

    it('debería crear la alerta IN_APP para administradores activos', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 99 }]);

      await service.notifyNewUserRegistered(1, 'new@user.com');

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true },
      });
      expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: 99,
          channel: 'IN_APP',
          type: 'NEW_USER_REGISTERED',
        }),
      }));
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

  describe('lectura y estado de notificaciones', () => {
    it('debería devolver una página y el total de no leídas', async () => {
      prisma.notification.findMany.mockResolvedValue([{ id: 4, readAt: null }]);
      prisma.notification.count.mockResolvedValueOnce(3).mockResolvedValueOnce(1);

      await expect(service.listForUser(7, { page: 2, limit: 10, unreadOnly: true })).resolves.toEqual({
        data: [{ id: 4, readAt: null }],
        meta: { page: 2, limit: 10, total: 3, unreadCount: 1, totalPages: 1 },
      });
      expect(prisma.notification.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 7, readAt: null },
        skip: 10,
        take: 10,
      }));
    });

    it('debería marcar una notificación propia como leída', async () => {
      await expect(service.markAsRead(7, 4)).resolves.toEqual({ count: 1 });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 4, userId: 7, readAt: null },
        data: { readAt: expect.any(Date) },
      });
    });

    it('debería marcar todas las notificaciones propias no leídas', async () => {
      await expect(service.markAllAsRead(7)).resolves.toEqual({ count: 1 });
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 7, readAt: null },
        data: { readAt: expect.any(Date) },
      });
    });

    it('debería devolver el conteo de no leídas', async () => {
      prisma.notification.count.mockResolvedValue(5);
      await expect(service.getUnreadCount(7)).resolves.toBe(5);
      expect(prisma.notification.count).toHaveBeenCalledWith({ where: { userId: 7, readAt: null } });
    });
  });
});
