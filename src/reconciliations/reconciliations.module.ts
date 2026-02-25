import { Module } from '@nestjs/common';
import { ReconciliationsService } from './reconciliations.service';
import { ReconciliationsController } from './reconciliations.controller';

@Module({
  controllers: [ReconciliationsController],
  providers: [ReconciliationsService],
  exports: [ReconciliationsService],
})
export class ReconciliationsModule {}
