# Graph Report - API  (2026-10-27)

## Corpus Check
- 679 files · ~248,759 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2868 nodes · 5475 edges · 200 communities (145 shown, 55 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.56)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fe9554fb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ExpenseItemsService
- WorkerPaymentsController
- CashService
- CreateExpenseDto
- CurrentUser
- fx-operations.service.ts
- devDependencies
- BankAccountsController
- CurrenciesController
- ReportsService
- dependencies
- API Endpoints
- plans.controller.ts
- ExchangeRatesService
- RateHistoryController
- SubscriptionsService
- current-user.decorator.ts
- NotificationsService
- CreateCashAdjustmentDto
- app.module.ts
- AuthController
- AdminController
- auth.controller.ts
- CreateAdminUserDto
- ReconciliationsController
- upload.controller.ts
- auth.service.ts
- TransactionsController
- AuthService
- transactions.controller.ts
- ChangePasswordDto
- admin.controller.ts
- AdminUserActionDto
- cash-audits.controller.ts
- .create
- JwtAuthGuard
- SubscriptionsService
- SubscriptionsService
- environment.ts
- .reactivateLicense
- EmailService
- RegisterDto
- NotificationsService
- HealthController
- AdminService
- RegisterPaymentDto
- environment.ts
- HealthController
- cash.tenant-isolation.spec.ts
- expenses.tenant-isolation.spec.ts
- admin.controller.ts
- nest-cli.json
- notifications.service.ts
- Controller
- ForgotPasswordDto
- subscriptions.service.ts
- seed.ts
- ResetPasswordDto
- QueryNotificationsDto
- CreateTransactionDto
- AddBalanceDto
- .findByCurrency
- AdminController
- .getAvatar
- JwtAuthGuard
- reports.module.ts
- ApiBearerAuth
- FxOperationsService
- SetPrimaryCurrencyDto
- ApiProperty
- IsString
- AdminUserActionPayloadDto
- JwtAuthGuard
- SubscriptionsService
- CreateRateHistoryDto
- .uploadAvatar
- UpdateAdminUserDto
- ForgotPasswordDto
- auth.service.ts
- .findByCurrency
- schema.d.ts
- RateHistoryController
- Body
- SuspendLicenseDto
- Type
- IsDateString
- IsString
- MaxLength
- Transform
- CodingKeys
- CodingKeys
- CodingKeys
- CodingKeys
- Hashable
- State
- ExpensesController
- CodingKey
- ExpenseItemReportDto
- CodingKeys
- State
- CodingKeys
- compilerOptions
- CashMovementDto.kt
- CodingKeys
- CodingKeys
- CodingKeys
- CodingKeys
- RemittancesController
- CashFlowReportCurrencyDto
- CodingKeys
- CodingKeys
- cash.swagger.ts
- State
- Swift5 API client for CashflowAPI
- ObjectiveProgressDto
- auth.module.ts
- shared-response.dto.ts
- AdminPlatformSeriesTotalsDto
- CodingKeys
- DailyReportProfitDto
- SubscriptionLicenseUserDto
- environment.ts
- CashClosingActorDto
- State
- State
- State
- TransactionDto.kt
- ExpensesService
- notifications.swagger.ts
- RegisterPushTokenDto
- Status
- Status
- Status
- Cycle
- openapi-shape.spec.ts
- Role
- SetPrimaryCurrencyDto
- subscriptions.swagger.ts
- CashClosingDto.kt
- ObjectiveDto
- tsconfig-paths
- AdminAuditLogDto.kt
- AdminPlatformSeriesDto.kt
- AdminPlatformSeriesTotalsDto.kt
- AdminUserActionResultDto.kt
- CashAuditDto.kt
- CashClosingActorDto.kt
- CashFlowReportCurrencyDto.kt
- CashFlowReportCurrencyRefDto.kt
- CashFlowReportDtoSwagger.kt
- CashFlowReportInflowsDto.kt
- CashFlowReportOutflowsDto.kt
- DailyReportExpenseDto.kt
- DailyReportProfitDto.kt
- ExpenseDto.kt
- ExpenseItemReportDto.kt
- ExpenseItemReportPeriodDto.kt
- NotificationDto.kt
- SubscriptionLicenseUserDto.kt
- WorkerDto.kt
- WorkerTransactionDto.kt
- Controller
- Param
- Post
- UseGuards
- PlansService
- UpdateWorkerDto
- reports.module.ts
- CurrencyReportDto.kt
- CurrencyReportRefDto.kt
- ExpensesByCurrencySummaryDto.kt
- ExpensesReportDto.kt
- PeriodReportDto.kt
- PeriodTransactionsByCurrencyDto.kt
- ProfitByCurrencySummaryDto.kt
- ProfitReportDto.kt
- ApiProperty
- RemittancesController
- PeriodReportDto
- CodingKeys
- HealthController
- ExpenseItemReportPeriodDto
- BankAccountsService
- LoginDto
- DailyReportExpenseDto
- ForgotPasswordDto
- FxOperationsService
- ChangePasswordDto
- SetPrimaryCurrencyDto
- IsBoolean
- IsInt
- IsOptional
- Max
- Min
- Transform
- Type

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 101 edges
2. `PrismaService` - 71 edges
3. `AnyCodable` - 64 edges
4. `Foundation` - 44 edges
5. `AdminApi` - 39 edges
6. `ReportsApi` - 33 edges
7. `ReportsService` - 27 edges
8. `AdminAPI` - 25 edges
9. `NotificationsService` - 25 edges
10. `AuthService` - 25 edges

