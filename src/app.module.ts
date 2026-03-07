import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CashBalancesModule } from './cash-balances/cash-balances.module';
import { CashAuditsModule } from './cash-audits/cash-audits.module';
import { CashAdjustmentsModule } from './cash-adjustments/cash-adjustments.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReconciliationsModule } from './reconciliations/reconciliations.module';
import { ObjectivesModule } from './objectives/objectives.module';
import { ReportsModule } from './reports/reports.module';
import { RateHistoryModule } from './rate-history/rate-history.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    CurrenciesModule,
    ExchangeRatesModule,
    TransactionsModule,
    CashBalancesModule,
    CashAuditsModule,
    CashAdjustmentsModule,
    BankAccountsModule,
    ExpensesModule,
    ReconciliationsModule,
    ObjectivesModule,
    ReportsModule,
    RateHistoryModule,
    PlansModule,
    SubscriptionsModule,
    NotificationsModule,
    AdminModule,
  ],
})
export class AppModule {}
