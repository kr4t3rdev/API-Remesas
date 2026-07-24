export class Expo {
  static isExpoPushToken(token: string): boolean {
    return token.startsWith('ExpoPushToken[');
  }

  chunkPushNotifications(messages: unknown[]): unknown[][] {
    return [messages];
  }

  async sendPushNotificationsAsync(): Promise<unknown[]> {
    return [{ status: 'ok', id: 'mock-ticket-id' }];
  }

  chunkPushNotificationReceiptIds(ids: string[]): string[][] {
    return [ids];
  }

  async getPushNotificationReceiptsAsync(): Promise<Record<string, unknown>> {
    return {};
  }
}

export type ExpoPushMessage = {
  to: string;
  sound: 'default';
  title: string;
  body: string;
  data: Record<string, unknown>;
};

export type ExpoPushTicket =
  | { status: 'ok'; id: string }
  | { status: 'error'; message: string; details?: { error?: string } };