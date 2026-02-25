import { Module } from '@nestjs/common';
import { CashBalancesService } from './cash-balances.service';
import { CashBalancesController } from './cash-balances.controller';

@Module({
  controllers: [CashBalancesController],
  providers: [CashBalancesService],
  exports: [CashBalancesService],
})
export class CashBalancesModule {}
