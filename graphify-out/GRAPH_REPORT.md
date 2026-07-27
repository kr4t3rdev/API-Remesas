# Graph Report - API  (2026-07-26)

## Corpus Check
- 206 files · ~57,009 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1557 nodes · 3115 edges · 77 communities (70 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1720657a`
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
- auth.service.ts
- Body

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 107 edges
2. `PrismaService` - 73 edges
3. `ReportsService` - 27 edges
4. `AdminService` - 26 edges
5. `NotificationsService` - 25 edges
6. `AuthService` - 25 edges
7. `JwtAuthGuard` - 25 edges
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

## Communities (77 total, 7 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (40): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+32 more)

### Community 2 - "CashService"
Cohesion: 0.06
Nodes (35): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+27 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.12
Nodes (20): CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNotEmpty (+12 more)

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
Cohesion: 0.09
Nodes (26): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+18 more)

### Community 9 - "ReportsService"
Cohesion: 0.17
Nodes (5): ReportsService, Injectable, DailyReportDto, ExpensesReportDto, PeriodReportDto

### Community 10 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, bcrypt, class-transformer, class-validator, decimal.js, @nestjs/common, @nestjs/config, @nestjs/core (+11 more)

### Community 11 - "API Endpoints"
Cohesion: 0.05
Nodes (41): 10. income_reconciliations, 11. rate_history, 12. objectives, 13. users, 1. currencies, 2. exchange_rates, 3. transactions, 4. cash_balances (+33 more)

### Community 12 - "plans.controller.ts"
Cohesion: 0.15
Nodes (14): PlansController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+6 more)

### Community 13 - "ExchangeRatesService"
Cohesion: 0.08
Nodes (23): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto, ExchangeRatesController, ApiBearerAuth, ApiOperation (+15 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.09
Nodes (25): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+17 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.09
Nodes (21): SuspendLicenseDto, ApiPropertyOptional, IsOptional, IsString, SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags (+13 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.18
Nodes (14): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, assertSaleAvailable(), calculateSaleSnapshot() (+6 more)

### Community 17 - "NotificationsService"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.09
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.07
Nodes (35): Global, AdminModule, Module, AppModule, Module, AuthModule, Module, BankAccountsModule (+27 more)

### Community 20 - "AuthController"
Cohesion: 0.19
Nodes (14): CurrentUser, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+6 more)

### Community 21 - "AdminController"
Cohesion: 0.29
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.14
Nodes (13): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty, LoginDto, ApiProperty, IsEmail, IsString (+5 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.18
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 25 - "upload.controller.ts"
Cohesion: 0.27
Nodes (13): GetAuditSummaryDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, IsDateString, IsInt (+5 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.14
Nodes (14): ExpensesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+6 more)

### Community 27 - "TransactionsController"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.22
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.14
Nodes (15): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+7 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.26
Nodes (9): CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional, IsString, Min (+1 more)

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
Cohesion: 0.14
Nodes (12): Request, ApiBearerAuth, Delete, Get, Param, Patch, Roles, UseGuards (+4 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.12
Nodes (13): Res, Controller, Get, Param, Post, UseGuards, UploadController, Module (+5 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.15
Nodes (16): GetCashFlowReportDto, GetPeriodReportDto, GetProfitReportDto, ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags (+8 more)

### Community 39 - "environment.ts"
Cohesion: 0.10
Nodes (18): ReportsModule, Module, AccountReportItem, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyBreakdownItem, DailyExpenseByCategory (+10 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.08
Nodes (21): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+13 more)

### Community 42 - "RegisterDto"
Cohesion: 0.12
Nodes (15): CreateFxTransferDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional (+7 more)

### Community 43 - "NotificationsService"
Cohesion: 0.13
Nodes (13): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+5 more)

### Community 44 - "HealthController"
Cohesion: 0.20
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 45 - "AdminService"
Cohesion: 0.29
Nodes (6): PlatformSeriesQueryDto, IsInt, IsOptional, Max, Min, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.24
Nodes (6): EmailResult, SendEmailDto, EmailModule, Module, EmailService, Injectable

### Community 47 - "environment.ts"
Cohesion: 0.24
Nodes (7): ApiProperty, IsIn, IsString, IsExpoPushToken(), RegisterPushTokenDto, Body, Post

### Community 48 - "HealthController"
Cohesion: 0.15
Nodes (11): AuthController, ApiOperation, ApiResponse, ApiTags, Body, Controller, Post, ApiProperty (+3 more)

### Community 49 - "cash.tenant-isolation.spec.ts"
Cohesion: 0.24
Nodes (5): HealthController, Controller, Get, HealthModule, Module

### Community 50 - "expenses.tenant-isolation.spec.ts"
Cohesion: 0.20
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+2 more)

### Community 51 - "admin.controller.ts"
Cohesion: 0.20
Nodes (9): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

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
Cohesion: 0.22
Nodes (6): FxOperationsController, ApiBearerAuth, ApiTags, Controller, UseFilters, UseGuards

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.25
Nodes (8): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString

### Community 60 - "ResetPasswordDto"
Cohesion: 0.29
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 62 - "QueryNotificationsDto"
Cohesion: 0.22
Nodes (8): QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform, Type

### Community 63 - "CreateTransactionDto"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 64 - "AddBalanceDto"
Cohesion: 0.33
Nodes (5): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength

### Community 65 - ".findByCurrency"
Cohesion: 0.18
Nodes (5): AuthService, Injectable, Injectable, VerificationTokenResult, VerificationTokenService

### Community 66 - "AdminController"
Cohesion: 0.20
Nodes (9): DepositDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 68 - "JwtAuthGuard"
Cohesion: 0.15
Nodes (9): Roles(), JwtAuthGuard, Injectable, RolesGuard, Injectable, RenewLicenseDto, ApiProperty, IsEnum (+1 more)

### Community 69 - "reports.module.ts"
Cohesion: 0.32
Nodes (4): mockEmailService, mockPushNotificationsService, prisma, RegisterPushTokenDto

### Community 71 - "FxOperationsService"
Cohesion: 0.40
Nodes (3): mapTransferMovement(), FxOperationsService, Injectable

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.40
Nodes (4): SetPrimaryCurrencyDto, ApiProperty, IsInt, IsNotEmpty

### Community 82 - "auth.service.ts"
Cohesion: 0.13
Nodes (8): JwtStrategy, Injectable, PrismaService, Injectable, rows, CYCLE_DAYS, CYCLE_USD, rows

### Community 86 - "Body"
Cohesion: 0.14
Nodes (10): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, Patch (+2 more)

## Knowledge Gaps
- **168 isolated node(s):** `ExpoPushMessage`, `ExpoPushTicket`, `ExpoPushReceipt`, `RegisterPushTokenDto`, `$schema` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `AuthController` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `ReconciliationsController`, `auth.service.ts`, `TransactionsController`, `transactions.controller.ts`, `AdminUserActionDto`, `cash-audits.controller.ts`, `.create`, `SubscriptionsService`, `SubscriptionsService`, `.reactivateLicense`, `RegisterDto`, `NotificationsService`, `environment.ts`, `ForgotPasswordDto`, `QueryNotificationsDto`, `JwtAuthGuard`, `Body`?**
  _High betweenness centrality (0.373) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `auth.service.ts` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `ExchangeRatesService`, `RateHistoryController`, `SubscriptionsService`, `current-user.decorator.ts`, `CreateCashAdjustmentDto`, `app.module.ts`, `AdminController`, `auth.controller.ts`, `ReconciliationsController`, `TransactionsController`, `transactions.controller.ts`, `ChangePasswordDto`, `cash-audits.controller.ts`, `.create`, `SubscriptionsService`, `environment.ts`, `.reactivateLicense`, `EmailService`, `NotificationsService`, `cash.tenant-isolation.spec.ts`, `.findByCurrency`, `.getAvatar`, `ApiBearerAuth`, `FxOperationsService`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `Expo` connect `Controller` to `WorkerPaymentsController`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `ExpoPushMessage`, `ExpoPushTicket`, `ExpoPushReceipt` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.057859703020993344 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06393442622950819 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._