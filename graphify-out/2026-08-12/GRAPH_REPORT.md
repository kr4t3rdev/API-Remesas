# Graph Report - API  (2026-08-10)

## Corpus Check
- 217 files · ~64,589 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1618 nodes · 3165 edges · 95 communities (78 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fbeccabd`
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
- phase6-checks.ts
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

## Communities (95 total, 17 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (38): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+30 more)

### Community 2 - "CashService"
Cohesion: 0.07
Nodes (33): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+25 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.05
Nodes (45): serializableTransaction(), TransactionRunner, CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum (+37 more)

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
Cohesion: 0.18
Nodes (8): mockEmailService, mockPushNotificationsService, prisma, EmailResult, SendEmailDto, EmailService, Injectable, RegisterPushTokenDto

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
Cohesion: 0.12
Nodes (14): ExchangeRatesController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+6 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.13
Nodes (16): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+8 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.15
Nodes (13): SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+5 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.16
Nodes (7): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, FxDomainExceptionFilter

### Community 17 - "NotificationsService"
Cohesion: 0.17
Nodes (11): RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+3 more)

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.17
Nodes (9): CashAdjustmentsController, ApiBearerAuth, ApiTags, Controller, UseGuards, CashAdjustmentsModule, Module, CashAdjustmentsService (+1 more)

### Community 19 - "app.module.ts"
Cohesion: 0.16
Nodes (9): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto, ExchangeRatesModule, Module, ExchangeRatesService (+1 more)

### Community 20 - "AuthController"
Cohesion: 0.22
Nodes (14): CurrentUser, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+6 more)

### Community 21 - "AdminController"
Cohesion: 0.36
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.16
Nodes (9): AuthController, ApiTags, Body, Controller, Post, ForgotPasswordDto, ApiProperty, IsEmail (+1 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.17
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.28
Nodes (10): ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+2 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags, Body, Controller (+7 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.18
Nodes (23): AccountReportItemDto, AccountsReportDto, AuditSummaryReportDtoSwagger, CashFlowReportDtoSwagger, CurrencyReportDto, DailyBreakdownItemDto, DailyExpenseByCategoryDto, DailyReportDto (+15 more)

### Community 27 - "TransactionsController"
Cohesion: 0.25
Nodes (3): Injectable, VerificationTokenResult, VerificationTokenService

### Community 28 - "AuthService"
Cohesion: 0.17
Nodes (12): ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString (+4 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.12
Nodes (11): JwtStrategy, Injectable, accounts, scopedFindFirst, closingA, closingB, PrismaService, Injectable (+3 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.09
Nodes (24): ReportsModule, Module, AccountReportItem, AccountsReportDto, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyBreakdownItem (+16 more)

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
Cohesion: 0.11
Nodes (12): AdminController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+4 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.48
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 36 - "SubscriptionsService"
Cohesion: 0.15
Nodes (10): Controller, Post, UseGuards, UploadController, Module, UploadModule, Injectable, UploadService (+2 more)

### Community 39 - "environment.ts"
Cohesion: 0.15
Nodes (11): Roles(), RenewLicenseDto, ApiProperty, IsEnum, IsInt, SuspendLicenseDto, ApiPropertyOptional, IsOptional (+3 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.07
Nodes (22): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+14 more)

### Community 41 - "HealthController"
Cohesion: 0.24
Nodes (5): HealthController, Controller, Get, HealthModule, Module

### Community 43 - "NotificationsService"
Cohesion: 0.20
Nodes (9): CashBalancesController, ApiBearerAuth, ApiTags, Controller, UseGuards, CashBalancesModule, Module, CashBalancesService (+1 more)

### Community 44 - ".create"
Cohesion: 0.20
Nodes (7): ApiOperation, ApiQuery, ApiResponse, Body, Get, Post, Query

### Community 45 - "AdminService"
Cohesion: 0.29
Nodes (6): PlatformSeriesQueryDto, IsInt, IsOptional, Max, Min, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.08
Nodes (26): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+18 more)

### Community 47 - "environment.ts"
Cohesion: 0.13
Nodes (13): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 48 - "HealthController"
Cohesion: 0.14
Nodes (15): Request, ApiBearerAuth, ApiOperation, ApiResponse, Delete, Get, Param, Patch (+7 more)

### Community 49 - "VerifyEmailDto"
Cohesion: 0.24
Nodes (16): GetAuditSummaryDto, GetCashFlowReportDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, GetPeriodReportDto (+8 more)

### Community 50 - "UpdateWorkerDto"
Cohesion: 0.18
Nodes (4): Module, WorkerPaymentsModule, Injectable, WorkerPaymentsService

### Community 51 - "CreateFxTransferDto"
Cohesion: 0.16
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "FxOperationsController"
Cohesion: 0.24
Nodes (7): AuthService, Injectable, LoginDto, ApiProperty, IsEmail, IsString, MinLength

### Community 54 - "Controller"
Cohesion: 0.20
Nodes (5): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 55 - "QueryNotificationsDto"
Cohesion: 0.22
Nodes (8): QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform, Type

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 60 - "FxOperationsService"
Cohesion: 0.15
Nodes (8): Injectable, calculatePersistedRate(), FxOperationsService, MAX_TRANSACTION_TOTAL, PERSISTED_RATE_RELATIVE_TOLERANCE, rows, TransactionsService, Injectable

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
Cohesion: 0.20
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

### Community 71 - ".findByCurrency"
Cohesion: 0.32
Nodes (4): ApiOperation, ApiResponse, Get, Param

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.22
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 73 - "ApiProperty"
Cohesion: 0.26
Nodes (8): IsIn, IsExpoPushToken(), RegisterPushTokenDto, ApiProperty, IsString, ApiProperty, IsString, UnregisterPushTokenDto

### Community 74 - "QueryNotificationsDto"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 75 - ".applyUserControlAction"
Cohesion: 0.22
Nodes (3): AdminService, Injectable, AdminUserControlActionType

### Community 76 - ".createUser"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 77 - "ResendVerificationDto"
Cohesion: 0.14
Nodes (12): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional, ResendVerificationDto, ApiProperty, IsEmail, IsNotEmpty (+4 more)

### Community 78 - ".activateUser"
Cohesion: 0.29
Nodes (7): CreateCashAdjustmentDto, ApiProperty, IsEnum, IsInt, IsNumber, IsString, Min

### Community 79 - "SetPrimaryCurrencyDto"
Cohesion: 0.40
Nodes (4): SetPrimaryCurrencyDto, ApiProperty, IsInt, IsNotEmpty

### Community 80 - "phase6-checks.ts"
Cohesion: 0.50
Nodes (3): Res, Get, Param

### Community 93 - "UpdateAdminUserDto"
Cohesion: 0.22
Nodes (8): Patch, ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

## Knowledge Gaps
- **171 isolated node(s):** `MAX_TRANSACTION_TOTAL`, `PERSISTED_RATE_RELATIVE_TOLERANCE`, `$schema`, `collection`, `sourceRoot` (+166 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `AuthController` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `app.module.ts`, `ReconciliationsController`, `upload.controller.ts`, `auth.service.ts`, `cash-audits.controller.ts`, `.create`, `SubscriptionsService`, `.reactivateLicense`, `NotificationsService`, `.create`, `RegisterPaymentDto`, `environment.ts`, `UpdateWorkerDto`, `fx-operations.controller.ts`, `.findByCurrency`, `ApiProperty`, `.applyUserControlAction`, `UpdateAdminUserDto`?**
  _High betweenness centrality (0.383) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `transactions.controller.ts` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `plans.controller.ts`, `ExchangeRatesService`, `RateHistoryController`, `NotificationsService`, `CreateCashAdjustmentDto`, `app.module.ts`, `TransactionsController`, `ChangePasswordDto`, `cash-audits.controller.ts`, `JwtAuthGuard`, `SubscriptionsService`, `HealthController`, `SubscriptionsService`, `NotificationsService`, `.create`, `RegisterPaymentDto`, `FxOperationsService`, `ApiBearerAuth`, `ApiProperty`, `.applyUserControlAction`, `ResendVerificationDto`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `Expo` connect `Controller` to `WorkerPaymentsController`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **What connects `MAX_TRANSACTION_TOTAL`, `PERSISTED_RATE_RELATIVE_TOLERANCE`, `$schema` to the rest of the system?**
  _171 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.0597567424643046 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.05134575569358178 - nodes in this community are weakly interconnected._