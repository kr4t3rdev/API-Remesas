# Graph Report - API  (2026-07-15)

## Corpus Check
- 182 files · ~44,536 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1430 nodes · 2883 edges · 61 communities (57 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0aed01af`
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
- reconciliations.service.ts
- admin.controller.ts
- AdminUserActionDto
- cash-audits.controller.ts
- .create
- JwtAuthGuard
- AssignLicenseDto
- UpdateAdminUserDto
- PrismaService
- ChangePasswordDto
- RegisterPaymentDto
- RegisterDto
- WebhookService
- ReconcileExpenseDto
- ReconcileIncomeDto
- RegisterPaymentDto
- fx-operations.module.ts
- ForgotPasswordDto
- ResetPasswordDto
- LoginDto
- ReconciliationsService
- nest-cli.json
- .uploadAvatar
- Controller
- .activateUser
- .applyUserControlAction
- seed.ts
- UpdateAdminUserDto

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 108 edges
2. `PrismaService` - 74 edges
3. `AdminService` - 25 edges
4. `AuthService` - 25 edges
5. `JwtAuthGuard` - 25 edges
6. `ReportsService` - 23 edges
7. `SubscriptionsService` - 23 edges
8. `AdminController` - 21 edges
9. `compilerOptions` - 19 edges
10. `AuthController` - 18 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (61 total, 4 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.11
Nodes (16): QueryExpenseItemDto, ApiPropertyOptional, IsDateString, IsOptional, IsString, ApiPropertyOptional, IsNumber, IsOptional (+8 more)

### Community 1 - "WorkerPaymentsController"
Cohesion: 0.07
Nodes (35): AddBalanceDto, ApiProperty, IsNumber, Min, CreateTransactionDto, ApiProperty, IsNumber, IsOptional (+27 more)

### Community 2 - "CashService"
Cohesion: 0.06
Nodes (35): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+27 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.06
Nodes (37): CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNotEmpty (+29 more)

### Community 4 - "CurrentUser"
Cohesion: 0.08
Nodes (30): CreateObjectiveDto, ApiProperty, ApiPropertyOptional, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+22 more)

### Community 5 - "fx-operations.service.ts"
Cohesion: 0.07
Nodes (32): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, mapTransferMovement(), assertSaleAvailable() (+24 more)

### Community 6 - "devDependencies"
Cohesion: 0.04
Nodes (46): devDependencies, eslint, eslint-config-prettier, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing (+38 more)

### Community 7 - "BankAccountsController"
Cohesion: 0.09
Nodes (25): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+17 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.09
Nodes (24): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+16 more)

### Community 9 - "ReportsService"
Cohesion: 0.11
Nodes (15): ReportsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Controller, Get (+7 more)

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
Nodes (23): Max, ApiProperty, IsNumber, Min, UpdateExchangeRateDto, ExchangeRatesController, ApiBearerAuth, ApiOperation (+15 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.08
Nodes (25): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+17 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.16
Nodes (13): SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+5 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.09
Nodes (21): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+13 more)

### Community 17 - "NotificationsService"
Cohesion: 0.15
Nodes (14): ApiParam, ExpenseItemsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller (+6 more)

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.08
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.17
Nodes (11): RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+3 more)

### Community 20 - "AuthController"
Cohesion: 0.15
Nodes (12): Request, AuthController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Delete, Get (+4 more)

### Community 21 - "AdminController"
Cohesion: 0.11
Nodes (10): AdminController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, Query (+2 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.16
Nodes (13): ReconciliationsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+5 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.13
Nodes (13): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+5 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.13
Nodes (14): main(), mockEmailService, prisma, EmailResult, SendEmailDto, EmailService, Injectable, generateHtmlTemplate() (+6 more)

### Community 27 - "TransactionsController"
Cohesion: 0.07
Nodes (34): ReconciliationsModule, Module, CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber (+26 more)

### Community 28 - "AuthService"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 29 - "transactions.controller.ts"
Cohesion: 0.14
Nodes (16): AdminModule, Module, AuthModule, Module, BankAccountsModule, Module, CurrenciesModule, Module (+8 more)

### Community 30 - "reconciliations.service.ts"
Cohesion: 0.20
Nodes (11): ArrayMaxSize, ArrayMinSize, IsArray, CustomRateDto, ReconcileIncomeBulkDto, ApiProperty, ApiPropertyOptional, IsInt (+3 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.13
Nodes (12): LoginDto, ApiProperty, IsEmail, IsString, MinLength, ResendVerificationDto, ApiProperty, IsEmail (+4 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.24
Nodes (6): Controller, UploadController, Module, UploadModule, Injectable, UploadService

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.08
Nodes (24): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 34 - ".create"
Cohesion: 0.35
Nodes (3): CurrentUser, JwtAuthGuard, Injectable

### Community 35 - "JwtAuthGuard"
Cohesion: 0.16
Nodes (5): ApiResponse, Body, Post, AuthService, Injectable

### Community 36 - "AssignLicenseDto"
Cohesion: 0.11
Nodes (17): Roles(), AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional (+9 more)

### Community 37 - "UpdateAdminUserDto"
Cohesion: 0.18
Nodes (10): CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength (+2 more)

### Community 39 - "PrismaService"
Cohesion: 0.14
Nodes (7): PrismaService, Injectable, ReconciliationsService, Inject, Injectable, Inject, TransactionWebhookPayload

### Community 40 - "ChangePasswordDto"
Cohesion: 0.34
Nodes (3): AdminService, Injectable, AdminUserControlActionType

### Community 41 - "RegisterPaymentDto"
Cohesion: 0.33
Nodes (8): AppModule, Module, assertHttpUrl(), DEVELOPMENT_ORIGINS, Environment, parseCorsOrigins(), validateEnvironment(), bootstrap()

### Community 42 - "RegisterDto"
Cohesion: 0.20
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 43 - "WebhookService"
Cohesion: 0.18
Nodes (8): SubscriptionsModule, Module, CYCLE_DAYS, CYCLE_USD, Module, WebhookModule, Injectable, WebhookService

### Community 44 - "ReconcileExpenseDto"
Cohesion: 0.20
Nodes (9): ReconcileExpenseDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+1 more)

### Community 45 - "ReconcileIncomeDto"
Cohesion: 0.20
Nodes (9): ReconcileIncomeDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+1 more)

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 47 - "fx-operations.module.ts"
Cohesion: 0.29
Nodes (7): Global, DatabaseModule, Module, FxOperationsModule, Module, RemittancesModule, Module

### Community 48 - "ForgotPasswordDto"
Cohesion: 0.29
Nodes (4): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty

### Community 49 - "ResetPasswordDto"
Cohesion: 0.09
Nodes (20): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength, ResetPasswordDto, ApiProperty, IsNotEmpty (+12 more)

### Community 50 - "LoginDto"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - ".uploadAvatar"
Cohesion: 0.18
Nodes (7): Res, Get, Param, Post, UseGuards, UploadedFile, UseInterceptors

### Community 54 - "Controller"
Cohesion: 0.24
Nodes (5): HealthController, Controller, Get, HealthModule, Module

### Community 55 - ".activateUser"
Cohesion: 0.33
Nodes (4): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional

### Community 65 - "UpdateAdminUserDto"
Cohesion: 0.22
Nodes (8): Patch, ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

## Knowledge Gaps
- **133 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+128 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `.create` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `fx-operations.service.ts`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `ExchangeRatesService`, `RateHistoryController`, `current-user.decorator.ts`, `NotificationsService`, `CreateCashAdjustmentDto`, `ReconciliationsController`, `upload.controller.ts`, `TransactionsController`, `AdminUserActionDto`, `cash-audits.controller.ts`, `UpdateAdminUserDto`, `ChangePasswordDto`, `.uploadAvatar`, `.applyUserControlAction`, `UpdateAdminUserDto`?**
  _High betweenness centrality (0.317) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `PrismaService` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `fx-operations.service.ts`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `plans.controller.ts`, `ExchangeRatesService`, `RateHistoryController`, `current-user.decorator.ts`, `CreateCashAdjustmentDto`, `app.module.ts`, `auth.controller.ts`, `upload.controller.ts`, `auth.service.ts`, `TransactionsController`, `admin.controller.ts`, `AdminUserActionDto`, `cash-audits.controller.ts`, `JwtAuthGuard`, `ChangePasswordDto`, `WebhookService`, `fx-operations.module.ts`, `Controller`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `JwtAuthGuard` connect `.create` to `ExpenseItemsService`, `AdminUserActionDto`, `CurrentUser`, `AssignLicenseDto`, `BankAccountsController`, `ChangePasswordDto`, `CurrenciesController`, `ExchangeRatesService`, `ResetPasswordDto`, `app.module.ts`, `TransactionsController`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _133 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.10837438423645321 - nodes in this community are weakly interconnected._
- **Should `WorkerPaymentsController` be split into smaller, more focused modules?**
  _Cohesion score 0.06604324956165984 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06253652834599649 - nodes in this community are weakly interconnected._