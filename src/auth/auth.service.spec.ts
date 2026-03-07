import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      currency: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token') } },
        {
          provide: NotificationsService,
          useValue: {
            notifyUserTemporarilyBlocked: jest.fn(),
            notifyNewUserRegistered: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  it('debería incrementar intentos fallidos en credenciales inválidas', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hash',
      role: 'USER',
      name: 'Test',
      isActive: true,
      isBanned: false,
      bannedUntil: null,
      blockedUntil: null,
      failedLoginAttempts: 2,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login({ email: 'test@test.com', password: 'bad' })).rejects.toThrow(UnauthorizedException);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ failedLoginAttempts: 3 }),
      }),
    );
  });

  it('debería bloquear temporalmente al alcanzar umbral de intentos', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hash',
      role: 'USER',
      name: 'Test',
      isActive: true,
      isBanned: false,
      bannedUntil: null,
      blockedUntil: null,
      failedLoginAttempts: 4,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login({ email: 'test@test.com', password: 'bad' })).rejects.toThrow(UnauthorizedException);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          failedLoginAttempts: 0,
          blockedUntil: expect.any(Date),
        }),
      }),
    );
  });

  it('debería denegar login de usuario baneado', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hash',
      role: 'USER',
      name: 'Test',
      isActive: true,
      isBanned: true,
      bannedUntil: new Date(Date.now() + 10 * 60 * 1000),
      blockedUntil: null,
      failedLoginAttempts: 0,
    });

    await expect(service.login({ email: 'test@test.com', password: 'ok' })).rejects.toThrow(UnauthorizedException);
  });

  it('debería denegar login de usuario inactivo', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hash',
      role: 'USER',
      name: 'Test',
      isActive: false,
      isBanned: false,
      bannedUntil: null,
      blockedUntil: null,
      failedLoginAttempts: 0,
    });

    await expect(service.login({ email: 'test@test.com', password: 'ok' })).rejects.toThrow(UnauthorizedException);
  });

  it('debería resetear contador al login exitoso', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hash',
      role: 'USER',
      name: 'Test',
      isActive: true,
      isBanned: false,
      bannedUntil: null,
      blockedUntil: null,
      failedLoginAttempts: 2,
    });
    prisma.user.update.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      role: 'USER',
      name: 'Test',
      isActive: true,
      failedLoginAttempts: 0,
      blockedUntil: null,
      isBanned: false,
      bannedUntil: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({ email: 'test@test.com', password: 'ok' });

    expect(result.access_token).toBe('token');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ failedLoginAttempts: 0, blockedUntil: null }),
      }),
    );
  });
});
