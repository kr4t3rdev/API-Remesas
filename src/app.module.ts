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
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { WorkerPaymentsModule } from './worker-payments/worker-payments.module';
import { ExpenseItemsModule } from './expense-items/expense-items.module';
import { FxOperationsModule } from './fx-operations/fx-operations.module';
import { CashModule } from './cash/cash.module';
import { RemittancesModule } from './remittances/remittances.module';
import { HealthModule } from './health/health.module';
import { validateEnvironment } from './config/environment';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
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
    EmailModule,
    AdminModule,
    UploadModule,
    WorkerPaymentsModule,
    ExpenseItemsModule,
    FxOperationsModule,
    CashModule,
    RemittancesModule,
    HealthModule,
  ],
})
export class AppModule {}
