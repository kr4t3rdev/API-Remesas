import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PlansController } from '../plans/plans.controller';
import { PlansService } from '../plans/plans.service';
import { SubscriptionsController } from '../subscriptions/subscriptions.controller';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

describe('Admin RBAC (integration via RolesGuard)', () => {
  let rolesGuard: RolesGuard;
  let adminController: AdminController;
  let plansController: PlansController;
  let subscriptionsController: SubscriptionsController;

  const buildContext = (handler: Function, cls: Function, role: 'ADMIN' | 'USER'): ExecutionContext =>
    ({
      getHandler: () => handler,
      getClass: () => cls,
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 1, role } }),
      }),
    } as any);

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AdminController, PlansController, SubscriptionsController],
      providers: [
        Reflector,
        RolesGuard,
        {
          provide: AdminService,
          useValue: {
            getKpis: jest.fn(),
            getUsers: jest.fn(),
            createUserFromAdminConsole: jest.fn(),
            getUserDetail: jest.fn(),
            updateUserBasic: jest.fn(),
            applyUserControlAction: jest.fn(),
            getBlockedUsers: jest.fn(),
            getExpiringLicenses: jest.fn(),
            getAuditLogs: jest.fn(),
          },
        },
        {
          provide: PlansService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: SubscriptionsService,
          useValue: {
            listLicenses: jest.fn(),
            assignLicense: jest.fn(),
            renewLicense: jest.fn(),
            suspendLicense: jest.fn(),
            reactivateLicense: jest.fn(),
            registerPayment: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = moduleRef.get(RolesGuard);
    adminController = moduleRef.get(AdminController);
    plansController = moduleRef.get(PlansController);
    subscriptionsController = moduleRef.get(SubscriptionsController);
  });

  it('debería permitir ADMIN y denegar USER en handler admin', () => {
    const adminCtx = buildContext(adminController.getKpis, AdminController, 'ADMIN');
    const userCtx = buildContext(adminController.getKpis, AdminController, 'USER');

    expect(rolesGuard.canActivate(adminCtx)).toBe(true);
    expect(() => rolesGuard.canActivate(userCtx)).toThrow(ForbiddenException);
  });

  it('debería permitir ADMIN y denegar USER en handler plans', () => {
    const adminCtx = buildContext(plansController.findAll, PlansController, 'ADMIN');
    const userCtx = buildContext(plansController.findAll, PlansController, 'USER');

    expect(rolesGuard.canActivate(adminCtx)).toBe(true);
    expect(() => rolesGuard.canActivate(userCtx)).toThrow(ForbiddenException);
  });

  it('debería permitir ADMIN y denegar USER en handler subscriptions', () => {
    const adminCtx = buildContext(subscriptionsController.listLicenses, SubscriptionsController, 'ADMIN');
    const userCtx = buildContext(subscriptionsController.listLicenses, SubscriptionsController, 'USER');

    expect(rolesGuard.canActivate(adminCtx)).toBe(true);
    expect(() => rolesGuard.canActivate(userCtx)).toThrow(ForbiddenException);
  });
});
