import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminUserControlActionType } from './dto/admin-user-action.dto';
import { Role } from '@prisma/client';

describe('AdminService user controls', () => {
  const prismaMock: any = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    userLicense: {
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    subscriptionPayment: {
      findMany: jest.fn(),
    },
    adminAuditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const authServiceMock = {
    revokeAllSessions: jest.fn().mockResolvedValue({ revoked: false }),
  };

  let service: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminService(prismaMock, authServiceMock as any);
  });

  it('requires reason for sensitive action', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 10,
      role: 'USER',
      isActive: true,
      isBanned: false,
      blockedUntil: null,
      failedLoginAttempts: 0,
    });

    await expect(
      service.applyUserControlAction(10, 1, {
        actionType: AdminUserControlActionType.CHANGE_ROLE,
        reason: '',
        payload: { newRole: 'ADMIN' },
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when target user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.applyUserControlAction(999, 1, {
        actionType: AdminUserControlActionType.UNBLOCK,
        reason: 'Prueba',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('records audit log on role change action', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 5,
      role: 'USER',
      isActive: true,
      isBanned: false,
      blockedUntil: null,
      failedLoginAttempts: 0,
    });

    prismaMock.user.update.mockResolvedValue({
      id: 5,
      role: 'ADMIN',
    });

    await service.applyUserControlAction(5, 1, {
      actionType: AdminUserControlActionType.CHANGE_ROLE,
      reason: 'Escalación temporal',
      payload: { newRole: 'ADMIN' },
    } as any);

    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledTimes(1);
  });

  it('creates a user from admin console and writes USER_CREATE audit', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 77,
      email: 'nuevo@cambios.com',
      name: 'Nuevo Usuario',
      role: Role.USER,
      isActive: true,
      isBanned: false,
      blockedUntil: null,
      failedLoginAttempts: 0,
      createdAt: new Date('2026-03-04T10:00:00.000Z'),
    });

    const result = await service.createUserFromAdminConsole(1, {
      name: 'Nuevo Usuario',
      email: 'nuevo@cambios.com',
      role: Role.USER,
      contact: { alternateEmail: 'alt@cambios.com' },
      access: { isActive: false, forcePasswordChangeOnFirstLogin: true, sendInviteEmail: true },
      preferences: { locale: 'es-CU', timezone: 'America/Havana' },
      licenseSetup: { planId: 2, cycle: 'MONTHLY', startImmediately: true },
    } as any);

    expect(result.id).toBe(77);
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isActive: false,
        }),
      }),
    );
    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorUserId: 1,
          targetUserId: 77,
          action: 'USER_CREATE',
          metadata: expect.objectContaining({
            hasExtendedCapture: true,
            extendedCapture: expect.objectContaining({
              contact: expect.objectContaining({ alternateEmail: 'alt@cambios.com' }),
            }),
          }),
        }),
      }),
    );
  });

  it('rejects duplicate email and does not persist user/audit records', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 12,
      email: 'existente@cambios.com',
    });

    await expect(
      service.createUserFromAdminConsole(1, {
        name: 'Duplicado',
        email: 'existente@cambios.com',
        role: Role.USER,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.adminAuditLog.create).not.toHaveBeenCalled();
  });
});
