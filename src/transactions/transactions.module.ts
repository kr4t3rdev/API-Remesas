import { Module, forwardRef } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ReconciliationsModule } from '../reconciliations/reconciliations.module';
import { FxOperationsModule } from '../fx-operations/fx-operations.module';

@Module({
  imports: [forwardRef(() => ReconciliationsModule), FxOperationsModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
