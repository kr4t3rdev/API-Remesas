import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { VerificationTokenService } from './verification-token.service';
import { ConfigService } from '@nestjs/config';
import { ActivateUserDto } from './dto/activate-user.dto';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 30;
const VERIFICATION_RESEND_COOLDOWN_MINUTES = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private verificationTokenService: VerificationTokenService,
    private configService: ConfigService,
  ) {}

  private buildAppUrl(baseUrl: string, path: string, token: string): string {
    const normalizedPath = path.replace(/^\//, '');

    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(baseUrl)) {
      const schemeUrl = new URL(baseUrl);
      const basePath = schemeUrl.pathname.replace(/\/$/, '');
      schemeUrl.pathname = `${basePath}/${normalizedPath}`.replace(/\/{2,}/g, '/');
      schemeUrl.searchParams.set('token', token);
      return schemeUrl.toString();
    }

    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
    return `${normalizedBaseUrl}/${normalizedPath}?token=${token}`;
  }

  private buildLoginUnauthorizedException(params: {
    message: string;
    code: string;
    remainingAttempts?: number;
    blockedUntil?: Date | null;
    retryAfterMinutes?: number;
  }) {
    return new UnauthorizedException({
      message: params.message,
      code: params.code,
      remainingAttempts: params.remainingAttempts,
      maxAttempts: MAX_FAILED_LOGIN_ATTEMPTS,
      blockedUntil: params.blockedUntil?.toISOString(),
      retryAfterMinutes: params.retryAfterMinutes,
    });
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw this.buildLoginUnauthorizedException({
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const now = new Date();

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta está pendiente de activación. Contacta al administrador para realizar el pago y activar tu suscripción.');
    }

    if (user.isBanned && (!user.bannedUntil || user.bannedUntil > now)) {
      throw this.buildLoginUnauthorizedException({
        message: 'Usuario baneado. Contacte al administrador',
        code: 'USER_BANNED',
      });
    }

    if (user.blockedUntil && user.blockedUntil > now) {
      const retryAfterMinutes = Math.max(1, Math.ceil((user.blockedUntil.getTime() - now.getTime()) / 60000));
      throw this.buildLoginUnauthorizedException({
        message: 'Usuario bloqueado temporalmente. Intente más tarde',
        code: 'LOGIN_TEMP_BLOCKED',
        blockedUntil: user.blockedUntil,
        retryAfterMinutes,
        remainingAttempts: 0,
      });
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
        throw this.buildLoginUnauthorizedException({
          message: 'Usuario bloqueado temporalmente. Intente más tarde',
          code: 'LOGIN_TEMP_BLOCKED',
          blockedUntil,
          retryAfterMinutes: LOGIN_BLOCK_MINUTES,
          remainingAttempts: 0,
        });
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts,
          },
        });
        throw this.buildLoginUnauthorizedException({
          message: 'Credenciales inválidas',
          code: 'INVALID_CREDENTIALS',
          remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS - failedLoginAttempts,
        });
      }
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
      mustChangePassword: updatedUser.mustChangePassword,
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
        mustChangePassword: updatedUser.mustChangePassword,
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
        mustChangePassword: true,
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

    // Si el usuario debe cambiar su contraseña (por reset forzado), no requiere contraseña actual
    if (!user.mustChangePassword) {
      const currentPassword = changePasswordDto.currentPassword;
      if (!currentPassword) {
        throw new BadRequestException('La contraseña actual es requerida');
      }
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Contraseña actual incorrecta');
      }
    }

    // Validar que la nueva contraseña no sea temporal
    if (changePasswordDto.newPassword.startsWith('tmp-')) {
      throw new BadRequestException('La nueva contraseña no puede ser una contraseña temporal');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        mustChangePassword: false, // Reset del flag después de cambiar
      },
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
        nickname: true,
        role: true,
        isActive: true,
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

  async activateUser(userId: number, activateUserDto: ActivateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isActive = activateUserDto.isActive ?? true;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      message: isActive 
        ? `Usuario ${user.email} activado correctamente. Ya puede iniciar sesión.`
        : `Usuario ${user.email} desactivado.`,
      user: updatedUser,
    };
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

  /**
   * Register a new user with email verification required
   */
  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Generate verification token
    const { token, expiresAt } = this.verificationTokenService.generateToken();

    // Create user with account pending payment activation
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        nickname: registerDto.nickname || null,
        role: 'USER',
        isActive: false, // Cuenta pendiente de activar hasta que haga el pago
        emailVerified: true, // Ya verificado, queda pendiente de pago
        verificationToken: token,
        verificationExpires: expiresAt,
        verificationSentAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Send welcome email with payment instructions
    const appUrl = this.configService.get<string>('APP_URL') || 'https://casadecambio.app';
    const whatsappUrl = `https://wa.me/5353917705`;

    // Log para debugging (visible en consola)
    console.log('\n========================================');
    console.log('📧 NUEVO REGISTRO - EMAIL FALLÓ POSIBLEMENTE');
    console.log('========================================');
    console.log('Email:', user.email);
    console.log('Nombre:', user.name);
    console.log('WhatsApp: +53 53917705');
    console.log('========================================\n');

    await this.notificationsService.notifyEmailVerification(
      user.id,
      user.email,
      user.name,
      whatsappUrl,
    );

    return {
      message: 'Registro exitoso. Te enviamos un email con las instrucciones para activar tu cuenta.',
      email: user.email,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return {
        message: 'Si el correo está registrado, te enviaremos un enlace para restablecer tu contraseña.',
      };
    }

    const { token, expiresAt } = this.verificationTokenService.generatePasswordResetToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      },
    });

    const appUrl = this.configService.get<string>('APP_URL') || 'https://casadecambio.app';
    const resetUrl = this.buildAppUrl(appUrl, 'reset-password', token);

    await this.notificationsService.notifyPasswordReset(user.id, user.email, resetUrl);

    return {
      message: 'Si el correo está registrado, te enviaremos un enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: resetPasswordDto.token },
    });

    if (!user) {
      throw new BadRequestException('El enlace de restablecimiento es inválido.');
    }

    if (this.verificationTokenService.isTokenExpired(user.passwordResetExpires)) {
      throw new BadRequestException('El enlace de restablecimiento ha expirado. Solicita uno nuevo.');
    }

    if (resetPasswordDto.newPassword.startsWith('tmp-')) {
      throw new BadRequestException('La nueva contraseña no puede ser una contraseña temporal');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        blockedUntil: null,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      message: 'Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.',
    };
  }

  /**
   * Verify user's email with token
   */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de verificación inválido');
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('El correo electrónico ya ha sido verificado');
    }

    // Check if token is expired
    if (this.verificationTokenService.isTokenExpired(user.verificationExpires)) {
      throw new BadRequestException('El token de verificación ha expirado. Solicita uno nuevo.');
    }

    // Verify email and clear token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });

    return {
      message: 'Email verificado correctamente. Ya puedes iniciar sesión.',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerification(resendDto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resendDto.email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'Si el correo está registrado y no ha sido verificado, te enviamos un nuevo email.',
      };
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('El correo electrónico ya ha sido verificado');
    }

    // Check cooldown
    if (user.verificationSentAt) {
      const cooldownEnd = new Date(user.verificationSentAt);
      cooldownEnd.setMinutes(cooldownEnd.getMinutes() + VERIFICATION_RESEND_COOLDOWN_MINUTES);

      if (new Date() < cooldownEnd) {
        const remainingMinutes = Math.ceil((cooldownEnd.getTime() - Date.now()) / 60000);
        throw new ForbiddenException(
          `Debes esperar ${remainingMinutes} minutos antes de solicitar otro email de verificación.`,
        );
      }
    }

    // Generate new verification token
    const { token, expiresAt } = this.verificationTokenService.generateToken();

    // Update user with new token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: token,
        verificationExpires: expiresAt,
        verificationSentAt: new Date(),
      },
    });

    // Send verification email
    const appUrl = this.configService.get<string>('APP_URL') || 'https://casadecambio.app';
    const verificationUrl = this.buildAppUrl(appUrl, 'auth/verify-email', token);

    // Log para debugging
    this.logger.log(`Verification URL (resend): ${verificationUrl}`);

    await this.notificationsService.notifyEmailVerification(
      user.id,
      user.email,
      user.name,
      verificationUrl,
    );

    return {
      message: 'Te enviamos un nuevo email de verificación.',
    };
  }
}