## Surprising Connections (you probably didn't know these)
- `ExpensesReportDto` --references--> `DailyExpenseByCategoryDto`  [EXTRACTED]
  sdks/swift/Sources/CashflowAPI/Models/ExpensesReportDto.swift → src/reports/reports.swagger.ts
- `PeriodReportDto` --references--> `DailyExpenseByCategoryDto`  [EXTRACTED]
  sdks/swift/Sources/CashflowAPI/Models/PeriodReportDto.swift → src/reports/reports.swagger.ts
- `ProfitReportDto` --references--> `PeriodReportPeriodDto`  [EXTRACTED]
  sdks/swift/Sources/CashflowAPI/Models/ProfitReportDto.swift → src/reports/reports.swagger.ts
- `PeriodReportDto` --references--> `DailyBreakdownItemDto`  [EXTRACTED]
  sdks/swift/Sources/CashflowAPI/Models/PeriodReportDto.swift → src/reports/reports.swagger.ts
- `PeriodReportDto` --references--> `PeriodReportPeriodDto`  [EXTRACTED]
  sdks/swift/Sources/CashflowAPI/Models/PeriodReportDto.swift → src/reports/reports.swagger.ts

## Import Cycles
- None detected.

## Communities (200 total, 55 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (40): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+32 more)

### Community 1 - "WorkerPaymentsController"
Cohesion: 0.15
Nodes (9): IsIn, mockEmailService, mockPushNotificationsService, prisma, IsExpoPushToken(), RegisterPushTokenDto, PushNotificationsService, RegisterPushTokenDto (+1 more)

### Community 2 - "CashService"
Cohesion: 0.07
Nodes (33): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+25 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.06
Nodes (38): CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNotEmpty (+30 more)

### Community 4 - "CurrentUser"
Cohesion: 0.08
Nodes (30): CreateObjectiveDto, ApiProperty, ApiPropertyOptional, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+22 more)

### Community 5 - "fx-operations.service.ts"
Cohesion: 0.12
Nodes (16): scripts, build, lint, prisma:generate, prisma:migrate, prisma:seed, prisma:studio, start (+8 more)

### Community 6 - "devDependencies"
Cohesion: 0.08
Nodes (25): devDependencies, eslint, eslint-config-prettier, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing (+17 more)

### Community 7 - "BankAccountsController"
Cohesion: 0.18
Nodes (13): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+5 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.09
Nodes (24): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+16 more)

