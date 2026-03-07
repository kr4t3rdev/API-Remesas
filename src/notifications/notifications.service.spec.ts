import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../database/prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      notification: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get(PrismaService);
  });

  it('debería emitir notificaciones mixtas para nuevo usuario', async () => {
    await service.notifyNewUserRegistered(1, 'new@user.com');

    expect(prisma.notification.create).toHaveBeenCalledTimes(3);
    const channels = prisma.notification.create.mock.calls.map((call: any[]) => call[0].data.channel);
    expect(channels).toEqual(expect.arrayContaining(['IN_APP', 'WEBHOOK', 'EMAIL']));
  });

  it('debería emitir notificaciones mixtas para bloqueo temporal', async () => {
    await service.notifyUserTemporarilyBlocked(1, new Date('2026-03-01T00:00:00.000Z'), 5);

    expect(prisma.notification.create).toHaveBeenCalledTimes(3);
  });

  it('debería emitir notificaciones mixtas para ban', async () => {
    await service.notifyUserBanned(1, 'Violación de política', null);

    expect(prisma.notification.create).toHaveBeenCalledTimes(3);
  });
});
