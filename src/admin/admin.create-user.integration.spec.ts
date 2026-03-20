import { ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';

describe('Admin create user flow (service integration-like)', () => {
  const authServiceMock = {
    revokeAllSessions: jest.fn().mockResolvedValue({ revoked: false }),
  };

  const notificationsServiceMock = {
    notifyMixed: jest.fn().mockResolvedValue({}),
  };

  const buildServiceWithStore = () => {
    const users: Array<{ id: number; email: string; name: string; role: Role }> = [];
    const audits: Array<{ action: string; actorUserId: number; targetUserId?: number | null; metadata?: any }> = [];

    const prismaMock: any = {
      user: {
        findUnique: jest.fn(async ({ where: { email } }: any) => users.find((u) => u.email === email) ?? null),
        create: jest.fn(async ({ data }: any) => {
          const created = {
            id: users.length + 1,
            email: data.email,
            name: data.name,
            role: data.role,
            isActive: true,
            isBanned: false,
            blockedUntil: null,
            failedLoginAttempts: 0,
            createdAt: new Date('2026-03-04T10:00:00.000Z'),
          };
          users.push({ id: created.id, email: created.email, name: created.name, role: created.role });
          return created;
        }),
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
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
        create: jest.fn(async ({ data }: any) => {
          audits.push({
            action: data.action,
            actorUserId: data.actorUserId,
            targetUserId: data.targetUserId,
            metadata: data.metadata,
          });
          return { id: audits.length, ...data };
        }),
        findMany: jest.fn(),
      },
    };

    return {
      service: new AdminService(prismaMock, authServiceMock as any, notificationsServiceMock as any),
      prismaMock,
      users,
      audits,
    };
  };

  it('persists new user and creates USER_CREATE audit record', async () => {
    const { service, users, audits } = buildServiceWithStore();

    const created = await service.createUserFromAdminConsole(99, {
      name: 'Alta Admin',
      email: 'alta@cambios.com',
      role: Role.USER,
      access: { isActive: false, sendInviteEmail: true },
      preferences: { locale: 'es-CU', timezone: 'America/Havana' },
    } as any);

    expect(created.email).toBe('alta@cambios.com');
    expect(users).toHaveLength(1);
    expect(audits).toHaveLength(1);
    expect(audits[0]).toEqual(
      expect.objectContaining({
        action: 'USER_CREATE',
        actorUserId: 99,
        targetUserId: created.id,
        metadata: expect.objectContaining({ hasExtendedCapture: true }),
      }),
    );
  });

  it('returns 409-like conflict behavior on duplicate email and avoids partial records', async () => {
    const { service, users, audits } = buildServiceWithStore();

    await service.createUserFromAdminConsole(10, {
      name: 'Primero',
      email: 'dup@cambios.com',
      role: Role.USER,
    });

    await expect(
      service.createUserFromAdminConsole(11, {
        name: 'Duplicado',
        email: 'dup@cambios.com',
        role: Role.ADMIN,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(users).toHaveLength(1);
    expect(audits).toHaveLength(1);
    expect(users[0].name).toBe('Primero');
  });
});