### Community 10 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, bcrypt, class-transformer, class-validator, decimal.js, @nestjs/common, @nestjs/config, @nestjs/core (+11 more)

### Community 11 - "API Endpoints"
Cohesion: 0.05
Nodes (41): 10. income_reconciliations, 11. rate_history, 12. objectives, 13. users, 1. currencies, 2. exchange_rates, 3. transactions, 4. cash_balances (+33 more)

### Community 12 - "plans.controller.ts"
Cohesion: 0.14
Nodes (14): PlansController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+6 more)

### Community 13 - "ExchangeRatesService"
Cohesion: 0.10
Nodes (16): ExchangeRatesController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+8 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.09
Nodes (25): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+17 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.18
Nodes (15): SubscriptionsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+7 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.18
Nodes (13): CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, mapTransferMovement(), assertSaleAvailable(), calculateSaleSnapshot() (+5 more)

### Community 17 - "NotificationsService"
Cohesion: 0.08
Nodes (34): AdminLicenseActionDto, AdminPlatformSeriesTotalsDto, AdminPlatformSeriesDto, Double, Encoder, AdminUserActionResultDto, CodingKeys, action (+26 more)

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.12
Nodes (14): ApiOperation, ApiQuery, ApiResponse, Body, Get, Post, Query, CreateCashAdjustmentDto (+6 more)

### Community 19 - "app.module.ts"
Cohesion: 0.14
Nodes (17): Global, BankAccountsModule, Module, CashModule, Module, CurrenciesModule, Module, DatabaseModule (+9 more)

