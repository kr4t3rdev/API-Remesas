# Graph Report - API  (2026-07-27)

## Corpus Check
- 208 files · ~57,320 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1575 nodes · 3107 edges · 88 communities (68 shown, 20 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `60681500`
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
- JwtAuthGuard
- expo-server-sdk.ts
- ApiOperation
- ApiTags
- Controller
- Get
- Param
- auth.service.ts
- Patch
- Post
- Query
- Body
- UseGuards

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 101 edges
2. `PrismaService` - 73 edges
3. `ReportsService` - 27 edges
4. `AdminService` - 26 edges
5. `AuthService` - 25 edges
6. `JwtAuthGuard` - 24 edges
7. `NotificationsService` - 23 edges
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

## Communities (88 total, 20 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (38): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+30 more)

### Community 2 - "CashService"
Cohesion: 0.15
Nodes (15): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+7 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.06
Nodes (36): CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNotEmpty (+28 more)

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
Cohesion: 0.09
Nodes (25): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+17 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.09
Nodes (26): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+18 more)

### Community 9 - "ReportsService"
Cohesion: 0.15
Nodes (14): CreateCashClosingDto, ApiProperty, ApiPropertyOptional, IsDateString, IsInt, IsNumber, IsOptional, IsString (+6 more)

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
Cohesion: 0.09
Nodes (25): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+17 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.15
Nodes (13): SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+5 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.18
Nodes (13): CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, mapTransferMovement(), assertSaleAvailable(), calculateSaleSnapshot() (+5 more)

### Community 17 - "NotificationsService"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.08
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.07
Nodes (37): Global, AdminModule, Module, AppModule, Module, AuthModule, Module, BankAccountsModule (+29 more)

