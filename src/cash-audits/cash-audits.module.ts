import { Module } from '@nestjs/common';
import { CashAuditsService } from './cash-audits.service';
import { CashAuditsController } from './cash-audits.controller';

@Module({
  controllers: [CashAuditsController],
  providers: [CashAuditsService],
  exports: [CashAuditsService],
})
export class CashAuditsModule {}
