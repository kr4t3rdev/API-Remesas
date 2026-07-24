# Graph Report - API  (2026-07-23)

## Corpus Check
- 199 files · ~55,123 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1542 nodes · 3028 edges · 92 communities (69 shown, 23 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41150c06`
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
- UpdateAdminUserDto
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
- CreateCashClosingDto
- CreateTransactionDto
- AddBalanceDto
- .findByCurrency
- AdminController
- .uploadAvatar
- .getAvatar
- reports.module.ts
- ApiBearerAuth
- ApiOperation
- ApiTags
- Body
- Controller
- Get
- Param
- Patch
- Post
- Query
- Roles
- UpdateAdminUserDto
- auth.service.ts
- ApiBearerAuth
- UseGuards
- IsInt
- Body
- IsOptional
- Max
- Min
- Type
- ApiProperty

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 102 edges
2. `PrismaService` - 72 edges
3. `ReportsService` - 27 edges
4. `AdminService` - 26 edges
5. `JwtAuthGuard` - 24 edges
6. `AuthService` - 23 edges
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

## Communities (92 total, 23 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (40): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+32 more)

### Community 1 - "WorkerPaymentsController"
Cohesion: 0.20
Nodes (9): CashController, ApiBearerAuth, ApiTags, Controller, UseGuards, ApiProperty, IsNumber, Min (+1 more)

### Community 2 - "CashService"
Cohesion: 0.23
Nodes (8): HttpCode, ApiOperation, ApiQuery, ApiResponse, Body, Get, Post, Query

### Community 3 - "CreateExpenseDto"
Cohesion: 0.06
Nodes (39): CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNotEmpty (+31 more)

### Community 4 - "CurrentUser"
Cohesion: 0.08
Nodes (30): CreateObjectiveDto, ApiProperty, ApiPropertyOptional, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+22 more)

### Community 5 - "fx-operations.service.ts"
Cohesion: 0.12
Nodes (15): CreateFxTransferDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional (+7 more)

### Community 6 - "devDependencies"
Cohesion: 0.04
Nodes (46): devDependencies, eslint, eslint-config-prettier, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing (+38 more)

### Community 7 - "BankAccountsController"
Cohesion: 0.09
Nodes (28): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+20 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.09
Nodes (26): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+18 more)

### Community 9 - "ReportsService"
Cohesion: 0.19
Nodes (3): ReportsService, Injectable, PeriodReportDto

### Community 10 - "dependencies"
Cohesion: 0.05
Nodes (42): author, dependencies, bcrypt, class-transformer, class-validator, decimal.js, @nestjs/common, @nestjs/config (+34 more)

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
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.09
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.07
Nodes (37): Global, AdminModule, Module, AppModule, Module, AuthModule, Module, BankAccountsModule (+29 more)

### Community 20 - "AuthController"
Cohesion: 0.11
Nodes (17): CreateWorkerDto, ApiProperty, IsOptional, IsString, DepositDto, ApiProperty, ApiPropertyOptional, IsEnum (+9 more)

### Community 21 - "AdminController"
Cohesion: 0.06
Nodes (27): main(), mockEmailService, prisma, EmailResult, SendEmailDto, EmailService, Injectable, QueryNotificationsDto (+19 more)

### Community 22 - "auth.controller.ts"
Cohesion: 0.15
Nodes (7): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty, Injectable, VerificationTokenResult, VerificationTokenService

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.27
Nodes (16): GetAuditSummaryDto, GetCashFlowReportDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, GetPeriodReportDto (+8 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.11
Nodes (18): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional, ChangePasswordDto, ApiProperty, IsOptional, IsString (+10 more)

### Community 27 - "TransactionsController"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.18
Nodes (10): Post, RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches (+2 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.17
Nodes (6): Param, Put, CashService, toDecimal(), toNumber(), Injectable

### Community 30 - "ChangePasswordDto"
Cohesion: 0.17
Nodes (11): RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+3 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.16
Nodes (23): ApiProperty, AccountReportItemDto, AccountsReportDto, AuditSummaryReportDtoSwagger, CashFlowReportDtoSwagger, CurrencyReportDto, DailyBreakdownItemDto, DailyExpenseByCategoryDto (+15 more)

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.13
Nodes (13): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+5 more)

### Community 34 - ".create"
Cohesion: 0.14
Nodes (16): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, AdminUserControlActionType, ApiProperty, ApiPropertyOptional, IsEnum (+8 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.16
Nodes (14): Request, AuthController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller (+6 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.18
Nodes (8): JwtAuthGuard, Injectable, Controller, UploadController, Module, UploadModule, Injectable, UploadService

### Community 37 - "SubscriptionsService"
Cohesion: 0.28
Nodes (10): ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+2 more)

### Community 39 - "environment.ts"
Cohesion: 0.10
Nodes (21): AccountReportItem, AccountsReportDto, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyBreakdownItem, DailyExpenseByCategory, DailyExpenseCategorySummary (+13 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.08
Nodes (21): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+13 more)

### Community 41 - "EmailService"
Cohesion: 0.18
Nodes (9): CashBalancesController, ApiBearerAuth, ApiTags, Controller, UseGuards, CashBalancesModule, Module, CashBalancesService (+1 more)

### Community 42 - "RegisterDto"
Cohesion: 0.14
Nodes (15): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+7 more)

### Community 43 - "NotificationsService"
Cohesion: 0.19
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 44 - "HealthController"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 45 - "AdminService"
Cohesion: 0.28
Nodes (6): IsInt, IsOptional, Max, Min, PlatformSeriesQueryDto, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.22
Nodes (8): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString

### Community 47 - "UpdateAdminUserDto"
Cohesion: 0.17
Nodes (11): CashAuditsModule, Module, CashAuditsService, Injectable, CreateCashAuditDto, ApiProperty, ApiPropertyOptional, IsInt (+3 more)

### Community 48 - "HealthController"
Cohesion: 0.19
Nodes (6): AuthService, Injectable, ResendVerificationDto, ApiProperty, IsEmail, IsNotEmpty

### Community 49 - "cash.tenant-isolation.spec.ts"
Cohesion: 0.32
Nodes (3): HealthController, Controller, Get

### Community 50 - "expenses.tenant-isolation.spec.ts"
Cohesion: 0.14
Nodes (10): Catch, FxDomainExceptionFilter, FxOperationsController, ApiBearerAuth, ApiTags, Controller, UseFilters, UseGuards (+2 more)

### Community 51 - "admin.controller.ts"
Cohesion: 0.40
Nodes (4): SetPrimaryCurrencyDto, ApiProperty, IsInt, IsNotEmpty

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "notifications.service.ts"
Cohesion: 0.47
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.15
Nodes (11): Roles(), RenewLicenseDto, ApiProperty, IsEnum, IsInt, SuspendLicenseDto, ApiPropertyOptional, IsOptional (+3 more)

### Community 60 - "ResetPasswordDto"
Cohesion: 0.20
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 62 - "CreateCashClosingDto"
Cohesion: 0.20
Nodes (10): CreateCashClosingDto, ApiProperty, ApiPropertyOptional, IsDateString, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 63 - "CreateTransactionDto"
Cohesion: 0.20
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+2 more)

### Community 64 - "AddBalanceDto"
Cohesion: 0.22
Nodes (9): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 65 - ".findByCurrency"
Cohesion: 0.32
Nodes (4): ApiOperation, ApiResponse, Get, Param

### Community 66 - "AdminController"
Cohesion: 0.29
Nodes (6): ApiBearerAuth, ApiTags, Controller, Roles, AdminController, UseGuards

### Community 67 - ".uploadAvatar"
Cohesion: 0.33
Nodes (4): Post, UseGuards, UploadedFile, UseInterceptors

### Community 68 - ".getAvatar"
Cohesion: 0.50
Nodes (3): Res, Get, Param

### Community 81 - "UpdateAdminUserDto"
Cohesion: 0.25
Nodes (7): ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 82 - "auth.service.ts"
Cohesion: 0.13
Nodes (9): JwtStrategy, Injectable, closingA, closingB, PrismaService, Injectable, CYCLE_DAYS, CYCLE_USD (+1 more)

### Community 83 - "ApiBearerAuth"
Cohesion: 0.18
Nodes (3): ApiOperation, Get, Query

### Community 86 - "Body"
Cohesion: 0.23
Nodes (5): Body, CurrentUser, Param, Patch, Post

## Knowledge Gaps
- **162 isolated node(s):** `DailyExpenseByCategory`, `DailyExpenseCategorySummary`, `DailyBreakdownItem`, `PeriodTransactionCurrencySummary`, `TransactionTypeLite` (+157 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `BankAccountsController` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `fx-operations.service.ts`, `CurrenciesController`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `AuthController`, `AdminController`, `upload.controller.ts`, `TransactionsController`, `transactions.controller.ts`, `cash-audits.controller.ts`, `SubscriptionsService`, `SubscriptionsService`, `.reactivateLicense`, `EmailService`, `RegisterDto`, `NotificationsService`, `UpdateAdminUserDto`, `expenses.tenant-isolation.spec.ts`, `.findByCurrency`, `.uploadAvatar`?**
  _High betweenness centrality (0.263) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `auth.service.ts` to `ExpenseItemsService`, `WorkerPaymentsController`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `plans.controller.ts`, `ExchangeRatesService`, `RateHistoryController`, `current-user.decorator.ts`, `CreateCashAdjustmentDto`, `app.module.ts`, `AuthController`, `AdminController`, `auth.controller.ts`, `auth.service.ts`, `TransactionsController`, `transactions.controller.ts`, `ChangePasswordDto`, `SubscriptionsService`, `.reactivateLicense`, `EmailService`, `RegisterDto`, `UpdateAdminUserDto`, `cash.tenant-isolation.spec.ts`, `expenses.tenant-isolation.spec.ts`, `Controller`, `ForgotPasswordDto`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `JwtAuthGuard` connect `SubscriptionsService` to `ExpenseItemsService`, `WorkerPaymentsController`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `AuthController`, `AdminController`, `upload.controller.ts`, `auth.service.ts`, `ChangePasswordDto`, `.reactivateLicense`, `EmailService`, `RegisterDto`, `UpdateAdminUserDto`, `expenses.tenant-isolation.spec.ts`, `subscriptions.service.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `DailyExpenseByCategory`, `DailyExpenseCategorySummary`, `DailyBreakdownItem` to the rest of the system?**
  _162 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.057859703020993344 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.05711263881544157 - nodes in this community are weakly interconnected._
- **Should `CurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.07857142857142857 - nodes in this community are weakly interconnected._