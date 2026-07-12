import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { FxOperationsController } from './fx-operations.controller';
import { FxOperationsService } from './fx-operations.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FxOperationsController],
  providers: [FxOperationsService],
  exports: [FxOperationsService],
})
export class FxOperationsModule {}
