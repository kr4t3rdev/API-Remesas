import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const configService = {
    getOrThrow: jest.fn().mockReturnValue('test-secret'),
  } as unknown as ConfigService;

  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    strategy = new JwtStrategy(configService, prisma);
  });

  it('rejects a token when the user was deactivated after it was issued', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      role: Role.USER,
      isActive: false,
      isBanned: false,
      bannedUntil: null,
    });

    await expect(
      strategy.validate({ sub: 7 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('uses the current database role instead of the stale token role', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      role: Role.USER,
      isActive: true,
      isBanned: false,
      bannedUntil: null,
    });

    await expect(
      strategy.validate({ sub: 7 }),
    ).resolves.toEqual({
      id: 7,
      email: 'user@example.com',
      role: Role.USER,
    });
  });

  it('rejects a token while the user is banned', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      role: Role.USER,
      isActive: true,
      isBanned: true,
      bannedUntil: new Date(Date.now() + 60_000),
    });

    await expect(
      strategy.validate({ sub: 7 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token when its user no longer exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      strategy.validate({ sub: 7 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a permanently banned user whose ban has no expiry', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      role: Role.USER,
      isActive: true,
      isBanned: true,
      bannedUntil: null,
    });

    await expect(strategy.validate({ sub: 7 })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('allows a user whose timed ban has expired', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 7,
      email: 'current@example.com',
      role: Role.USER,
      isActive: true,
      isBanned: true,
      bannedUntil: new Date(Date.now() - 60_000),
    });

    await expect(strategy.validate({ sub: 7 })).resolves.toEqual({
      id: 7,
      email: 'current@example.com',
      role: Role.USER,
    });
  });

  it('returns the active user current email and role', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 7,
      email: 'current@example.com',
      role: Role.ADMIN,
      isActive: true,
      isBanned: false,
      bannedUntil: null,
    });

    await expect(strategy.validate({ sub: 7 })).resolves.toEqual({
      id: 7,
      email: 'current@example.com',
      role: Role.ADMIN,
    });
  });

  it('does not invalidate an existing JWT due to a future login block', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      role: Role.USER,
      isActive: true,
      isBanned: false,
      bannedUntil: null,
      blockedUntil: new Date(Date.now() + 60_000),
    });

    await expect(strategy.validate({ sub: 7 })).resolves.toEqual({
      id: 7,
      email: 'user@example.com',
      role: Role.USER,
    });
  });
});
