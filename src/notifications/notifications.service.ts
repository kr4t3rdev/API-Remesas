import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async notifyMixed(params: {
    userId?: number;
    type: NotificationType;
    title: string;
    message: string;
    payload?: Prisma.InputJsonValue;
    channels?: NotificationChannel[];
  }) {
    const channels = params.channels ?? ['IN_APP', 'WEBHOOK', 'EMAIL'];

    const writes = channels.map((channel) =>
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

    return Promise.all(writes);
  }

  notifyNewUserRegistered(userId: number, email: string) {
    return this.notifyMixed({
      userId,
      type: 'NEW_USER_REGISTERED',
      title: 'Nuevo usuario registrado',
      message: `Se registró el usuario ${email}`,
      payload: { email },
    });
  }

  notifyUserTemporarilyBlocked(userId: number, blockedUntil: Date, failedAttempts: number) {
    return this.notifyMixed({
      userId,
      type: 'USER_TEMP_BLOCKED',
      title: 'Usuario bloqueado temporalmente',
      message: 'Demasiados intentos fallidos de inicio de sesión',
      payload: { blockedUntil: blockedUntil.toISOString(), failedAttempts },
    });
  }

  notifyUserBanned(userId: number, reason: string, bannedUntil?: Date | null) {
    return this.notifyMixed({
      userId,
      type: 'USER_BANNED',
      title: 'Usuario baneado',
      message: reason,
      payload: { bannedUntil: bannedUntil?.toISOString() ?? null },
    });
  }
}
