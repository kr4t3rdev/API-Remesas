# Graph Report - API  (2026-07-22)

## Corpus Check
- 196 files · ~54,853 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1519 nodes · 2937 edges · 95 communities (54 shown, 41 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4d314f93`
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
- .uploadAvatar
- SetPrimaryCurrencyDto
- Module
- IsBoolean
- Max
- ValidateIf
- ApiOperation
- ApiResponse
- ApiTags
- Body
- Controller
- Delete
- Get
- Param
- Post
- Put
- UseGuards
- NotificationsService
- UpdateAdminUserDto
- auth.service.ts
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
- UseGuards
- Module

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 77 edges
2. `PrismaService` - 63 edges
3. `AdminService` - 26 edges
4. `ReportsService` - 26 edges
5. `NotificationsService` - 23 edges
6. `AdminController` - 22 edges
7. `AuthService` - 22 edges
8. `WorkerPaymentsService` - 21 edges
9. `JwtAuthGuard` - 21 edges
10. `SubscriptionsService` - 20 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (95 total, 41 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (40): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+32 more)

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
Cohesion: 0.12
Nodes (15): CreateFxTransferDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+7 more)

### Community 6 - "devDependencies"
Cohesion: 0.04
Nodes (46): devDependencies, eslint, eslint-config-prettier, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing (+38 more)

### Community 7 - "BankAccountsController"
Cohesion: 0.09
Nodes (26): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+18 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.09
Nodes (24): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+16 more)

### Community 9 - "ReportsService"
Cohesion: 0.08
Nodes (24): ReportsService, Injectable, AccountReportItem, AccountsReportDto, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyBreakdownItem (+16 more)

### Community 10 - "dependencies"
Cohesion: 0.05
Nodes (42): author, dependencies, bcrypt, class-transformer, class-validator, decimal.js, @nestjs/common, @nestjs/config (+34 more)

### Community 11 - "API Endpoints"
Cohesion: 0.05
Nodes (41): 10. income_reconciliations, 11. rate_history, 12. objectives, 13. users, 1. currencies, 2. exchange_rates, 3. transactions, 4. cash_balances (+33 more)

### Community 12 - "plans.controller.ts"
Cohesion: 0.08
Nodes (27): CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional, IsString, Min (+19 more)

### Community 13 - "ExchangeRatesService"
Cohesion: 0.10
Nodes (16): ExchangeRatesController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+8 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.08
Nodes (25): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+17 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.09
Nodes (21): SuspendLicenseDto, ApiPropertyOptional, IsOptional, IsString, SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags (+13 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.16
Nodes (7): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, FxDomainExceptionFilter

### Community 17 - "NotificationsService"
Cohesion: 0.20
Nodes (7): AuthController, ApiOperation, ApiResponse, ApiTags, Body, Controller, Post

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.08
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.05
Nodes (44): Global, Module, AdminModule, Module, AppModule, Module, AuthModule, BankAccountsModule (+36 more)

### Community 20 - "AuthController"
Cohesion: 0.07
Nodes (30): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+22 more)

### Community 21 - "AdminController"
Cohesion: 0.06
Nodes (28): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, CurrentUser, Delete (+20 more)

### Community 22 - "auth.controller.ts"
Cohesion: 0.19
Nodes (4): AuthService, Injectable, Injectable, VerificationTokenService

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.40
Nodes (3): CurrentUser, JwtAuthGuard, Injectable

### Community 25 - "upload.controller.ts"
Cohesion: 0.29
Nodes (6): QueryTransactionDto, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional

### Community 26 - "auth.service.ts"
Cohesion: 0.25
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 27 - "TransactionsController"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.20
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.22
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 30 - "ChangePasswordDto"
Cohesion: 0.25
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.10
Nodes (42): ApiProperty, IsBoolean, IsDateString, IsInt, IsOptional, IsString, Max, MaxLength (+34 more)

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.08
Nodes (24): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 34 - ".create"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.13
Nodes (12): Request, ApiBearerAuth, Delete, Get, Param, Patch, Roles, UseGuards (+4 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.07
Nodes (25): Roles(), RolesGuard, Injectable, AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum (+17 more)

### Community 39 - "environment.ts"
Cohesion: 0.13
Nodes (13): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+5 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.08
Nodes (21): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+13 more)

### Community 41 - "EmailService"
Cohesion: 0.11
Nodes (13): Res, Controller, Get, Param, Post, UseGuards, UploadController, Module (+5 more)

### Community 42 - "RegisterDto"
Cohesion: 0.17
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 48 - "HealthController"
Cohesion: 0.22
Nodes (7): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto, ExchangeRatesModule, Module

### Community 49 - "cash.tenant-isolation.spec.ts"
Cohesion: 0.32
Nodes (3): HealthController, Controller, Get

### Community 50 - "expenses.tenant-isolation.spec.ts"
Cohesion: 0.17
Nodes (9): FxOperationsController, ApiBearerAuth, ApiTags, Body, Controller, Headers, Post, UseFilters (+1 more)

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "notifications.service.ts"
Cohesion: 0.47
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 55 - "ForgotPasswordDto"
Cohesion: 0.09
Nodes (21): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty, LoginDto, ApiProperty, IsEmail, IsString (+13 more)

### Community 62 - "SetPrimaryCurrencyDto"
Cohesion: 0.29
Nodes (5): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength

### Community 81 - "UpdateAdminUserDto"
Cohesion: 0.25
Nodes (7): ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 82 - "auth.service.ts"
Cohesion: 0.15
Nodes (7): JwtStrategy, Injectable, VerificationTokenResult, PrismaService, Injectable, CYCLE_DAYS, CYCLE_USD

## Knowledge Gaps
- **163 isolated node(s):** `DailyExpenseByCategory`, `DailyExpenseCategorySummary`, `DailyBreakdownItem`, `PeriodTransactionCurrencySummary`, `TransactionTypeLite` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `ReconciliationsController` to `ExpenseItemsService`, `cash-audits.controller.ts`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `environment.ts`, `BankAccountsController`, `CurrenciesController`, `.reactivateLicense`, `EmailService`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `expenses.tenant-isolation.spec.ts`, `TransactionsController`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `auth.service.ts` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `fx-operations.service.ts`, `BankAccountsController`, `CurrenciesController`, `plans.controller.ts`, `ExchangeRatesService`, `RateHistoryController`, `SubscriptionsService`, `CreateCashAdjustmentDto`, `app.module.ts`, `auth.controller.ts`, `ReconciliationsController`, `TransactionsController`, `cash-audits.controller.ts`, `environment.ts`, `.reactivateLicense`, `EmailService`, `RegisterDto`, `HealthController`, `cash.tenant-isolation.spec.ts`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `JwtAuthGuard` connect `ReconciliationsController` to `ExpenseItemsService`, `cash-audits.controller.ts`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `SubscriptionsService`, `BankAccountsController`, `CurrenciesController`, `plans.controller.ts`, `ForgotPasswordDto`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **What connects `DailyExpenseByCategory`, `DailyExpenseCategorySummary`, `DailyBreakdownItem` to the rest of the system?**
  _163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.057859703020993344 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06393442622950819 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.059887005649717516 - nodes in this community are weakly interconnected._