import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUserControlActionType } from './dto/admin-user-action.dto';

describe('Admin user endpoints integration-like', () => {
  const authServiceMock = {
    revokeAllSessions: jest.fn().mockResolvedValue({ revoked: false }),
  };

  const notificationsServiceMock = {
    notifyMixed: jest.fn().mockResolvedValue({}),
  };

  const setup = () => {
    const users = new Map<
      number,
      {
        id: number;
        email: string;
        name: string;
        role: 'ADMIN' | 'USER';
        isActive: boolean;
        isBanned: boolean;
        blockedUntil: Date | null;
        failedLoginAttempts: number;
      }
    >([
      [
        2,
        {
          id: 2,
          email: 'user2@test.com',
          name: 'User Dos',
          role: 'USER',
          isActive: true,
          isBanned: false,
          blockedUntil: null,
          failedLoginAttempts: 0,
        },
      ],
    ]);
    const audits: Array<{ action: string; actorUserId: number; targetUserId?: number | null }> = [];

    const prismaMock: any = {
      user: {
        findUnique: jest.fn(async ({ where }: any) => {
          if (typeof where?.id === 'number') return users.get(where.id) ?? null;
          if (typeof where?.email === 'string') {
            return Array.from(users.values()).find((u) => u.email === where.email) ?? null;
          }
          return null;
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const current = users.get(where.id);
          if (!current) return null;
          const next = { ...current, ...data };
          users.set(where.id, next);
          return next;
        }),
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
        create: jest.fn(async ({ data }: any) => {
          audits.push({
            action: data.action,
            actorUserId: data.actorUserId,
            targetUserId: data.targetUserId,
          });
          return { id: audits.length, ...data };
        }),
        findMany: jest.fn(),
      },
    };

    const service = new AdminService(prismaMock, authServiceMock as any, notificationsServiceMock as any);
    const controller = new AdminController(service);

    return { controller, users, audits };
  };

  it('PATCH endpoint persists CRUD update and writes audit record', async () => {
    const { controller, users, audits } = setup();

    await controller.updateUserBasic(2, 99, {
      name: 'User Dos Editado',
      email: 'user2-edited@test.com',
      isActive: true,
    });

    expect(users.get(2)?.name).toBe('User Dos Editado');
    expect(users.get(2)?.email).toBe('user2-edited@test.com');
    expect(audits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'USER_BASIC_UPDATED',
          actorUserId: 99,
          targetUserId: 2,
        }),
      ]),
    );
  });

  it('POST actions endpoint persists control change and writes audit record', async () => {
    const { controller, users, audits } = setup();

    await controller.applyUserControlAction(2, 99, {
      actionType: AdminUserControlActionType.SUSPEND_ACCOUNT,
      reason: 'Riesgo operativo',
    } as any);

    expect(users.get(2)?.isActive).toBe(false);
    expect(audits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: AdminUserControlActionType.SUSPEND_ACCOUNT,
          actorUserId: 99,
          targetUserId: 2,
        }),
      ]),
    );
  });
});
