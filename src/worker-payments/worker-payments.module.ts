import { Module } from '@nestjs/common';
import { WorkerPaymentsService } from './worker-payments.service';
import { WorkerPaymentsController } from './worker-payments.controller';

@Module({
  controllers: [WorkerPaymentsController],
  providers: [WorkerPaymentsService],
  exports: [WorkerPaymentsService],
})
export class WorkerPaymentsModule {}
