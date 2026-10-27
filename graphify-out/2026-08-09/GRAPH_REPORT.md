# Graph Report - API  (2026-08-09)

## Corpus Check
- 217 files · ~64,356 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1617 nodes · 3171 edges · 103 communities (79 shown, 24 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `49a15c42`
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
- HealthController
- RegisterDto
- NotificationsService
- HealthController
- AdminService
- RegisterPaymentDto
- environment.ts
- HealthController
- VerifyEmailDto
- UpdateWorkerDto
- CreateFxTransferDto
- nest-cli.json
- FxOperationsController
- Controller
- CreateExpenseDto
- subscriptions.service.ts
- seed.ts
- FxOperationsService
- CreateTransactionDto
- CreateTransactionDto
- AddBalanceDto
- DepositDto
- ExpensesService
- fx-operations.controller.ts
- JwtAuthGuard
- QueryTransactionDto
- ApiBearerAuth
- expenses.controller.ts
- SetPrimaryCurrencyDto
- ApiProperty
- QueryNotificationsDto
- .applyUserControlAction
- .createUser
- ResendVerificationDto
- .activateUser
- .create
- phase6-checks.ts
- expense-items.module.ts
- AdminModule
- AuthModule
- BankAccountsModule
- CurrenciesModule
- HealthModule
- NotificationsModule
- ObjectivesModule
- ApiProperty
- ApiPropertyOptional
- IsBoolean
- UpdateAdminUserDto
- QueryNotificationsDto
- .applyUserControlAction
- LoginDto
- IsNumber
- IsOptional
- IsString
- Max
- Min
- ValidateIf

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 111 edges
2. `PrismaService` - 68 edges
3. `ReportsService` - 28 edges
4. `AdminService` - 26 edges
5. `AuthService` - 25 edges
6. `JwtAuthGuard` - 25 edges
7. `NotificationsService` - 25 edges
8. `WorkerPaymentsService` - 22 edges
9. `AdminController` - 22 edges
10. `CreateExpenseDto` - 20 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (103 total, 24 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (38): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+30 more)

### Community 1 - "WorkerPaymentsController"
Cohesion: 0.22
Nodes (3): PushNotificationsService, RegisterPushTokenDto, Injectable

### Community 2 - "CashService"
Cohesion: 0.06
Nodes (37): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+29 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.05
Nodes (43): serializableTransaction(), TransactionRunner, CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum (+35 more)

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
Nodes (24): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+16 more)

### Community 9 - "ReportsService"
Cohesion: 0.20
Nodes (6): EmailResult, SendEmailDto, EmailModule, Module, EmailService, Injectable

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
Cohesion: 0.33
Nodes (8): AppModule, Module, assertHttpUrl(), DEVELOPMENT_ORIGINS, Environment, parseCorsOrigins(), validateEnvironment(), bootstrap()

### Community 15 - "SubscriptionsService"
Cohesion: 0.16
Nodes (13): SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+5 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.16
Nodes (7): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, FxDomainExceptionFilter

