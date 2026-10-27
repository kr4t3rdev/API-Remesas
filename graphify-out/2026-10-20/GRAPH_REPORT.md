# Graph Report - API  (2026-08-12)

## Corpus Check
- 217 files · ~64,589 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1631 nodes · 3130 edges · 94 communities (67 shown, 27 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5bf64e7f`
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
- SubscriptionsService
- NotificationsService
- .create
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
- QueryNotificationsDto
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
- AssignLicenseDto
- ApiBearerAuth
- .findByCurrency
- SetPrimaryCurrencyDto
- ApiProperty
- QueryNotificationsDto
- .applyUserControlAction
- .createUser
- ResendVerificationDto
- .activateUser
- SetPrimaryCurrencyDto
- Injectable
- ApiProperty
- ApiPropertyOptional
- IsBoolean
- UpdateAdminUserDto
- .applyUserControlAction
- LoginDto
- IsNumber
- IsOptional
- IsString
- Max
- Min
- ValidateIf

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 107 edges
2. `PrismaService` - 68 edges
3. `ReportsService` - 28 edges
4. `AuthService` - 25 edges
5. `NotificationsService` - 25 edges
6. `AdminService` - 24 edges
7. `JwtAuthGuard` - 24 edges
8. `AdminController` - 22 edges
9. `WorkerPaymentsService` - 22 edges
10. `CreateExpenseDto` - 20 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (94 total, 27 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (38): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+30 more)

### Community 1 - "WorkerPaymentsController"
Cohesion: 0.13
Nodes (6): Expo, Body, Delete, Post, PushNotificationsService, Injectable

### Community 2 - "CashService"
Cohesion: 0.07
Nodes (33): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+25 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.17
Nodes (12): ExpensesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+4 more)

### Community 4 - "CurrentUser"
Cohesion: 0.07
Nodes (32): CreateObjectiveDto, ApiProperty, ApiPropertyOptional, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+24 more)

### Community 5 - "fx-operations.service.ts"
Cohesion: 0.14
Nodes (14): CreateExpenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber (+6 more)

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
Cohesion: 0.21
Nodes (7): mockEmailService, mockPushNotificationsService, prisma, EmailResult, SendEmailDto, EmailService, Injectable

### Community 10 - "dependencies"
Cohesion: 0.04
Nodes (46): author, dependencies, bcrypt, class-transformer, class-validator, decimal.js, expo-server-sdk, @nestjs/common (+38 more)

### Community 11 - "API Endpoints"
Cohesion: 0.05
Nodes (41): 10. income_reconciliations, 11. rate_history, 12. objectives, 13. users, 1. currencies, 2. exchange_rates, 3. transactions, 4. cash_balances (+33 more)

### Community 12 - "plans.controller.ts"
Cohesion: 0.14
Nodes (14): PlansController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+6 more)

### Community 13 - "ExchangeRatesService"
Cohesion: 0.08
Nodes (23): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto, ExchangeRatesController, ApiBearerAuth, ApiOperation (+15 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.13
Nodes (16): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+8 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.09
Nodes (21): SuspendLicenseDto, ApiPropertyOptional, IsOptional, IsString, SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags (+13 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.16
Nodes (7): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, FxDomainExceptionFilter

### Community 17 - "NotificationsService"
Cohesion: 0.17
Nodes (7): RolesGuard, Injectable, UpdatePlanDto, PlansModule, Module, PlansService, Injectable

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.09
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.28
Nodes (4): serializableTransaction(), TransactionRunner, ExpensesService, Injectable

### Community 20 - "AuthController"
Cohesion: 0.18
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 21 - "AdminController"
Cohesion: 0.36
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.17
Nodes (11): QueryExpenseDto, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, Max, Min (+3 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.17
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.30
Nodes (4): ExpenseCategory, UpdateExpenseDto, ExpensesModule, Module

### Community 25 - "upload.controller.ts"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags, Body, Controller (+7 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.11
Nodes (39): GetAuditSummaryDto, GetCashFlowReportDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, GetPeriodReportDto (+31 more)

### Community 27 - "TransactionsController"
Cohesion: 0.25
Nodes (8): CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional, IsString, Min

### Community 28 - "AuthService"
Cohesion: 0.17
Nodes (12): ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString (+4 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.13
Nodes (10): JwtStrategy, Injectable, VerificationTokenResult, closingA, closingB, PrismaService, Injectable, RegisterPushTokenDto (+2 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.07
Nodes (37): CurrentUser, ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get (+29 more)

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
Cohesion: 0.15
Nodes (14): ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, CurrentUser, Get, Param (+6 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.47
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 36 - "SubscriptionsService"
Cohesion: 0.12
Nodes (13): Res, Controller, Get, Param, Post, UseGuards, UploadController, Module (+5 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.40
Nodes (4): ApiProperty, IsNotEmpty, IsString, VerifyEmailDto

### Community 40 - ".reactivateLicense"
Cohesion: 0.07
Nodes (22): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+14 more)

### Community 41 - "HealthController"
Cohesion: 0.24
Nodes (5): HealthController, Controller, Get, HealthModule, Module

### Community 43 - "NotificationsService"
Cohesion: 0.13
Nodes (13): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+5 more)

### Community 45 - "AdminService"
Cohesion: 0.29
Nodes (6): PlatformSeriesQueryDto, IsInt, IsOptional, Max, Min, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.09
Nodes (24): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+16 more)

### Community 47 - "environment.ts"
Cohesion: 0.15
Nodes (10): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, Patch (+2 more)

### Community 48 - "HealthController"
Cohesion: 0.07
Nodes (28): Request, AuthController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller (+20 more)

### Community 51 - "CreateFxTransferDto"
Cohesion: 0.16
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.10
Nodes (17): Roles(), JwtAuthGuard, Injectable, RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum (+9 more)

### Community 60 - "FxOperationsService"
Cohesion: 0.15
Nodes (8): Injectable, calculatePersistedRate(), FxOperationsService, MAX_TRANSACTION_TOTAL, PERSISTED_RATE_RELATIVE_TOLERANCE, rows, TransactionsService, Injectable

### Community 62 - "CreateTransactionDto"
Cohesion: 0.20
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+2 more)

### Community 64 - "AddBalanceDto"
Cohesion: 0.22
Nodes (9): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 65 - "DepositDto"
Cohesion: 0.22
Nodes (9): DepositDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 66 - "ExpensesService"
Cohesion: 0.29
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 67 - "fx-operations.controller.ts"
Cohesion: 0.11
Nodes (16): OpenCurrencyPositionDto, ApiProperty, IsInt, IsNumber, Max, Min, FxOperationsController, ApiBearerAuth (+8 more)

### Community 69 - "AssignLicenseDto"
Cohesion: 0.22
Nodes (8): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString

### Community 70 - "ApiBearerAuth"
Cohesion: 0.07
Nodes (35): Global, AdminModule, Module, AppModule, Module, AuthModule, Module, BankAccountsModule (+27 more)

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.22
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 73 - "ApiProperty"
Cohesion: 0.13
Nodes (16): IsIn, QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform (+8 more)

### Community 74 - "QueryNotificationsDto"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 75 - ".applyUserControlAction"
Cohesion: 0.09
Nodes (10): AdminService, Injectable, AdminUserControlActionType, ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString (+2 more)

### Community 76 - ".createUser"
Cohesion: 0.33
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 77 - "ResendVerificationDto"
Cohesion: 0.11
Nodes (17): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional, ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty (+9 more)

## Knowledge Gaps
- **171 isolated node(s):** `MAX_TRANSACTION_TOTAL`, `PERSISTED_RATE_RELATIVE_TOLERANCE`, `$schema`, `collection`, `sourceRoot` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `ChangePasswordDto` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `AuthController`, `auth.controller.ts`, `ReconciliationsController`, `upload.controller.ts`, `auth.service.ts`, `cash-audits.controller.ts`, `SubscriptionsService`, `.reactivateLicense`, `NotificationsService`, `RegisterPaymentDto`, `environment.ts`, `UpdateWorkerDto`, `fx-operations.controller.ts`, `ApiProperty`?**
  _High betweenness centrality (0.346) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `transactions.controller.ts` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `ExchangeRatesService`, `RateHistoryController`, `SubscriptionsService`, `NotificationsService`, `CreateCashAdjustmentDto`, `app.module.ts`, `auth.controller.ts`, `ReconciliationsController`, `ChangePasswordDto`, `cash-audits.controller.ts`, `SubscriptionsService`, `environment.ts`, `HealthController`, `NotificationsService`, `RegisterPaymentDto`, `HealthController`, `FxOperationsService`, `ApiBearerAuth`, `.applyUserControlAction`, `ResendVerificationDto`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **Why does `Expo` connect `WorkerPaymentsController` to `dependencies`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **What connects `MAX_TRANSACTION_TOTAL`, `PERSISTED_RATE_RELATIVE_TOLERANCE`, `$schema` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.0597567424643046 - nodes in this community are weakly interconnected._
- **Should `WorkerPaymentsController` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._