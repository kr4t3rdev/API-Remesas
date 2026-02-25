import { Module } from '@nestjs/common';
import { RateHistoryService } from './rate-history.service';
import { RateHistoryController } from './rate-history.controller';

@Module({
  controllers: [RateHistoryController],
  providers: [RateHistoryService],
  exports: [RateHistoryService],
})
export class RateHistoryModule {}
