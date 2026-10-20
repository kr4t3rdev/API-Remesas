import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VerificationTokenService } from './verification-token.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let notificationsService: any;
  let verificationTokenService: any;
  let configService: any;

  beforeEach(async () => {
    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
      currency: {
        findUnique: jest.fn(),
      },
    };

    const mockNotificationsService = {
      notifyUserTemporarilyBlocked: jest.fn(),
      notifyNewUserRegistered: jest.fn(),
      notifyEmailVerification: jest.fn(),
      notifyPasswordReset: jest.fn(),
    };

    const mockVerificationTokenService = {
      generateToken: jest.fn().mockReturnValue({ token: 'verification-token', expiresAt: new Date(Date.now() + 86400000) }),
      generatePasswordResetToken: jest.fn().mockReturnValue({ token: 'reset-token', expiresAt: new Date(Date.now() + 3600000) }),
      isTokenExpired: jest.fn().mockReturnValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token') } },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: VerificationTokenService, useValue: mockVerificationTokenService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('https://appfinance.com') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);
    verificationTokenService = module.get(VerificationTokenService);
    configService = module.get(ConfigService);
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

    await expect(service.login({ email: 'test@test.com', password: 'bad' })).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'INVALID_CREDENTIALS',
        remainingAttempts: 2,
        maxAttempts: 5,
      }),
    });

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

    await expect(service.login({ email: 'test@test.com', password: 'bad' })).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'LOGIN_TEMP_BLOCKED',
        remainingAttempts: 0,
        retryAfterMinutes: 30,
        blockedUntil: expect.any(String),
      }),
    });

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

  it('debería informar bloqueo temporal si el usuario ya está bloqueado', async () => {
    const blockedUntil = new Date(Date.now() + 10 * 60 * 1000);
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hash',
      role: 'USER',
      name: 'Test',
      isActive: true,
      isBanned: false,
      bannedUntil: null,
      blockedUntil,
      failedLoginAttempts: 0,
    });

    await expect(service.login({ email: 'test@test.com', password: 'bad' })).rejects.toMatchObject({
      response: expect.objectContaining({
        code: 'LOGIN_TEMP_BLOCKED',
        remainingAttempts: 0,
        blockedUntil: blockedUntil.toISOString(),
        retryAfterMinutes: 10,
      }),
    });
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

  it('debería procesar forgot-password sin revelar si el usuario no existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await service.forgotPassword({ email: 'missing@test.com' });

    expect(result.message).toContain('Si el correo está registrado');
    expect(notificationsService.notifyPasswordReset).not.toHaveBeenCalled();
  });

  it('debería generar token y enviar email en forgot-password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      name: 'Test',
    });

    await service.forgotPassword({ email: 'test@test.com' });

    expect(verificationTokenService.generatePasswordResetToken).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          passwordResetToken: 'reset-token',
          passwordResetExpires: expect.any(Date),
        }),
      }),
    );
    expect(notificationsService.notifyPasswordReset).toHaveBeenCalledWith(
      1,
      'test@test.com',
      'https://appfinance.com/reset-password?token=reset-token',
    );
  });

  it('debería construir enlaces deep link para forgot-password cuando APP_URL usa esquema móvil', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      name: 'Test',
    });

    configService.get.mockReturnValue('xchangesocial://auth');

    await service.forgotPassword({ email: 'test@test.com' });

    expect(notificationsService.notifyPasswordReset).toHaveBeenCalledWith(
      1,
      'test@test.com',
      'xchangesocial://auth/reset-password?token=reset-token',
    );
  });

  it('debería invalidar token y actualizar contraseña al reset exitoso', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      passwordResetToken: 'reset-token',
      passwordResetExpires: new Date(Date.now() + 3600000),
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const result = await service.resetPassword({ token: 'reset-token', newPassword: 'Password123' });

    expect(result.message).toContain('restablecida correctamente');
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          password: 'hashed-password',
          mustChangePassword: false,
          passwordResetToken: null,
          passwordResetExpires: null,
        }),
      }),
    );
  });

  describe('checkEmailExists / checkNicknameExists', () => {
    it('devuelve exists=true cuando el email ya está registrado', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 7 });

      await expect(service.checkEmailExists('User@Mail.com')).resolves.toEqual({ exists: true });
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'User@Mail.com', mode: 'insensitive' } },
        select: { id: true },
      });
    });

    it('devuelve exists=false cuando el email está libre', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.checkEmailExists('nuevo@mail.com')).resolves.toEqual({ exists: false });
    });

    it('devuelve exists=true cuando el nickname ya está en uso', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 3 });

      await expect(service.checkNicknameExists('Juanito')).resolves.toEqual({ exists: true });
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { nickname: { equals: 'Juanito', mode: 'insensitive' } },
        select: { id: true },
      });
    });

    it('devuelve exists=false cuando el nickname está libre', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.checkNicknameExists('libre_1')).resolves.toEqual({ exists: false });
    });
  });

  it('debería rechazar reset con token expirado', async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      passwordResetToken: 'reset-token',
      passwordResetExpires: new Date(Date.now() - 1000),
    });
    verificationTokenService.isTokenExpired.mockReturnValue(true);

    await expect(
      service.resetPassword({ token: 'reset-token', newPassword: 'Password123' }),
    ).rejects.toThrow('El enlace de restablecimiento ha expirado');
  });
});
