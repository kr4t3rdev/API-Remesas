import { Module } from '@nestjs/common';
import { ExpenseItemsService } from './expense-items.service';
import { ExpenseItemsController } from './expense-items.controller';

@Module({
  controllers: [ExpenseItemsController],
  providers: [ExpenseItemsService],
  exports: [ExpenseItemsService],
})
export class ExpenseItemsModule {}
