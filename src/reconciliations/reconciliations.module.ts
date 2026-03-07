import { Module, forwardRef } from '@nestjs/common';
import { ReconciliationsService } from './reconciliations.service';
import { ReconciliationsController } from './reconciliations.controller';
import { WebhookModule } from '../webhook/webhook.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [forwardRef(() => WebhookModule), SubscriptionsModule],
  controllers: [ReconciliationsController],
  providers: [ReconciliationsService],
  exports: [ReconciliationsService],
})
export class ReconciliationsModule {}
