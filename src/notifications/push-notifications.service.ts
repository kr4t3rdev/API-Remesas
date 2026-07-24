import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

interface RegisterPushTokenDto {
  pushToken: string;
  platform: string;
}

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private readonly expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  async upsertDevice(userId: number, dto: RegisterPushTokenDto) {
    return this.prisma.pushDevice.upsert({
      where: {
        userId_pushToken: { userId, pushToken: dto.pushToken },
      },
      create: {
        userId,
        pushToken: dto.pushToken,
        platform: dto.platform,
      },
      update: {
        platform: dto.platform,
      },
    });
  }

  async sendPushToUser(
    userId: number,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    const devices = await this.prisma.pushDevice.findMany({ where: { userId } });
    if (!devices.length) return;

    const messages: ExpoPushMessage[] = devices
      .filter((d) => Expo.isExpoPushToken(d.pushToken))
      .map((d) => ({
        to: d.pushToken,
        sound: 'default' as const,
        title,
        body,
        data: data ?? {},
      }));

    if (!messages.length) return;

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const tickets: ExpoPushTicket[] =
          await this.expo.sendPushNotificationsAsync(chunk);
        this.logReceipts(tickets, userId);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to send push notification to user ${userId}: ${error}`,
      );
    }
  }

  /** Log ticket errors without blocking the notification flow. */
  private logReceipts(tickets: ExpoPushTicket[], userId: number) {
    for (const ticket of tickets) {
      if (ticket.status === 'error') {
        this.logger.warn(
          `Push ticket error for user ${userId}: ${ticket.message} (${ticket.details?.error})`,
        );
      }
    }
  }
}