import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import {
  Expo,
  ExpoPushMessage,
  ExpoPushReceipt,
  ExpoPushTicket,
} from 'expo-server-sdk';

interface RegisterPushTokenDto {
  pushToken: string;
  platform: string;
}

const PUSH_RECEIPT_RETENTION_MS = 48 * 60 * 60 * 1000;

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private readonly expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  async upsertDevice(userId: number, dto: RegisterPushTokenDto) {
    if (!Expo.isExpoPushToken(dto.pushToken)) {
      throw new BadRequestException('Invalid Expo push token');
    }

    return this.prisma.pushDevice.upsert({
      where: {
        pushToken: dto.pushToken,
      },
      create: {
        userId,
        pushToken: dto.pushToken,
        platform: dto.platform,
      },
      update: {
        userId,
        platform: dto.platform,
      },
    });
  }

  async removeDevice(userId: number, dto: { pushToken: string }) {
    if (!Expo.isExpoPushToken(dto.pushToken)) {
      throw new BadRequestException('Invalid Expo push token');
    }

    await this.prisma.pushDevice.deleteMany({
      where: { userId, pushToken: dto.pushToken },
    });
  }

  async sendPushToUser(
    userId: number,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    await this.processPendingReceipts();

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
        await this.handleTickets(tickets, chunk, userId);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to send push notification to user ${userId}: ${
          error instanceof Error ? error.name : 'UnknownError'
        }`,
      );
    }
  }

  private async handleTickets(
    tickets: ExpoPushTicket[],
    messages: ExpoPushMessage[],
    userId: number,
  ) {
    const unregisteredTokens: string[] = [];
    const pendingReceipts: Array<{ receiptId: string; pushToken: string }> = [];

    tickets.forEach((ticket, index) => {
      const token = messages[index]?.to;

      if (ticket.status === 'ok') {
        if (typeof token === 'string') {
          pendingReceipts.push({ receiptId: ticket.id, pushToken: token });
        }
        return;
      }

      if (ticket.status === 'error') {
        this.logger.warn(
          `Push ticket error for user ${userId}: ${
            ticket.details?.error ?? 'UnknownError'
          }`,
        );

        if (ticket.details?.error === 'DeviceNotRegistered') {
          if (typeof token === 'string') {
            unregisteredTokens.push(token);
          }
        }
      }
    });

    if (unregisteredTokens.length) {
      await this.prisma.pushDevice.deleteMany({
        where: { pushToken: { in: unregisteredTokens } },
      });
    }

    if (pendingReceipts.length) {
      await this.prisma.pushReceipt.createMany({
        data: pendingReceipts,
        skipDuplicates: true,
      });
    }
  }

  private async processPendingReceipts() {
    const cutoff = new Date(Date.now() - PUSH_RECEIPT_RETENTION_MS);

    await this.prisma.pushReceipt.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    const pendingReceipts = await this.prisma.pushReceipt.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { receiptId: true, pushToken: true },
    });
    if (!pendingReceipts.length) return;

    const tokenByReceiptId = new Map(
      pendingReceipts.map(({ receiptId, pushToken }) => [receiptId, pushToken]),
    );
    const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(
      pendingReceipts.map(({ receiptId }) => receiptId),
    );

    for (const receiptIds of receiptIdChunks) {
      try {
        const receipts =
          await this.expo.getPushNotificationReceiptsAsync(receiptIds);
        await this.processReceiptChunk(receiptIds, receipts, tokenByReceiptId);
      } catch (error) {
        this.logger.warn(
          `Failed to process ${receiptIds.length} push receipt(s): ${
            error instanceof Error ? error.name : 'UnknownError'
          }`,
        );
      }
    }
  }

  private async processReceiptChunk(
    receiptIds: string[],
    receipts: Record<string, ExpoPushReceipt>,
    tokenByReceiptId: Map<string, string>,
  ) {
    const processedReceiptIds: string[] = [];
    const unregisteredTokens: string[] = [];

    for (const receiptId of receiptIds) {
      const receipt = receipts[receiptId];
      if (!receipt) continue;

      processedReceiptIds.push(receiptId);
      if (receipt.status === 'error') {
        this.logger.warn(
          `Push receipt error: ${receipt.details?.error ?? 'UnknownError'}`,
        );

        if (receipt.details?.error === 'DeviceNotRegistered') {
          const pushToken = tokenByReceiptId.get(receiptId);
          if (pushToken) unregisteredTokens.push(pushToken);
        }
      }
    }

    if (unregisteredTokens.length) {
      await this.prisma.pushDevice.deleteMany({
        where: { pushToken: { in: unregisteredTokens } },
      });
    }

    if (processedReceiptIds.length) {
      await this.prisma.pushReceipt.deleteMany({
        where: { receiptId: { in: processedReceiptIds } },
      });
    }
  }
}
