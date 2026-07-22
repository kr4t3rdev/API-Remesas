import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { getTemplate, TemplateData } from '../email/email-templates';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async listForUser(
    userId: number,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(options.unreadOnly ? { readAt: null } : {}),
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.getUnreadCount(userId),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        unreadCount,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  getUnreadCount(userId: number) {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  private async notifyAdminsInApp(params: {
    type: NotificationType;
    title: string;
    message: string;
    payload?: Prisma.InputJsonValue;
  }) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    return Promise.all(
      admins.map((admin) =>
        this.prisma.notification.create({
          data: {
            userId: admin.id,
            type: params.type,
            channel: 'IN_APP',
            title: params.title,
            message: params.message,
            payload: params.payload,
            sentAt: new Date(),
          },
        }),
      ),
    );
  }

  markAsRead(userId: number, notificationId: number) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async notifyMixed(params: {
    userId?: number;
    type: NotificationType;
    title: string;
    message: string;
    payload?: Prisma.InputJsonValue;
    channels?: NotificationChannel[];
  }) {
    const channels = params.channels ?? ['IN_APP', 'WEBHOOK', 'EMAIL'];

    // Get user email if userId is provided
    let userEmail: string | undefined;
    if (params.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: params.userId },
        select: { email: true },
      });
      userEmail = user?.email;
    }

    // Separate email channel from other channels
    const emailChannel = channels.includes('EMAIL') ? 'EMAIL' : null;
    const otherChannels = channels.filter((c) => c !== 'EMAIL');

    // Create database notifications for all channels except EMAIL
    const writes = otherChannels.map((channel) =>
      this.prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          channel,
          title: params.title,
          message: params.message,
          payload: params.payload,
          sentAt: new Date(),
        },
      }),
    );

    // Send email if channel includes EMAIL and we have a user email
    if (emailChannel && userEmail) {
      const templateData: TemplateData = {
        ...(params.payload as TemplateData || {}),
        email: userEmail,
      };

      const template = getTemplate(params.type, templateData);

      const emailResult = await this.emailService.sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      // Log the notification to database regardless of email success
      const payloadObj = params.payload as Record<string, unknown> || {};
      writes.push(
        this.prisma.notification.create({
          data: {
            userId: params.userId,
            type: params.type,
            channel: 'EMAIL',
            title: params.title,
            message: params.message,
            payload: {
              ...payloadObj,
              emailSent: emailResult.success,
              messageId: emailResult.messageId,
              error: emailResult.error,
            } as Prisma.InputJsonValue,
            sentAt: new Date(),
          },
        }),
      );

      if (!emailResult.success) {
        this.logger.warn(`Failed to send email notification: ${emailResult.error}`);
      }
    } else if (emailChannel && !userEmail) {
      this.logger.warn(`Cannot send email: user ${params.userId} has no email address`);
    }

    return Promise.all(writes);
  }

  notifyNewUserRegistered(userId: number, email: string) {
    const notification = {
      type: 'NEW_USER_REGISTERED' as const,
      title: 'Nuevo usuario registrado',
      message: `Se registró el usuario ${email}`,
      payload: { email },
    };

    return Promise.all([
      this.notifyMixed({ userId, ...notification, channels: ['EMAIL'] }),
      this.notifyAdminsInApp(notification),
    ]);
  }

  notifyUserTemporarilyBlocked(userId: number, blockedUntil: Date, failedAttempts: number) {
    const notification = {
      type: 'USER_TEMP_BLOCKED' as const,
      title: 'Usuario bloqueado temporalmente',
      message: 'Demasiados intentos fallidos de inicio de sesión',
      payload: { blockedUntil: blockedUntil.toISOString(), failedAttempts },
    };

    return Promise.all([
      this.notifyMixed({ userId, ...notification, channels: ['EMAIL'] }),
      this.notifyAdminsInApp(notification),
    ]);
  }

  notifyUserBanned(userId: number, reason: string, bannedUntil?: Date | null) {
    const notification = {
      type: 'USER_BANNED' as const,
      title: 'Usuario baneado',
      message: reason,
      payload: { reason, bannedUntil: bannedUntil?.toISOString() ?? null },
    };

    return Promise.all([
      this.notifyMixed({ userId, ...notification, channels: ['EMAIL'] }),
      this.notifyAdminsInApp(notification),
    ]);
  }

  notifyEmailVerification(userId: number, email: string, name: string, verificationUrl: string) {
    return this.notifyMixed({
      userId,
      type: 'EMAIL_VERIFICATION',
      title: 'Bienvenido a Casa de Cambio',
      message: 'Te enviamos las instrucciones para activar tu cuenta',
      payload: { email, name, verificationUrl, whatsappNumber: '53917705' },
    });
  }

  notifyPasswordReset(userId: number, email: string, resetUrl: string) {
    return this.notifyMixed({
      userId,
      type: 'PASSWORD_RESET',
      title: 'Restablece tu contraseña',
      message: 'Te enviamos un enlace para restablecer tu contraseña',
      payload: { email, resetToken: resetUrl.split('token=').pop() ?? '', resetUrl },
    });
  }

  async notifyAdminPasswordReset(userId: number, message: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) return [];

    const subject = 'Cambio de contraseña por seguridad';
    const html = `
      <p>Hola <strong>${user.email}</strong>,</p>
      <p>${message}</p>
      <p>Si necesitas más ayuda, contacta al administrador.</p>
    `;
    const text = `Hola ${user.email},\n\n${message}\n\nSi necesitas más ayuda, contacta al administrador.`;

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: 'PASSWORD_RESET',
        channel: 'EMAIL',
        title: subject,
        message,
        payload: { email: user.email, message },
        sentAt: new Date(),
      },
    });

    const emailResult = await this.emailService.sendEmail({
      to: user.email,
      subject,
      html,
      text,
    });

    if (!emailResult.success) {
      this.logger.warn(`Failed to send admin password reset email: ${emailResult.error}`);
    }

    return [notification, emailResult];
  }
}
