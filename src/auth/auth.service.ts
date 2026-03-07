import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { NotificationsService } from '../notifications/notifications.service';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 30;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const now = new Date();

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    if (user.isBanned && (!user.bannedUntil || user.bannedUntil > now)) {
      throw new UnauthorizedException('Usuario baneado. Contacte al administrador');
    }

    if (user.blockedUntil && user.blockedUntil > now) {
      throw new UnauthorizedException('Usuario bloqueado temporalmente. Intente más tarde');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      const failedLoginAttempts = user.failedLoginAttempts + 1;

      if (failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        const blockedUntil = new Date(now.getTime() + LOGIN_BLOCK_MINUTES * 60 * 1000);
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            blockedUntil,
          },
        });
        await this.notificationsService.notifyUserTemporarilyBlocked(
          user.id,
          blockedUntil,
          failedLoginAttempts,
        );
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts,
          },
        });
      }

      throw new UnauthorizedException('Credenciales inválidas');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        blockedUntil: null,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        failedLoginAttempts: updatedUser.failedLoginAttempts,
        blockedUntil: updatedUser.blockedUntil,
        isBanned: updatedUser.isBanned,
        bannedUntil: updatedUser.bannedUntil,
      },
    };
  }

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        failedLoginAttempts: true,
        blockedUntil: true,
        isBanned: true,
        bannedUntil: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        failedLoginAttempts: true,
        blockedUntil: true,
        isBanned: true,
        bannedUntil: true,
        createdAt: true,
      },
    });

    await this.notificationsService.notifyNewUserRegistered(user.id, user.email);

    return user;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Usuario eliminado correctamente' };
  }

  async setPrimaryCurrency(userId: number, primaryCurrencyId: number) {
    const currency = await this.prisma.currency.findUnique({
      where: { id: primaryCurrencyId },
    });

    if (!currency) {
      throw new NotFoundException(`Moneda con ID ${primaryCurrencyId} no encontrada`);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { primaryCurrencyId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        primaryCurrencyId: true,
      },
    });

    return user;
  }

  async revokeAllSessions(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Nota: actualmente la autenticación es JWT stateless y no existe tabla de sesiones/token blacklist.
    // Este método deja trazabilidad para controles operativos hasta definir estrategia completa de revocación.
    return {
      revoked: false,
      strategy: 'STATELESS_JWT_NO_SESSION_STORE',
      message: 'Revocación global no disponible con la estrategia actual de sesión',
    };
  }
}