### Community 17 - "NotificationsService"
Cohesion: 0.33
Nodes (5): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.08
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 20 - "AuthController"
Cohesion: 0.17
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 21 - "AdminController"
Cohesion: 0.42
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.27
Nodes (3): ApiOperation, Body, Post

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.17
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.15
Nodes (16): GetCashFlowReportDto, GetPeriodReportDto, GetProfitReportDto, ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags (+8 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.13
Nodes (13): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+5 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.18
Nodes (23): AccountReportItemDto, AccountsReportDto, AuditSummaryReportDtoSwagger, CashFlowReportDtoSwagger, CurrencyReportDto, DailyBreakdownItemDto, DailyExpenseByCategoryDto, DailyReportDto (+15 more)

### Community 27 - "TransactionsController"
Cohesion: 0.17
Nodes (7): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty, Injectable, VerificationTokenResult, VerificationTokenService

### Community 28 - "AuthService"
Cohesion: 0.14
Nodes (15): ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString (+7 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.13
Nodes (8): JwtStrategy, Injectable, PrismaService, Injectable, rows, CYCLE_DAYS, CYCLE_USD, rows

### Community 30 - "ChangePasswordDto"
Cohesion: 0.15
Nodes (12): AccountReportItem, DailyBreakdownItem, DailyExpenseByCategory, DailyExpenseCategorySummary, ExpensesByCurrencySummary, FxPerformanceMovement, FxPerformancePosition, ObjectiveReportItem (+4 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.29
Nodes (6): AGENTS.md — App Finance API, Codebase Knowledge Graph (codebase-memory-mcp), Flujo de descubrimiento, Graphify, Proyecto, Índice, APP y cross-repo

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.08
Nodes (24): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 34 - ".create"
Cohesion: 0.10
Nodes (12): AdminController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+4 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.48
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 36 - "SubscriptionsService"
Cohesion: 0.11
Nodes (13): Res, Controller, Get, Param, Post, UseGuards, UploadController, Module (+5 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.12
Nodes (11): ReportsModule, Module, ReportsService, Injectable, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyReportDto (+3 more)

### Community 39 - "environment.ts"
Cohesion: 0.15
Nodes (13): RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+5 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.07
Nodes (22): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+14 more)

### Community 41 - "HealthController"
Cohesion: 0.32
Nodes (3): HealthController, Controller, Get

### Community 42 - "RegisterDto"
Cohesion: 0.22
Nodes (4): SubscriptionsModule, Module, SubscriptionsService, Injectable

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
Cohesion: 0.08
Nodes (26): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+18 more)

### Community 47 - "environment.ts"
Cohesion: 0.12
Nodes (13): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 48 - "HealthController"
Cohesion: 0.15
Nodes (12): Request, AuthController, ApiBearerAuth, ApiResponse, ApiTags, Controller, Delete, Get (+4 more)

### Community 49 - "VerifyEmailDto"
Cohesion: 0.27
Nodes (13): GetAuditSummaryDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, IsDateString, IsInt (+5 more)

### Community 51 - "CreateFxTransferDto"
Cohesion: 0.16
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "FxOperationsController"
Cohesion: 0.18
Nodes (10): FxOperationsController, ApiBearerAuth, ApiHeader, ApiTags, Body, Controller, Headers, Post (+2 more)

### Community 54 - "Controller"
Cohesion: 0.20
Nodes (5): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 55 - "CreateExpenseDto"
Cohesion: 0.18
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.11
Nodes (17): Roles(), AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional (+9 more)

### Community 62 - "CreateTransactionDto"
Cohesion: 0.20
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+2 more)

### Community 63 - "CreateTransactionDto"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 64 - "AddBalanceDto"
Cohesion: 0.22
Nodes (9): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 65 - "DepositDto"
Cohesion: 0.22
Nodes (9): DepositDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 66 - "ExpensesService"
Cohesion: 0.25
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 67 - "fx-operations.controller.ts"
Cohesion: 0.29
Nodes (6): OpenCurrencyPositionDto, ApiProperty, IsInt, IsNumber, Max, Min

### Community 68 - "JwtAuthGuard"
Cohesion: 0.34
Nodes (3): CurrentUser, JwtAuthGuard, Injectable

### Community 69 - "QueryTransactionDto"
Cohesion: 0.29
Nodes (6): QueryTransactionDto, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional

### Community 70 - "ApiBearerAuth"
Cohesion: 0.27
Nodes (9): Global, DatabaseModule, Module, FxOperationsModule, Module, RemittancesModule, Module, TransactionsModule (+1 more)

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.09
Nodes (22): LoginDto, ApiProperty, IsEmail, IsString, MinLength, RegisterDto, ApiProperty, ApiPropertyOptional (+14 more)

### Community 73 - "ApiProperty"
Cohesion: 0.27
Nodes (8): IsIn, IsExpoPushToken(), RegisterPushTokenDto, ApiProperty, IsString, ApiProperty, IsString, UnregisterPushTokenDto

### Community 74 - "QueryNotificationsDto"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 75 - ".applyUserControlAction"
Cohesion: 0.34
Nodes (3): AdminService, Injectable, AdminUserControlActionType

### Community 76 - ".createUser"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 77 - "ResendVerificationDto"
Cohesion: 0.18
Nodes (6): AuthService, Injectable, ResendVerificationDto, ApiProperty, IsEmail, IsNotEmpty

### Community 78 - ".activateUser"
Cohesion: 0.33
Nodes (4): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional

### Community 79 - ".create"
Cohesion: 0.40
Nodes (4): ApiHeader, Body, Headers, Post

### Community 80 - "phase6-checks.ts"
Cohesion: 0.50
Nodes (3): mockEmailService, mockPushNotificationsService, prisma

### Community 93 - "UpdateAdminUserDto"
Cohesion: 0.22
Nodes (8): Patch, ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 94 - "QueryNotificationsDto"
Cohesion: 0.22
Nodes (8): QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform, Type

## Knowledge Gaps
- **171 isolated node(s):** `MAX_TRANSACTION_TOTAL`, `PERSISTED_RATE_RELATIVE_TOLERANCE`, `$schema`, `collection`, `sourceRoot` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `JwtAuthGuard` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ExchangeRatesService`, `CreateCashAdjustmentDto`, `AuthController`, `ReconciliationsController`, `upload.controller.ts`, `auth.service.ts`, `cash-audits.controller.ts`, `.create`, `SubscriptionsService`, `SubscriptionsService`, `.reactivateLicense`, `NotificationsService`, `RegisterPaymentDto`, `environment.ts`, `FxOperationsController`, `fx-operations.controller.ts`, `ApiProperty`, `.applyUserControlAction`, `.create`, `UpdateAdminUserDto`?**
  _High betweenness centrality (0.373) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `transactions.controller.ts` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `plans.controller.ts`, `ExchangeRatesService`, `CreateCashAdjustmentDto`, `upload.controller.ts`, `TransactionsController`, `cash-audits.controller.ts`, `JwtAuthGuard`, `SubscriptionsService`, `SubscriptionsService`, `environment.ts`, `HealthController`, `RegisterDto`, `NotificationsService`, `RegisterPaymentDto`, `JwtAuthGuard`, `ApiBearerAuth`, `.applyUserControlAction`, `ResendVerificationDto`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `Expo` connect `Controller` to `WorkerPaymentsController`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **What connects `MAX_TRANSACTION_TOTAL`, `PERSISTED_RATE_RELATIVE_TOLERANCE`, `$schema` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.055051421657592255 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.058699101004759384 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.05081585081585081 - nodes in this community are weakly interconnected._