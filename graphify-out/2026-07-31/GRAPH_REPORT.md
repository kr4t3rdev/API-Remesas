# Graph Report - API  (2026-07-30)

## Corpus Check
- 213 files · ~59,483 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1583 nodes · 3132 edges · 88 communities (74 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bd6c5690`
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
- notifications.service.ts
- Controller
- CreateExpenseDto
- subscriptions.service.ts
- seed.ts
- AdminUserActionDto
- CreateBankAccountDto
- CreateTransactionDto
- AddBalanceDto
- .findByCurrency
- ExpensesService
- fx-operations.controller.ts
- JwtAuthGuard
- UpdateAdminUserDto
- ApiBearerAuth
- expenses.controller.ts
- SetPrimaryCurrencyDto
- ApiProperty
- QueryNotificationsDto
- .applyUserControlAction
- .createUser
- ResendVerificationDto
- BankAccountsService
- FxOperationsService
- serializableTransaction
- ApiProperty
- IsNotEmpty
- IsNumber
- IsString
- ValidateIf
- Max
- Type

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 109 edges
2. `PrismaService` - 68 edges
3. `ReportsService` - 27 edges
4. `AdminService` - 26 edges
5. `AuthService` - 25 edges
6. `JwtAuthGuard` - 25 edges
7. `NotificationsService` - 25 edges
8. `AdminController` - 22 edges
9. `CreateExpenseDto` - 20 edges
10. `WorkerPaymentsService` - 20 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (88 total, 14 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (40): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+32 more)

### Community 2 - "CashService"
Cohesion: 0.07
Nodes (33): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+25 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.17
Nodes (12): ExpensesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+4 more)

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
Cohesion: 0.15
Nodes (13): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+5 more)

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
Cohesion: 0.08
Nodes (23): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto, ExchangeRatesController, ApiBearerAuth, ApiOperation (+15 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.22
Nodes (9): DepositDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.09
Nodes (21): SuspendLicenseDto, ApiPropertyOptional, IsOptional, IsString, SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags (+13 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.18
Nodes (13): CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, mapTransferMovement(), assertSaleAvailable(), calculateSaleSnapshot() (+5 more)

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.09
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.07
Nodes (35): Global, AdminModule, Module, AppModule, Module, AuthModule, Module, BankAccountsModule (+27 more)

### Community 20 - "AuthController"
Cohesion: 0.21
Nodes (14): CurrentUser, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+6 more)

### Community 21 - "AdminController"
Cohesion: 0.42
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.22
Nodes (5): AuthController, ApiTags, Body, Controller, Post

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.06
Nodes (51): Injectable, GetAuditSummaryDto, GetCashFlowReportDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto (+43 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.14
Nodes (15): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+7 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.23
Nodes (3): AdminService, Injectable, AdminUserControlActionType

### Community 27 - "TransactionsController"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.22
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.14
Nodes (10): JwtStrategy, Injectable, accounts, scopedFindFirst, closingA, closingB, PrismaService, Injectable (+2 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.09
Nodes (22): AccountReportItem, AccountsReportDto, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyBreakdownItem, DailyExpenseByCategory, DailyExpenseCategorySummary (+14 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.20
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+2 more)

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.08
Nodes (24): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 34 - ".create"
Cohesion: 0.13
Nodes (9): AdminController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Query, Roles (+1 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.15
Nodes (9): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.11
Nodes (13): Res, Controller, Get, Param, Post, UseGuards, UploadController, Module (+5 more)

### Community 39 - "environment.ts"
Cohesion: 0.15
Nodes (13): RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+5 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.08
Nodes (21): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+13 more)

### Community 41 - "HealthController"
Cohesion: 0.24
Nodes (5): HealthController, Controller, Get, HealthModule, Module

### Community 42 - "RegisterDto"
Cohesion: 0.40
Nodes (4): SetPrimaryCurrencyDto, ApiProperty, IsInt, IsNotEmpty

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
Cohesion: 0.08
Nodes (26): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+18 more)

### Community 47 - "environment.ts"
Cohesion: 0.12
Nodes (13): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 48 - "HealthController"
Cohesion: 0.14
Nodes (15): Request, ApiBearerAuth, ApiOperation, ApiResponse, Delete, Get, Param, Patch (+7 more)

### Community 49 - "VerifyEmailDto"
Cohesion: 0.40
Nodes (4): ApiProperty, IsNotEmpty, IsString, VerifyEmailDto

### Community 50 - "UpdateWorkerDto"
Cohesion: 0.22
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 51 - "CreateFxTransferDto"
Cohesion: 0.12
Nodes (15): CreateFxTransferDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional (+7 more)

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "notifications.service.ts"
Cohesion: 0.48
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 54 - "Controller"
Cohesion: 0.20
Nodes (5): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 55 - "CreateExpenseDto"
Cohesion: 0.13
Nodes (14): ApiProperty, IsNotEmpty, IsNumber, IsString, MaxLength, CreateExpenseDto, ApiPropertyOptional, IsDateString (+6 more)

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.13
Nodes (13): Roles(), AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional (+5 more)

### Community 60 - "AdminUserActionDto"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 62 - "CreateBankAccountDto"
Cohesion: 0.22
Nodes (10): CreateBankAccountDto, ApiProperty, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+2 more)

### Community 63 - "CreateTransactionDto"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 64 - "AddBalanceDto"
Cohesion: 0.17
Nodes (11): Max, QueryExpenseDto, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, Min (+3 more)

### Community 65 - ".findByCurrency"
Cohesion: 0.16
Nodes (7): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty, Injectable, VerificationTokenResult, VerificationTokenService

### Community 66 - "ExpensesService"
Cohesion: 0.23
Nodes (3): ExpensesService, Injectable, rows

### Community 67 - "fx-operations.controller.ts"
Cohesion: 0.20
Nodes (8): Catch, FxDomainExceptionFilter, FxOperationsController, ApiBearerAuth, ApiTags, Controller, UseFilters, UseGuards

### Community 69 - "UpdateAdminUserDto"
Cohesion: 0.20
Nodes (8): Patch, ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 70 - "ApiBearerAuth"
Cohesion: 0.24
Nodes (7): AuthService, Injectable, LoginDto, ApiProperty, IsEmail, IsString, MinLength

### Community 71 - "expenses.controller.ts"
Cohesion: 0.36
Nodes (4): ExpenseCategory, UpdateExpenseDto, ExpensesModule, Module

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.15
Nodes (11): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional, ResetPasswordDto, ApiProperty, IsNotEmpty, IsString (+3 more)

### Community 73 - "ApiProperty"
Cohesion: 0.26
Nodes (8): IsIn, IsExpoPushToken(), RegisterPushTokenDto, ApiProperty, IsString, ApiProperty, IsString, UnregisterPushTokenDto

### Community 74 - "QueryNotificationsDto"
Cohesion: 0.22
Nodes (8): QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform, Type

### Community 75 - ".applyUserControlAction"
Cohesion: 0.29
Nodes (3): Body, Param, Post

### Community 76 - ".createUser"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 77 - "ResendVerificationDto"
Cohesion: 0.29
Nodes (4): ResendVerificationDto, ApiProperty, IsEmail, IsNotEmpty

### Community 79 - "FxOperationsService"
Cohesion: 0.29
Nodes (3): FxOperationsService, Injectable, rows

## Knowledge Gaps
- **177 isolated node(s):** `rows`, `$schema`, `collection`, `sourceRoot`, `deleteOutDir` (+172 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `AuthController` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ExchangeRatesService`, `CreateCashAdjustmentDto`, `ReconciliationsController`, `upload.controller.ts`, `TransactionsController`, `cash-audits.controller.ts`, `SubscriptionsService`, `.reactivateLicense`, `NotificationsService`, `RegisterPaymentDto`, `environment.ts`, `CreateFxTransferDto`, `CreateBankAccountDto`, `AddBalanceDto`, `fx-operations.controller.ts`, `JwtAuthGuard`, `UpdateAdminUserDto`, `expenses.controller.ts`, `ApiProperty`, `.applyUserControlAction`?**
  _High betweenness centrality (0.394) - this node is a cross-community bridge._
- **Why does `Expo` connect `Controller` to `WorkerPaymentsController`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `expo-server-sdk` connect `Controller` to `dependencies`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `rows`, `$schema`, `collection` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.05704365079365079 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._
- **Should `CurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.07857142857142857 - nodes in this community are weakly interconnected._