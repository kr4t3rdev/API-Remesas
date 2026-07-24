# Graph Report - API  (2026-07-18)

## Corpus Check
- 191 files · ~50,982 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1415 nodes · 2840 edges · 59 communities (56 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `21b719a3`
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
- UpdateAdminUserDto
- environment.ts
- .reactivateLicense
- EmailService
- RegisterDto
- ExpensesService
- HealthController
- .getAvatar
- RegisterPaymentDto
- bank-accounts.tenant-isolation.spec.ts
- ForgotPasswordDto
- cash.tenant-isolation.spec.ts
- expenses.tenant-isolation.spec.ts
- subscriptions.module.ts
- nest-cli.json
- AdminModule
- Controller
- seed.ts

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 101 edges
2. `PrismaService` - 76 edges
3. `AdminService` - 25 edges
4. `AuthService` - 25 edges
5. `JwtAuthGuard` - 24 edges
6. `ReportsService` - 23 edges
7. `AdminController` - 21 edges
8. `WorkerPaymentsService` - 21 edges
9. `SubscriptionsService` - 20 edges
10. `compilerOptions` - 19 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (59 total, 3 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (38): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+30 more)

### Community 1 - "WorkerPaymentsController"
Cohesion: 0.19
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 2 - "CashService"
Cohesion: 0.07
Nodes (33): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+25 more)

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
Nodes (25): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+17 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.09
Nodes (26): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+18 more)

### Community 9 - "ReportsService"
Cohesion: 0.12
Nodes (14): CurrentUser, ReportsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Controller (+6 more)

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
Cohesion: 0.09
Nodes (21): SuspendLicenseDto, ApiPropertyOptional, IsOptional, IsString, SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags (+13 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.18
Nodes (13): CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, mapTransferMovement(), assertSaleAvailable(), calculateSaleSnapshot() (+5 more)

### Community 17 - "NotificationsService"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.09
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.06
Nodes (41): Global, AdminModule, Module, AppModule, Module, AuthModule, Module, BankAccountsModule (+33 more)

### Community 21 - "AdminController"
Cohesion: 0.11
Nodes (10): AdminController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, Query (+2 more)

### Community 22 - "auth.controller.ts"
Cohesion: 0.11
Nodes (17): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty, LoginDto, ApiProperty, IsEmail, IsString (+9 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.22
Nodes (8): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString

### Community 25 - "upload.controller.ts"
Cohesion: 0.26
Nodes (5): Roles(), JwtAuthGuard, Injectable, RolesGuard, Injectable

### Community 26 - "auth.service.ts"
Cohesion: 0.25
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 27 - "TransactionsController"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.16
Nodes (11): mockEmailService, prisma, EmailResult, SendEmailDto, EmailService, Injectable, generateHtmlTemplate(), generateTextTemplate() (+3 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.22
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 30 - "ChangePasswordDto"
Cohesion: 0.29
Nodes (5): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.36
Nodes (3): main(), NotificationsService, Injectable

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.08
Nodes (24): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 34 - ".create"
Cohesion: 0.35
Nodes (3): AdminService, Injectable, AdminUserControlActionType

### Community 35 - "JwtAuthGuard"
Cohesion: 0.13
Nodes (13): Request, ApiBearerAuth, ApiResponse, Delete, Get, Param, Patch, Roles (+5 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 37 - "UpdateAdminUserDto"
Cohesion: 0.20
Nodes (8): Patch, ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 39 - "environment.ts"
Cohesion: 0.13
Nodes (13): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+5 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.08
Nodes (21): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+13 more)

### Community 41 - "EmailService"
Cohesion: 0.05
Nodes (27): Res, JwtStrategy, Injectable, accounts, scopedFindFirst, closingA, closingB, PrismaService (+19 more)

### Community 42 - "RegisterDto"
Cohesion: 0.20
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 43 - "ExpensesService"
Cohesion: 0.40
Nodes (4): RenewLicenseDto, ApiProperty, IsEnum, IsInt

### Community 44 - "HealthController"
Cohesion: 0.18
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+2 more)

### Community 45 - ".getAvatar"
Cohesion: 0.20
Nodes (9): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 47 - "bank-accounts.tenant-isolation.spec.ts"
Cohesion: 0.23
Nodes (7): ResendVerificationDto, ApiProperty, IsEmail, IsNotEmpty, Injectable, VerificationTokenResult, VerificationTokenService

### Community 48 - "ForgotPasswordDto"
Cohesion: 0.14
Nodes (8): AuthController, ApiOperation, ApiTags, Body, Controller, Post, AuthService, Injectable

### Community 49 - "cash.tenant-isolation.spec.ts"
Cohesion: 0.20
Nodes (9): DepositDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 50 - "expenses.tenant-isolation.spec.ts"
Cohesion: 0.14
Nodes (10): Catch, FxDomainExceptionFilter, FxOperationsController, ApiBearerAuth, ApiTags, Controller, UseFilters, UseGuards (+2 more)

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "AdminModule"
Cohesion: 0.26
Nodes (9): CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional, IsString, Min (+1 more)

### Community 54 - "Controller"
Cohesion: 0.14
Nodes (15): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+7 more)

## Knowledge Gaps
- **150 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+145 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `ReportsService` to `ExpenseItemsService`, `WorkerPaymentsController`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `fx-operations.service.ts`, `BankAccountsController`, `CurrenciesController`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `upload.controller.ts`, `TransactionsController`, `transactions.controller.ts`, `cash-audits.controller.ts`, `UpdateAdminUserDto`, `environment.ts`, `.reactivateLicense`, `EmailService`, `expenses.tenant-isolation.spec.ts`, `subscriptions.module.ts`, `Controller`?**
  _High betweenness centrality (0.310) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `EmailService` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `plans.controller.ts`, `ExchangeRatesService`, `RateHistoryController`, `SubscriptionsService`, `current-user.decorator.ts`, `CreateCashAdjustmentDto`, `app.module.ts`, `AuthController`, `TransactionsController`, `AuthService`, `transactions.controller.ts`, `AdminUserActionDto`, `cash-audits.controller.ts`, `.create`, `environment.ts`, `.reactivateLicense`, `bank-accounts.tenant-isolation.spec.ts`, `ForgotPasswordDto`, `expenses.tenant-isolation.spec.ts`, `AdminModule`, `Controller`?**
  _High betweenness centrality (0.123) - this node is a cross-community bridge._
- **Why does `JwtAuthGuard` connect `upload.controller.ts` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ReportsService`, `ExchangeRatesService`, `RateHistoryController`, `CreateCashAdjustmentDto`, `auth.controller.ts`, `transactions.controller.ts`, `cash-audits.controller.ts`, `environment.ts`, `.reactivateLicense`, `EmailService`, `expenses.tenant-isolation.spec.ts`, `AdminModule`, `Controller`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.0597567424643046 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.05711263881544157 - nodes in this community are weakly interconnected._