### Community 20 - "AuthController"
Cohesion: 0.19
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 21 - "AdminController"
Cohesion: 0.20
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.12
Nodes (18): CaseIterable, AvatarUserDto, CodingKeys, avatarUrl, email, id, isActive, name (+10 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.17
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.20
Nodes (9): DepositDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.16
Nodes (13): CurrencyReportRefDto, CodingKeys, currency, currencyId, currentBalance, totalCompras, totalTransactions, totalVentas (+5 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.10
Nodes (19): AdminApi, AdminAuditLogDto, AdminExpiringLicenseDto, AdminKpisDto, AdminPlatformSeriesDto, AdminProfileStatsDto, AdminServiceMetricsDto, AdminUserActionDto (+11 more)

### Community 27 - "TransactionsController"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.22
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.12
Nodes (17): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+9 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.11
Nodes (16): AccountsReportDto, ApiClient, ApiResponse, AuditSummaryReportDtoSwagger, CashFlowReportDtoSwagger, CurrencyReportDto, DailyReportDto, ExpensesReportDto (+8 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.16
Nodes (27): ApiExtraModels, ApiProperty, AccountReportItemDto, AccountsReportDto, AuditSummaryReportDtoSwagger, CashFlowReportCurrencyDto, CashFlowReportCurrencyRefDto, CashFlowReportDtoSwagger (+19 more)

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.12
Nodes (15): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+7 more)

### Community 34 - ".create"
Cohesion: 0.11
Nodes (23): CurrentUser, Max, AdminController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags (+15 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.13
Nodes (16): Request, AuthController, ApiBearerAuth, ApiResponse, ApiTags, Controller, Delete, Get (+8 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.06
Nodes (33): ApiBearerAuth, ApiBody, ApiClient, ApiConsumes, ApiResponse, ApiTags, Controller, Get (+25 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.14
Nodes (16): CurrentUser, ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get (+8 more)

### Community 39 - "environment.ts"
Cohesion: 0.10
Nodes (19): ReportsModule, Module, AccountReportItem, AuditSummaryReportDto, CurrencyReportDto, DailyBreakdownItem, DailyExpenseByCategory, DailyExpenseCategorySummary (+11 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.13
Nodes (11): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+3 more)

### Community 42 - "RegisterDto"
Cohesion: 0.12
Nodes (15): CreateFxTransferDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional (+7 more)

### Community 43 - "NotificationsService"
Cohesion: 0.13
Nodes (13): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+5 more)

### Community 44 - "HealthController"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.26
Nodes (6): EmailResult, SendEmailDto, EmailModule, Module, EmailService, Injectable

### Community 47 - "environment.ts"
Cohesion: 0.14
Nodes (20): AdminAPI, AdminAuditLogDto, AdminExpiringLicenseDto, AdminKpisDto, AdminPlatformSeriesDto, AdminProfileStatsDto, AdminServiceMetricsDto, AdminUserActionDto (+12 more)

### Community 48 - "HealthController"
Cohesion: 0.26
Nodes (7): ApiOperation, Body, Post, ApiProperty, IsNotEmpty, IsString, VerifyEmailDto

### Community 49 - "cash.tenant-isolation.spec.ts"
Cohesion: 0.16
Nodes (13): ExpensesByCurrencySummaryDto, CodingKeys, byCategory, byCurrency, expenses, total, totalAmount, totalAmountInCup (+5 more)

### Community 50 - "expenses.tenant-isolation.spec.ts"
Cohesion: 0.15
Nodes (16): Cycle, annual, monthly, semiannual, State, active, cancelled, expired (+8 more)

### Community 51 - "admin.controller.ts"
Cohesion: 0.07
Nodes (30): CodingKeys, amount, createdAt, currency, currencyId, destinationBankAccountId, destinationType, id (+22 more)

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "notifications.service.ts"
Cohesion: 0.47
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 54 - "Controller"
Cohesion: 0.20
Nodes (5): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 55 - "ForgotPasswordDto"
Cohesion: 0.18
Nodes (8): Catch, FxDomainExceptionFilter, FxOperationsController, ApiBearerAuth, ApiTags, Controller, UseFilters, UseGuards

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.22
Nodes (8): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString

### Community 60 - "ResetPasswordDto"
Cohesion: 0.11
Nodes (18): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength, ResendVerificationDto, ApiProperty (+10 more)

### Community 62 - "QueryNotificationsDto"
Cohesion: 0.15
Nodes (11): CashAuditsModule, Module, CreateCashAuditDto, ApiProperty, ApiPropertyOptional, IsInt, IsNumber, IsOptional (+3 more)

### Community 63 - "CreateTransactionDto"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 64 - "AddBalanceDto"
Cohesion: 0.20
Nodes (11): CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional, IsString, Min (+3 more)

### Community 65 - ".findByCurrency"
Cohesion: 0.19
Nodes (5): AuthService, Injectable, Injectable, VerificationTokenResult, VerificationTokenService

### Community 66 - "AdminController"
Cohesion: 0.24
Nodes (8): CodingKeys, code, id, name, CurrencyReportRefDto, Double, Encoder, String

### Community 67 - ".getAvatar"
Cohesion: 0.16
Nodes (18): Int, ReportsAPI, AccountsReportDto, AuditSummaryReportDtoSwagger, CashFlowReportDtoSwagger, CurrencyReportDto, DailyReportDto, DispatchQueue (+10 more)

### Community 68 - "JwtAuthGuard"
Cohesion: 0.40
Nodes (4): RenewLicenseDto, ApiProperty, IsEnum, IsInt

### Community 69 - "reports.module.ts"
Cohesion: 0.16
Nodes (13): ApiClient, ApiResponse, AssignLicenseDto, java, kotlin, RegisterPaymentDto, RenewLicenseDto, RequestConfig (+5 more)

### Community 70 - "ApiBearerAuth"
Cohesion: 0.24
Nodes (14): SubscriptionsAPI, AssignLicenseDto, DispatchQueue, Double, Error, RegisterPaymentDto, RenewLicenseDto, RequestBuilder (+6 more)

### Community 71 - "FxOperationsService"
Cohesion: 0.24
Nodes (8): CodingKeys, compras, count, ventas, PeriodTransactionsByCurrencyDto, Double, Encoder, String

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.15
Nodes (3): AdminService, Injectable, AdminUserControlActionType

### Community 75 - "AdminUserActionPayloadDto"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 76 - "JwtAuthGuard"
Cohesion: 0.14
Nodes (14): CodingKeys, amount, category, createdAt, currency, currencyId, date, description (+6 more)

### Community 78 - "CreateRateHistoryDto"
Cohesion: 0.10
Nodes (32): Codable, Identifiable, CashMovementDto, DestinationType, bankAccount, cash, Direction, _in (+24 more)

### Community 80 - "UpdateAdminUserDto"
Cohesion: 0.22
Nodes (7): ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 81 - "ForgotPasswordDto"
Cohesion: 0.25
Nodes (7): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto, ExchangeRatesModule, Module

### Community 82 - "auth.service.ts"
Cohesion: 0.11
Nodes (11): JwtStrategy, Injectable, accounts, scopedFindFirst, closingA, closingB, PrismaService, Injectable (+3 more)

### Community 83 - ".findByCurrency"
Cohesion: 0.09
Nodes (25): CodingKeys, accumulatedProfit, balance, balances, createdAt, id, initials, name (+17 more)

### Community 84 - "schema.d.ts"
Cohesion: 0.33
Nodes (5): components, $defs, operations, paths, webhooks

### Community 85 - "RateHistoryController"
Cohesion: 0.09
Nodes (23): CodingKeys, bankAccount, bankAccountId, createdAt, currency, currencyId, currentAmount, description (+15 more)

### Community 86 - "Body"
Cohesion: 0.13
Nodes (12): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+4 more)

### Community 87 - "SuspendLicenseDto"
Cohesion: 0.40
Nodes (4): SuspendLicenseDto, ApiPropertyOptional, IsOptional, IsString

### Community 93 - "CodingKeys"
Cohesion: 0.10
Nodes (22): CashClosingActorDto, CashClosingDto, CodingKeys, actualBalance, businessDate, closedAt, closedBy, closedById (+14 more)

### Community 94 - "CodingKeys"
Cohesion: 0.10
Nodes (21): AdminExpiringLicenseDto, CodingKeys, createdAt, expiresAt, id, plan, planId, state (+13 more)

### Community 95 - "CodingKeys"
Cohesion: 0.11
Nodes (20): CodingKeys, createdAt, duplicate, id, idempotencyKey, movements, provider, sourceId (+12 more)

### Community 96 - "CodingKeys"
Cohesion: 0.09
Nodes (21): CodingKey, AdminPlatformSeriesTotalsDto, CodingKeys, billingCup, churn, newUsers, Double, Encoder (+13 more)

### Community 97 - "Hashable"
Cohesion: 0.07
Nodes (29): AnyCodable, Foundation, AdminAuditLogDto, Date, Double, Encoder, String, CodingKeys (+21 more)

### Community 98 - "State"
Cohesion: 0.11
Nodes (19): AdminLicenseActionDto, CodingKeys, createdAt, expiresAt, id, planId, state, updatedAt (+11 more)

### Community 99 - "ExpensesController"
Cohesion: 0.27
Nodes (7): CodingKeys, count, total, ExpensesByCurrencySummaryDto, Double, Encoder, String

### Community 100 - "CodingKey"
Cohesion: 0.27
Nodes (7): CodingKeys, count, marginProfit, ProfitByCurrencySummaryDto, Double, Encoder, String

### Community 101 - "ExpenseItemReportDto"
Cohesion: 0.14
Nodes (16): ExpenseItemReportPeriodDto, CodingKeys, average, count, items, period, total, ExpenseItemReportDto (+8 more)

### Community 102 - "CodingKeys"
Cohesion: 0.13
Nodes (17): CashAuditDto, CodingKeys, actualBalance, auditorName, createdAt, currency, currencyId, difference (+9 more)

### Community 103 - "State"
Cohesion: 0.13
Nodes (16): AdminUserDetailLicenseDto, CodingKeys, expiresAt, id, planId, state, State, active (+8 more)

### Community 104 - "CodingKeys"
Cohesion: 0.22
Nodes (4): RolesGuard, Injectable, SubscriptionsModule, Module

### Community 105 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+10 more)

### Community 106 - "CashMovementDto.kt"
Cohesion: 0.11
Nodes (17): CashMovementDto, DestinationType, BANK_ACCOUNT, CASH, Direction, IN, OUT, Kind (+9 more)

### Community 107 - "CodingKeys"
Cohesion: 0.14
Nodes (15): CodingKeys, channel, createdAt, id, message, payload, readAt, title (+7 more)

### Community 108 - "CodingKeys"
Cohesion: 0.12
Nodes (17): CodingKeys, amount, cashAmount, createdAt, currency, description, destinationBankAccountId, destinationType (+9 more)

### Community 109 - "CodingKeys"
Cohesion: 0.08
Nodes (25): CodingKeys, bankAccount, bankAccountId, createdAt, currency, currencyId, currentAmount, description (+17 more)

### Community 110 - "CodingKeys"
Cohesion: 0.13
Nodes (15): CodingKeys, cancelledAt, createdAt, cycle, expiresAt, graceUntil, id, lastPaymentAt (+7 more)

### Community 111 - "RemittancesController"
Cohesion: 0.22
Nodes (14): Bool, DispatchQueue, Double, Error, RequestBuilder, RequestTask, NotificationsAPI, NotificationCountDto (+6 more)

### Community 112 - "CashFlowReportCurrencyDto"
Cohesion: 0.20
Nodes (11): CashFlowReportCurrencyRefDto, CashFlowReportInflowsDto, CashFlowReportOutflowsDto, CashFlowReportCurrencyDto, CodingKeys, balance, currency, inflows (+3 more)

### Community 113 - "CodingKeys"
Cohesion: 0.18
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+2 more)

### Community 114 - "CodingKeys"
Cohesion: 0.25
Nodes (17): IsDateString, IsString, MaxLength, GetAuditSummaryDto, GetCashFlowReportDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto (+9 more)

### Community 115 - "cash.swagger.ts"
Cohesion: 0.27
Nodes (13): CashAdjustmentDto, CashAuditDto, CashAuditorDto, CashBalanceDto, CashClosingActorDto, CashClosingDto, CashMovementDto, CashOverviewDto (+5 more)

### Community 116 - "State"
Cohesion: 0.15
Nodes (12): Cycle, ANNUAL, MONTHLY, SEMIANNUAL, State, ACTIVE, CANCELLED, EXPIRED (+4 more)

### Community 117 - "Swift5 API client for CashflowAPI"
Cohesion: 0.15
Nodes (12): Author, bearer, Carthage, CocoaPods, Documentation for API Endpoints, Documentation For Authorization, Documentation For Models, How do I implement bearer token authentication with URLSession on the Swift 5 API client? (+4 more)

### Community 118 - "ObjectiveProgressDto"
Cohesion: 0.33
Nodes (5): IsBoolean, IsInt, IsOptional, Min, QueryNotificationsDto

### Community 119 - "auth.module.ts"
Cohesion: 0.33
Nodes (6): AdminModule, Module, AuthModule, Module, NotificationsModule, Module

### Community 120 - "shared-response.dto.ts"
Cohesion: 0.30
Nodes (11): ExpenseDto, ExpenseListDto, FxOpenPositionResultDto, FxTransferResultDto, PlanDto, ReconcileIssueDto, ReconcilePositionDto, RemittanceDto (+3 more)

### Community 121 - "AdminPlatformSeriesTotalsDto"
Cohesion: 0.13
Nodes (16): CodingKeys, amount, balanceAfter, balanceBefore, createdAt, currencyId, description, id (+8 more)

### Community 122 - "CodingKeys"
Cohesion: 0.22
Nodes (8): CashFlowReportOutflowsDto, CodingKeys, adjustments, expenses, total, transactions, Encoder, String

### Community 123 - "DailyReportProfitDto"
Cohesion: 0.24
Nodes (8): CodingKeys, margin, marginProfit, net, DailyReportProfitDto, Double, Encoder, String

### Community 124 - "SubscriptionLicenseUserDto"
Cohesion: 0.08
Nodes (23): Hashable, JSONEncodable, CashFlowReportCurrencyRefDto, CodingKeys, code, symbol, Encoder, String (+15 more)

### Community 125 - "environment.ts"
Cohesion: 0.33
Nodes (8): AppModule, Module, assertHttpUrl(), DEVELOPMENT_ORIGINS, Environment, parseCorsOrigins(), validateEnvironment(), bootstrap()

### Community 126 - "CashClosingActorDto"
Cohesion: 0.27
Nodes (7): CashClosingActorDto, CodingKeys, id, name, Double, Encoder, String

### Community 127 - "State"
Cohesion: 0.22
Nodes (8): AdminExpiringLicenseDto, State, ACTIVE, CANCELLED, EXPIRED, GRACE, SUSPENDED, TRIAL

### Community 128 - "State"
Cohesion: 0.22
Nodes (8): AdminLicenseActionDto, State, ACTIVE, CANCELLED, EXPIRED, GRACE, SUSPENDED, TRIAL

### Community 129 - "State"
Cohesion: 0.22
Nodes (8): AdminUserDetailLicenseDto, State, ACTIVE, CANCELLED, EXPIRED, GRACE, SUSPENDED, TRIAL

### Community 130 - "TransactionDto.kt"
Cohesion: 0.25
Nodes (7): OperationKind, REMITTANCE, TRANSFER, TransactionDto, Type, COMPRA, VENTA

### Community 131 - "ExpensesService"
Cohesion: 0.20
Nodes (9): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 132 - "notifications.swagger.ts"
Cohesion: 0.43
Nodes (7): NotificationCountDto, NotificationDto, NotificationListDto, NotificationListMetaDto, NotificationOkDto, PushDeviceDto, ApiProperty

### Community 133 - "RegisterPushTokenDto"
Cohesion: 0.16
Nodes (13): ProfitByCurrencySummaryDto, CodingKeys, byCurrency, netFlow, period, totalCompras, totalMarginProfit, totalVentas (+5 more)

### Community 134 - "Status"
Cohesion: 0.33
Nodes (5): ObjectiveDto, Status, ACTIVO, COMPLETADO, PAUSADO

### Community 135 - "Status"
Cohesion: 0.33
Nodes (5): ObjectiveProgressDto, Status, ACTIVO, COMPLETADO, PAUSADO

### Community 136 - "Status"
Cohesion: 0.33
Nodes (5): RemittanceDto, Status, COMPLETED, FAILED, PENDING

### Community 137 - "Cycle"
Cohesion: 0.33
Nodes (5): Cycle, ANNUAL, MONTHLY, SEMIANNUAL, SubscriptionPaymentDto

### Community 138 - "openapi-shape.spec.ts"
Cohesion: 0.29
Nodes (6): contract, FREE_FORM_ALLOWLIST, OpenApiDocument, REQUIRED_QUERY_ALLOWLIST, SchemaDefinition, STRING_ARRAY_ALLOWLIST

### Community 139 - "Role"
Cohesion: 0.40
Nodes (4): AvatarUserDto, Role, ADMIN, USER

### Community 140 - "SetPrimaryCurrencyDto"
Cohesion: 0.22
Nodes (10): CreateBankAccountDto, ApiProperty, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+2 more)

### Community 141 - "subscriptions.swagger.ts"
Cohesion: 0.60
Nodes (4): SubscriptionLicenseDto, SubscriptionLicenseUserDto, SubscriptionPaymentDto, ApiProperty

### Community 142 - "CashClosingDto.kt"
Cohesion: 0.50
Nodes (3): CashClosingDto, Status, CLOSED

### Community 143 - "ObjectiveDto"
Cohesion: 0.83
Nodes (3): ObjectiveDto, ObjectiveProgressDto, ApiProperty

### Community 144 - "tsconfig-paths"
Cohesion: 0.67
Nodes (3): tsconfig-paths, paths, @/*

### Community 170 - "UpdateWorkerDto"
Cohesion: 0.22
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 171 - "reports.module.ts"
Cohesion: 0.19
Nodes (9): CashAdjustmentsController, ApiBearerAuth, ApiTags, Controller, UseGuards, CashAdjustmentsModule, Module, CashAdjustmentsService (+1 more)

### Community 181 - "RemittancesController"
Cohesion: 0.17
Nodes (10): RemittancesController, ApiBearerAuth, ApiTags, Body, Controller, Get, Headers, Param (+2 more)

### Community 182 - "PeriodReportDto"
Cohesion: 0.22
Nodes (10): CashFlowReportCurrencyDto, PeriodTransactionsByCurrencyDto, CashFlowReportDtoSwagger, Encoder, PeriodReportDto, Encoder, String, DailyBreakdownItemDto (+2 more)

### Community 183 - "CodingKeys"
Cohesion: 0.20
Nodes (10): CodingKeys, action, actorUserId, createdAt, id, metadata, newValue, previousValue (+2 more)

### Community 184 - "HealthController"
Cohesion: 0.24
Nodes (5): HealthController, Controller, Get, HealthModule, Module

### Community 185 - "ExpenseItemReportPeriodDto"
Cohesion: 0.28
Nodes (6): CodingKeys, end, start, ExpenseItemReportPeriodDto, Encoder, String

### Community 187 - "LoginDto"
Cohesion: 0.29
Nodes (5): LoginDto, ApiProperty, IsEmail, IsString, MinLength

### Community 188 - "DailyReportExpenseDto"
Cohesion: 0.43
Nodes (5): DailyReportExpenseDto, Double, Encoder, String, DailyExpenseByCategoryDto

### Community 189 - "ForgotPasswordDto"
Cohesion: 0.33
Nodes (4): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty

### Community 190 - "FxOperationsService"
Cohesion: 0.29
Nodes (3): FxOperationsService, Injectable, rows

### Community 191 - "ChangePasswordDto"
Cohesion: 0.40
Nodes (5): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength

### Community 192 - "SetPrimaryCurrencyDto"
Cohesion: 0.40
Nodes (4): SetPrimaryCurrencyDto, ApiProperty, IsInt, IsNotEmpty

## Knowledge Gaps
- **626 isolated node(s):** `paths`, `webhooks`, `components`, `$defs`, `operations` (+621 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DailyExpenseByCategoryDto` connect `DailyReportExpenseDto` to `AdminUserActionDto`, `cash.tenant-isolation.spec.ts`, `PeriodReportDto`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Why does `AnyCodable` connect `Hashable` to `RegisterPushTokenDto`, `NotificationsService`, `auth.controller.ts`, `upload.controller.ts`, `environment.ts`, `cash.tenant-isolation.spec.ts`, `expenses.tenant-isolation.spec.ts`, `admin.controller.ts`, `ExpenseItemReportPeriodDto`, `AdminController`, `.getAvatar`, `FxOperationsService`, `CreateRateHistoryDto`, `.findByCurrency`, `RateHistoryController`, `CodingKeys`, `CodingKeys`, `CodingKeys`, `CodingKeys`, `State`, `ExpensesController`, `CodingKey`, `ExpenseItemReportDto`, `CodingKeys`, `State`, `CodingKeys`, `CodingKeys`, `CashFlowReportCurrencyDto`, `AdminPlatformSeriesTotalsDto`, `CodingKeys`, `DailyReportProfitDto`, `SubscriptionLicenseUserDto`, `CashClosingActorDto`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **Why does `CurrentUser` connect `SubscriptionsService` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `SetPrimaryCurrencyDto`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `AuthController`, `TransactionsController`, `transactions.controller.ts`, `AdminUserActionDto`, `cash-audits.controller.ts`, `.reactivateLicense`, `RegisterDto`, `reports.module.ts`, `NotificationsService`, `UpdateWorkerDto`, `RemittancesController`, `ForgotPasswordDto`, `QueryNotificationsDto`, `ForgotPasswordDto`, `Body`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **What connects `paths`, `webhooks`, `components` to the rest of the system?**
  _626 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.05704365079365079 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.06078316773816481 - nodes in this community are weakly interconnected._