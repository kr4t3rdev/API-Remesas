import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionWebhookPayload } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private configService: ConfigService) {}

  async sendTransactionStatus(payload: TransactionWebhookPayload): Promise<void> {
    const webhookUrls = this.configService.get<string>('WEBHOOK_URLS');

    if (!webhookUrls) {
      this.logger.warn('WEBHOOK_URLS not configured, skipping webhook');
      return;
    }

    const urls = webhookUrls.split(',').map((url) => url.trim()).filter(Boolean);

    if (urls.length === 0) {
      this.logger.warn('No valid webhook URLs configured');
      return;
    }

    const promises = urls.map((url) => this.sendToUrl(url, payload));

    await Promise.allSettled(promises);
  }

  private async sendToUrl(url: string, payload: TransactionWebhookPayload): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.error(`Webhook failed for ${url}: ${response.status} ${response.statusText}`);
      } else {
        this.logger.log(`Webhook sent successfully to ${url}`);
      }
    } catch (error) {
      this.logger.error(`Webhook error for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
