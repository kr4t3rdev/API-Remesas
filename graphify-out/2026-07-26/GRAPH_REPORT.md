# Graph Report - API  (2026-07-25)

## Corpus Check
- 206 files · ~57,009 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1555 nodes · 3136 edges · 75 communities (70 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ec826c9e`
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
- auth.service.ts
- Body
- ObjectivesModule
- Module

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 107 edges
2. `PrismaService` - 79 edges
3. `ReportsService` - 27 edges
4. `AdminService` - 26 edges
5. `AuthService` - 25 edges
6. `JwtAuthGuard` - 25 edges
7. `NotificationsService` - 25 edges
8. `AdminController` - 22 edges
9. `WorkerPaymentsService` - 21 edges
10. `SubscriptionsService` - 20 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (75 total, 5 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.15
Nodes (15): ApiParam, ExpenseItemsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller (+7 more)

### Community 1 - "WorkerPaymentsController"
Cohesion: 0.23
Nodes (3): PushNotificationsService, RegisterPushTokenDto, Injectable

### Community 2 - "CashService"
Cohesion: 0.06
Nodes (37): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+29 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.06
Nodes (39): CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNotEmpty (+31 more)

### Community 4 - "CurrentUser"
Cohesion: 0.08
Nodes (30): CreateObjectiveDto, ApiProperty, ApiPropertyOptional, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+22 more)

### Community 5 - "fx-operations.service.ts"
Cohesion: 0.12
Nodes (16): scripts, build, lint, prisma:generate, prisma:migrate, prisma:seed, prisma:studio, start (+8 more)

### Community 6 - "devDependencies"
Cohesion: 0.04
Nodes (46): devDependencies, eslint, eslint-config-prettier, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing (+38 more)

### Community 7 - "BankAccountsController"
Cohesion: 0.08
Nodes (27): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+19 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.08
Nodes (26): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+18 more)

### Community 9 - "ReportsService"
Cohesion: 0.12
Nodes (11): ReportsModule, Module, ReportsService, Injectable, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyReportDto (+3 more)

### Community 10 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, bcrypt, class-transformer, class-validator, decimal.js, @nestjs/common, @nestjs/config, @nestjs/core (+11 more)

### Community 11 - "API Endpoints"
Cohesion: 0.05
Nodes (41): 10. income_reconciliations, 11. rate_history, 12. objectives, 13. users, 1. currencies, 2. exchange_rates, 3. transactions, 4. cash_balances (+33 more)

### Community 12 - "plans.controller.ts"
Cohesion: 0.11
Nodes (16): PlansController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+8 more)

### Community 13 - "ExchangeRatesService"
Cohesion: 0.08
Nodes (23): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto, ExchangeRatesController, ApiBearerAuth, ApiOperation (+15 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.08
Nodes (25): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+17 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.15
Nodes (13): SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+5 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.06
Nodes (38): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, mapTransferMovement(), assertSaleAvailable() (+30 more)

### Community 17 - "NotificationsService"
Cohesion: 0.10
Nodes (18): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional, CreateUserDto, ApiProperty, IsEmail, IsEnum (+10 more)

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.08
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.21
Nodes (11): Global, DatabaseModule, Module, FxOperationsModule, Module, RemittancesModule, Module, TransactionsModule (+3 more)

### Community 20 - "AuthController"
Cohesion: 0.19
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 21 - "AdminController"
Cohesion: 0.28
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.17
Nodes (7): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty, Injectable, VerificationTokenResult, VerificationTokenService

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.12
Nodes (13): CreateWorkerDto, ApiProperty, IsOptional, IsString, DepositDto, ApiProperty, ApiPropertyOptional, IsEnum (+5 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.27
Nodes (13): GetAuditSummaryDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, IsDateString, IsInt (+5 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.33
Nodes (5): LoginDto, ApiProperty, IsEmail, IsString, MinLength

### Community 27 - "TransactionsController"
Cohesion: 0.06
Nodes (30): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+22 more)

### Community 28 - "AuthService"
Cohesion: 0.15
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.11
Nodes (16): CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength (+8 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.16
Nodes (12): Roles(), RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber (+4 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.18
Nodes (23): AccountReportItemDto, AccountsReportDto, AuditSummaryReportDtoSwagger, CashFlowReportDtoSwagger, CurrencyReportDto, DailyBreakdownItemDto, DailyExpenseByCategoryDto, DailyReportDto (+15 more)

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.08
Nodes (24): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 34 - ".create"
Cohesion: 0.05
Nodes (38): IsISO8601, IsObject, AdminController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller (+30 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.17
Nodes (13): Request, AuthController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Delete (+5 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.11
Nodes (13): Res, Controller, Get, Param, Post, UseGuards, UploadController, Module (+5 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.15
Nodes (16): GetCashFlowReportDto, GetPeriodReportDto, GetProfitReportDto, ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags (+8 more)

### Community 39 - "environment.ts"
Cohesion: 0.15
Nodes (12): AccountReportItem, DailyBreakdownItem, DailyExpenseByCategory, DailyExpenseCategorySummary, ExpensesByCurrencySummary, FxPerformanceMovement, FxPerformancePosition, ObjectiveReportItem (+4 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.08
Nodes (21): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+13 more)

### Community 42 - "RegisterDto"
Cohesion: 0.23
Nodes (4): ExpenseItemsModule, Module, ExpenseItemsService, Injectable

### Community 43 - "NotificationsService"
Cohesion: 0.13
Nodes (13): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+5 more)

### Community 44 - "HealthController"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 45 - "AdminService"
Cohesion: 0.29
Nodes (6): PlatformSeriesQueryDto, IsInt, IsOptional, Max, Min, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.19
Nodes (7): mockEmailService, mockPushNotificationsService, prisma, EmailResult, SendEmailDto, EmailService, Injectable

### Community 47 - "environment.ts"
Cohesion: 0.33
Nodes (8): AppModule, Module, assertHttpUrl(), DEVELOPMENT_ORIGINS, Environment, parseCorsOrigins(), validateEnvironment(), bootstrap()

### Community 48 - "HealthController"
Cohesion: 0.23
Nodes (4): Body, Post, AuthService, Injectable

### Community 49 - "cash.tenant-isolation.spec.ts"
Cohesion: 0.24
Nodes (5): HealthController, Controller, Get, HealthModule, Module

### Community 50 - "expenses.tenant-isolation.spec.ts"
Cohesion: 0.20
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+2 more)

### Community 51 - "admin.controller.ts"
Cohesion: 0.22
Nodes (9): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "notifications.service.ts"
Cohesion: 0.48
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 54 - "Controller"
Cohesion: 0.20
Nodes (5): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 55 - "ForgotPasswordDto"
Cohesion: 0.24
Nodes (4): SubscriptionsModule, Module, SubscriptionsService, Injectable

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.12
Nodes (16): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString (+8 more)

### Community 60 - "ResetPasswordDto"
Cohesion: 0.25
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 62 - "QueryNotificationsDto"
Cohesion: 0.15
Nodes (13): IsIn, QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform (+5 more)

### Community 63 - "CreateTransactionDto"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 64 - "AddBalanceDto"
Cohesion: 0.29
Nodes (5): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength

### Community 65 - ".findByCurrency"
Cohesion: 0.29
Nodes (4): ResendVerificationDto, ApiProperty, IsEmail, IsNotEmpty

### Community 66 - "AdminController"
Cohesion: 0.33
Nodes (5): QueryExpenseItemDto, ApiPropertyOptional, IsDateString, IsOptional, IsString

### Community 67 - ".getAvatar"
Cohesion: 0.50
Nodes (4): ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 68 - "JwtAuthGuard"
Cohesion: 0.35
Nodes (3): CurrentUser, JwtAuthGuard, Injectable

### Community 82 - "auth.service.ts"
Cohesion: 0.15
Nodes (7): JwtStrategy, Injectable, PrismaService, Injectable, CYCLE_DAYS, CYCLE_USD, rows

### Community 86 - "Body"
Cohesion: 0.13
Nodes (12): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+4 more)

### Community 103 - "Module"
Cohesion: 0.22
Nodes (8): AdminModule, Module, AuthModule, Module, EmailModule, Module, NotificationsModule, Module

## Knowledge Gaps
- **167 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `JwtAuthGuard` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `ExchangeRatesService`, `RateHistoryController`, `current-user.decorator.ts`, `CreateCashAdjustmentDto`, `AuthController`, `TransactionsController`, `transactions.controller.ts`, `ChangePasswordDto`, `AdminUserActionDto`, `cash-audits.controller.ts`, `.create`, `SubscriptionsService`, `SubscriptionsService`, `.reactivateLicense`, `NotificationsService`, `QueryNotificationsDto`, `AdminController`, `Body`?**
  _High betweenness centrality (0.351) - this node is a cross-community bridge._
- **Why does `Expo` connect `Controller` to `WorkerPaymentsController`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `auth.service.ts` to `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `plans.controller.ts`, `ExchangeRatesService`, `RateHistoryController`, `current-user.decorator.ts`, `CreateCashAdjustmentDto`, `app.module.ts`, `AdminController`, `auth.controller.ts`, `ReconciliationsController`, `TransactionsController`, `ChangePasswordDto`, `cash-audits.controller.ts`, `.create`, `SubscriptionsService`, `.reactivateLicense`, `EmailService`, `RegisterDto`, `NotificationsService`, `RegisterPaymentDto`, `cash.tenant-isolation.spec.ts`, `notifications.service.ts`, `ForgotPasswordDto`, `JwtAuthGuard`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.058699101004759384 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.05711263881544157 - nodes in this community are weakly interconnected._
- **Should `CurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.07857142857142857 - nodes in this community are weakly interconnected._