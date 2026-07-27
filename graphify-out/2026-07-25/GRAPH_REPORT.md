# Graph Report - API  (2026-07-24)

## Corpus Check
- 203 files · ~55,755 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1568 nodes · 3040 edges · 104 communities (69 shown, 35 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ec826c9e`
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
- ObjectivesModule
- WorkerPaymentsModule
- ApiBearerAuth
- ApiOperation
- ApiTags
- Controller
- Get
- Param
- Patch
- Query
- UseGuards
- Module

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 97 edges
2. `PrismaService` - 69 edges
3. `ReportsService` - 27 edges
4. `AdminService` - 25 edges
5. `NotificationsService` - 23 edges
6. `AuthService` - 23 edges
7. `JwtAuthGuard` - 23 edges
8. `AdminController` - 22 edges
9. `WorkerPaymentsService` - 21 edges
10. `SubscriptionsService` - 19 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (104 total, 35 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (40): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+32 more)

### Community 1 - "WorkerPaymentsController"
Cohesion: 0.12
Nodes (11): IsIn, IsString, Module, mockEmailService, mockPushNotificationsService, prisma, RegisterPushTokenDto, NotificationsModule (+3 more)

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
Cohesion: 0.19
Nodes (3): ReportsService, Injectable, ProfitReportDto

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
Cohesion: 0.09
Nodes (21): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto, ExchangeRatesController, ApiBearerAuth, ApiOperation (+13 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.09
Nodes (23): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+15 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.16
Nodes (13): SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+5 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.07
Nodes (36): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, mapTransferMovement(), assertSaleAvailable() (+28 more)

### Community 17 - "NotificationsService"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.17
Nodes (9): CashAdjustmentsController, ApiBearerAuth, ApiTags, Controller, UseGuards, CashAdjustmentsModule, Module, CashAdjustmentsService (+1 more)

### Community 19 - "app.module.ts"
Cohesion: 0.09
Nodes (25): Global, AdminModule, Module, AuthModule, Module, BankAccountsModule, Module, CashModule (+17 more)

### Community 20 - "AuthController"
Cohesion: 0.05
Nodes (52): CurrentUser, AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber (+44 more)

### Community 21 - "AdminController"
Cohesion: 0.35
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.14
Nodes (9): AuthService, Injectable, ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty, Injectable, VerificationTokenResult (+1 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.24
Nodes (16): GetAuditSummaryDto, GetCashFlowReportDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, GetPeriodReportDto (+8 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.14
Nodes (13): LoginDto, ApiProperty, IsEmail, IsString, MinLength, ResendVerificationDto, ApiProperty, IsEmail (+5 more)

### Community 27 - "TransactionsController"
Cohesion: 0.13
Nodes (15): TransactionsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.17
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.16
Nodes (10): RemittancesController, ApiBearerAuth, ApiTags, Body, Controller, Get, Headers, Param (+2 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.15
Nodes (13): RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+5 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.18
Nodes (23): ApiProperty, AccountReportItemDto, AccountsReportDto, AuditSummaryReportDtoSwagger, CashFlowReportDtoSwagger, CurrencyReportDto, DailyBreakdownItemDto, DailyExpenseByCategoryDto (+15 more)

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.08
Nodes (24): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 34 - ".create"
Cohesion: 0.15
Nodes (16): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, AdminUserControlActionType, ApiProperty, ApiPropertyOptional, IsEnum (+8 more)

### Community 35 - "JwtAuthGuard"
Cohesion: 0.13
Nodes (13): Request, ApiBearerAuth, ApiOperation, Delete, Get, Param, Patch, Roles (+5 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.15
Nodes (10): Controller, Post, UseGuards, UploadController, Module, UploadModule, Injectable, UploadService (+2 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.28
Nodes (10): ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get, Param (+2 more)

### Community 39 - "environment.ts"
Cohesion: 0.10
Nodes (21): AccountReportItem, AccountsReportDto, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyBreakdownItem, DailyExpenseByCategory, DailyExpenseCategorySummary (+13 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.13
Nodes (11): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+3 more)

### Community 42 - "RegisterDto"
Cohesion: 0.14
Nodes (15): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+7 more)

### Community 43 - "NotificationsService"
Cohesion: 0.20
Nodes (9): CashBalancesController, ApiBearerAuth, ApiTags, Controller, UseGuards, CashBalancesModule, Module, CashBalancesService (+1 more)

### Community 44 - "HealthController"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 45 - "AdminService"
Cohesion: 0.29
Nodes (6): IsInt, IsOptional, Max, Min, PlatformSeriesQueryDto, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.26
Nodes (6): EmailResult, SendEmailDto, EmailModule, Module, EmailService, Injectable

### Community 47 - "environment.ts"
Cohesion: 0.33
Nodes (8): AppModule, Module, assertHttpUrl(), DEVELOPMENT_ORIGINS, Environment, parseCorsOrigins(), validateEnvironment(), bootstrap()

### Community 48 - "HealthController"
Cohesion: 0.15
Nodes (10): AuthController, ApiResponse, ApiTags, Body, Controller, Post, ApiProperty, IsNotEmpty (+2 more)

### Community 49 - "cash.tenant-isolation.spec.ts"
Cohesion: 0.32
Nodes (3): HealthController, Controller, Get

### Community 50 - "expenses.tenant-isolation.spec.ts"
Cohesion: 0.29
Nodes (3): FxOperationsService, Injectable, rows

### Community 51 - "admin.controller.ts"
Cohesion: 0.20
Nodes (7): ApiOperation, ApiQuery, ApiResponse, Body, Get, Post, Query

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "notifications.service.ts"
Cohesion: 0.47
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 54 - "Controller"
Cohesion: 0.22
Nodes (4): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushTicket

### Community 55 - "ForgotPasswordDto"
Cohesion: 0.22
Nodes (4): SubscriptionsModule, Module, SubscriptionsService, Injectable

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.11
Nodes (17): Roles(), AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional (+9 more)

### Community 60 - "ResetPasswordDto"
Cohesion: 0.25
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 62 - "QueryNotificationsDto"
Cohesion: 0.22
Nodes (8): QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform, Type

### Community 63 - "CreateTransactionDto"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 64 - "AddBalanceDto"
Cohesion: 0.29
Nodes (5): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength

### Community 65 - ".findByCurrency"
Cohesion: 0.32
Nodes (4): ApiOperation, ApiResponse, Get, Param

### Community 66 - "AdminController"
Cohesion: 0.29
Nodes (7): CreateCashAdjustmentDto, ApiProperty, IsEnum, IsInt, IsNumber, IsString, Min

### Community 67 - ".getAvatar"
Cohesion: 0.50
Nodes (3): Res, Get, Param

### Community 81 - "UpdateAdminUserDto"
Cohesion: 0.25
Nodes (7): ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 82 - "auth.service.ts"
Cohesion: 0.16
Nodes (8): JwtStrategy, Injectable, closingA, closingB, PrismaService, Injectable, CYCLE_DAYS, CYCLE_USD

### Community 83 - "ApiBearerAuth"
Cohesion: 0.18
Nodes (3): ApiOperation, Get, Query

### Community 86 - "Body"
Cohesion: 0.14
Nodes (12): ApiBearerAuth, ApiTags, Body, Controller, CurrentUser, Param, Patch, Post (+4 more)

## Knowledge Gaps
- **167 isolated node(s):** `name`, `version`, `description`, `main`, `build` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `AuthController` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ExchangeRatesService`, `RateHistoryController`, `current-user.decorator.ts`, `CreateCashAdjustmentDto`, `TransactionsController`, `transactions.controller.ts`, `AdminUserActionDto`, `cash-audits.controller.ts`, `SubscriptionsService`, `SubscriptionsService`, `.reactivateLicense`, `RegisterDto`, `NotificationsService`, `admin.controller.ts`, `.findByCurrency`?**
  _High betweenness centrality (0.218) - this node is a cross-community bridge._
- **Why does `Expo` connect `Controller` to `WorkerPaymentsController`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `Controller`, `CreateTransactionDto`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.057859703020993344 - nodes in this community are weakly interconnected._
- **Should `WorkerPaymentsController` be split into smaller, more focused modules?**
  _Cohesion score 0.12333333333333334 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.06836055656382335 - nodes in this community are weakly interconnected._