### Community 20 - "AuthController"
Cohesion: 0.19
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 21 - "AdminController"
Cohesion: 0.21
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.12
Nodes (14): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength, ForgotPasswordDto, ApiProperty, IsEmail (+6 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.17
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.22
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 25 - "upload.controller.ts"
Cohesion: 0.36
Nodes (3): AdminService, Injectable, AdminUserControlActionType

### Community 26 - "auth.service.ts"
Cohesion: 0.27
Nodes (4): CashService, toDecimal(), toNumber(), Injectable

### Community 27 - "TransactionsController"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.20
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.12
Nodes (17): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+9 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.17
Nodes (11): RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+3 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.11
Nodes (39): GetAuditSummaryDto, GetCashFlowReportDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, GetPeriodReportDto (+31 more)

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.08
Nodes (24): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 34 - ".create"
Cohesion: 0.10
Nodes (12): AdminController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+4 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.13
Nodes (12): ApiBearerAuth, Delete, Get, Param, Roles, UseGuards, CreateUserDto, ApiProperty (+4 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.12
Nodes (13): Res, Controller, Get, Param, Post, UseGuards, UploadController, Module (+5 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.07
Nodes (37): CurrentUser, ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get (+29 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.17
Nodes (10): RemittancesController, ApiBearerAuth, ApiTags, Body, Controller, Get, Headers, Param (+2 more)

### Community 42 - "RegisterDto"
Cohesion: 0.12
Nodes (15): CreateFxTransferDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional (+7 more)

### Community 43 - "NotificationsService"
Cohesion: 0.20
Nodes (9): CashBalancesController, ApiBearerAuth, ApiTags, Controller, UseGuards, CashBalancesModule, Module, CashBalancesService (+1 more)

### Community 44 - "HealthController"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 45 - "AdminService"
Cohesion: 0.29
Nodes (6): PlatformSeriesQueryDto, IsInt, IsOptional, Max, Min, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.06
Nodes (30): ApiBearerAuth, ApiOperation, ApiProperty, ApiTags, Body, Controller, CurrentUser, Delete (+22 more)

### Community 48 - "HealthController"
Cohesion: 0.20
Nodes (9): Request, AuthController, ApiOperation, ApiResponse, ApiTags, Body, Controller, Patch (+1 more)

### Community 49 - "cash.tenant-isolation.spec.ts"
Cohesion: 0.24
Nodes (5): HealthController, Controller, Get, HealthModule, Module

### Community 50 - "expenses.tenant-isolation.spec.ts"
Cohesion: 0.18
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

### Community 55 - "ForgotPasswordDto"
Cohesion: 0.18
Nodes (8): Catch, FxDomainExceptionFilter, FxOperationsController, ApiBearerAuth, ApiTags, Controller, UseFilters, UseGuards

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.22
Nodes (8): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString

### Community 60 - "ResetPasswordDto"
Cohesion: 0.25
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 62 - "QueryNotificationsDto"
Cohesion: 0.22
Nodes (8): QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform, Type

### Community 63 - "CreateTransactionDto"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 65 - ".findByCurrency"
Cohesion: 0.21
Nodes (4): AuthService, Injectable, Injectable, VerificationTokenService

### Community 66 - "AdminController"
Cohesion: 0.20
Nodes (9): DepositDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 67 - ".getAvatar"
Cohesion: 0.22
Nodes (8): Patch, ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 68 - "JwtAuthGuard"
Cohesion: 0.15
Nodes (11): Roles(), RenewLicenseDto, ApiProperty, IsEnum, IsInt, SuspendLicenseDto, ApiPropertyOptional, IsOptional (+3 more)

### Community 69 - "reports.module.ts"
Cohesion: 0.22
Nodes (9): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+1 more)

### Community 70 - "ApiBearerAuth"
Cohesion: 0.32
Nodes (4): ApiOperation, ApiResponse, Get, Param

### Community 71 - "FxOperationsService"
Cohesion: 0.29
Nodes (3): FxOperationsService, Injectable, rows

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.10
Nodes (17): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional, LoginDto, ApiProperty, IsEmail, IsString (+9 more)

### Community 76 - "expo-server-sdk.ts"
Cohesion: 0.40
Nodes (4): expo-server-sdk, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 82 - "auth.service.ts"
Cohesion: 0.11
Nodes (11): JwtStrategy, Injectable, accounts, scopedFindFirst, closingA, closingB, PrismaService, Injectable (+3 more)

## Knowledge Gaps
- **168 isolated node(s):** `RegisterPushTokenDto`, `ExpoPushMessage`, `ExpoPushTicket`, `ExpoPushReceipt`, `$schema` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `SubscriptionsService` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `AuthController`, `ReconciliationsController`, `upload.controller.ts`, `TransactionsController`, `transactions.controller.ts`, `AdminUserActionDto`, `cash-audits.controller.ts`, `.create`, `SubscriptionsService`, `.reactivateLicense`, `RegisterDto`, `NotificationsService`, `ForgotPasswordDto`, `.getAvatar`, `ApiBearerAuth`, `JwtAuthGuard`?**
  _High betweenness centrality (0.268) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `auth.service.ts` to `ExpenseItemsService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `plans.controller.ts`, `ExchangeRatesService`, `RateHistoryController`, `current-user.decorator.ts`, `CreateCashAdjustmentDto`, `app.module.ts`, `AdminController`, `auth.controller.ts`, `ReconciliationsController`, `upload.controller.ts`, `auth.service.ts`, `TransactionsController`, `transactions.controller.ts`, `ChangePasswordDto`, `cash-audits.controller.ts`, `SubscriptionsService`, `SubscriptionsService`, `environment.ts`, `EmailService`, `NotificationsService`, `cash.tenant-isolation.spec.ts`, `AddBalanceDto`, `.findByCurrency`, `FxOperationsService`, `JwtAuthGuard`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Why does `JwtAuthGuard` connect `JwtAuthGuard` to `ExpenseItemsService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `ReconciliationsController`, `upload.controller.ts`, `transactions.controller.ts`, `ChangePasswordDto`, `AdminUserActionDto`, `cash-audits.controller.ts`, `SubscriptionsService`, `NotificationsService`, `ForgotPasswordDto`, `JwtAuthGuard`, `SetPrimaryCurrencyDto`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `RegisterPushTokenDto`, `ExpoPushMessage`, `ExpoPushTicket` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.0597567424643046 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.06390977443609022 - nodes in this community are weakly interconnected._
- **Should `CurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.07857142857142857 - nodes in this community are weakly interconnected._