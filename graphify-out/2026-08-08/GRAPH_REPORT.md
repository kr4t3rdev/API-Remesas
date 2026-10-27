# Graph Report - API  (2026-08-08)

## Corpus Check
- 216 files · ~63,120 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1611 nodes · 3120 edges · 101 communities (83 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bbbcea36`
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
- FxOperationsService
- serializableTransaction
- ApiProperty
- IsNotEmpty
- IsNumber
- IsString
- ValidateIf
- Max
- Type
- Injectable
- ApiOperation
- ApiResponse
- Query
- CreateExpenseItemDto
- UpdateAdminUserDto
- QueryNotificationsDto
- .applyUserControlAction
- LoginDto
- UpdateExchangeRateDto
- VerifyEmailDto
- expenses.tenant-isolation.spec.ts
- Injectable

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 100 edges
2. `PrismaService` - 55 edges
3. `ReportsService` - 28 edges
4. `AdminService` - 26 edges
5. `AuthService` - 25 edges
6. `NotificationsService` - 25 edges
7. `AdminController` - 22 edges
8. `JwtAuthGuard` - 22 edges
9. `RemittanceEventDto` - 21 edges
10. `CreateExpenseDto` - 20 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  src/main.ts → src/app.module.ts
- `bootstrap()` --calls--> `parseCorsOrigins()`  [EXTRACTED]
  src/main.ts → src/config/environment.ts

## Import Cycles
- None detected.

## Communities (101 total, 18 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.12
Nodes (19): ApiParam, QueryExpenseItemDto, ApiPropertyOptional, IsDateString, IsOptional, IsString, ExpenseItemsController, ApiBearerAuth (+11 more)

### Community 2 - "CashService"
Cohesion: 0.14
Nodes (15): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+7 more)

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
Cohesion: 0.08
Nodes (27): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+19 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.09
Nodes (26): CurrenciesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+18 more)

### Community 9 - "ReportsService"
Cohesion: 0.13
Nodes (13): mockEmailService, mockPushNotificationsService, prisma, EmailResult, SendEmailDto, EmailService, Injectable, generateHtmlTemplate() (+5 more)

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
Nodes (18): ExchangeRatesController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+10 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.22
Nodes (9): DepositDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+1 more)

### Community 15 - "SubscriptionsService"
Cohesion: 0.15
Nodes (13): SubscriptionsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+5 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.16
Nodes (7): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, FxDomainExceptionFilter

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.08
Nodes (23): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 19 - "app.module.ts"
Cohesion: 0.06
Nodes (41): Global, AdminModule, Module, AppModule, Module, AuthModule, Module, BankAccountsModule (+33 more)

### Community 20 - "AuthController"
Cohesion: 0.19
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 21 - "AdminController"
Cohesion: 0.42
Nodes (3): main(), NotificationsService, Injectable

### Community 22 - "auth.controller.ts"
Cohesion: 0.18
Nodes (10): AuthController, ApiResponse, ApiTags, Body, Controller, Post, ResendVerificationDto, ApiProperty (+2 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 24 - "ReconciliationsController"
Cohesion: 0.15
Nodes (16): GetCashFlowReportDto, GetPeriodReportDto, GetProfitReportDto, ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags (+8 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.18
Nodes (10): CreateTransactionDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 26 - "auth.service.ts"
Cohesion: 0.18
Nodes (23): AccountReportItemDto, AccountsReportDto, AuditSummaryReportDtoSwagger, CashFlowReportDtoSwagger, CurrencyReportDto, DailyBreakdownItemDto, DailyExpenseByCategoryDto, DailyReportDto (+15 more)

### Community 27 - "TransactionsController"
Cohesion: 0.18
Nodes (10): ApiOperation, ApiResponse, Query, ApiHeader, Body, CurrentUser, Get, Headers (+2 more)

### Community 28 - "AuthService"
Cohesion: 0.22
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.14
Nodes (8): JwtStrategy, Injectable, closingA, closingB, PrismaService, Injectable, CYCLE_DAYS, CYCLE_USD

### Community 30 - "ChangePasswordDto"
Cohesion: 0.15
Nodes (12): AccountReportItem, DailyBreakdownItem, DailyExpenseByCategory, DailyExpenseCategorySummary, ExpensesByCurrencySummary, FxPerformanceMovement, FxPerformancePosition, ObjectiveReportItem (+4 more)

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

### Community 37 - "SubscriptionsService"
Cohesion: 0.14
Nodes (9): ReportsService, Injectable, AuditSummaryReportDto, CashFlowReportDto, CurrencyReportDto, DailyReportDto, ExpensesReportDto, PeriodReportDto (+1 more)

### Community 39 - "environment.ts"
Cohesion: 0.16
Nodes (12): Roles(), RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber (+4 more)

### Community 40 - ".reactivateLicense"
Cohesion: 0.08
Nodes (23): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+15 more)

### Community 41 - "HealthController"
Cohesion: 0.32
Nodes (3): HealthController, Controller, Get

### Community 42 - "RegisterDto"
Cohesion: 0.40
Nodes (4): SetPrimaryCurrencyDto, ApiProperty, IsInt, IsNotEmpty

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
Cohesion: 0.14
Nodes (10): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, Patch (+2 more)

### Community 48 - "HealthController"
Cohesion: 0.14
Nodes (13): Request, ApiBearerAuth, ApiOperation, Delete, Get, Param, Patch, Roles (+5 more)

### Community 49 - "VerifyEmailDto"
Cohesion: 0.27
Nodes (13): GetAuditSummaryDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto, GetExpensesReportDto, GetFxPerformanceReportDto, IsDateString, IsInt (+5 more)

### Community 50 - "UpdateWorkerDto"
Cohesion: 0.22
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 51 - "CreateFxTransferDto"
Cohesion: 0.15
Nodes (12): CreateFxTransferDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional (+4 more)

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 53 - "notifications.service.ts"
Cohesion: 0.16
Nodes (8): CashService, toDecimal(), toNumber(), Injectable, ApiProperty, IsNumber, Min, UpdateCashPolicyDto

### Community 54 - "Controller"
Cohesion: 0.20
Nodes (5): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 55 - "CreateExpenseDto"
Cohesion: 0.14
Nodes (14): ApiProperty, IsNotEmpty, IsNumber, IsString, MaxLength, CreateExpenseDto, ApiPropertyOptional, IsDateString (+6 more)

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.12
Nodes (16): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString (+8 more)

### Community 60 - "AdminUserActionDto"
Cohesion: 0.25
Nodes (6): OpenCurrencyPositionDto, ApiProperty, IsInt, IsNumber, Max, Min

### Community 62 - "CreateBankAccountDto"
Cohesion: 0.24
Nodes (4): SubscriptionsModule, Module, SubscriptionsService, Injectable

### Community 63 - "CreateTransactionDto"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 64 - "AddBalanceDto"
Cohesion: 0.17
Nodes (11): Max, QueryExpenseDto, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, Min (+3 more)

### Community 65 - ".findByCurrency"
Cohesion: 0.15
Nodes (9): ApiPropertyOptional, IsNumber, IsOptional, IsString, MaxLength, Min, UpdateExpenseItemDto, ExpenseItemsService (+1 more)

### Community 67 - "fx-operations.controller.ts"
Cohesion: 0.18
Nodes (11): FxOperationsController, ApiBearerAuth, ApiHeader, ApiTags, Body, Controller, CurrentUser, Headers (+3 more)

### Community 68 - "JwtAuthGuard"
Cohesion: 0.38
Nodes (3): CurrentUser, JwtAuthGuard, Injectable

### Community 69 - "UpdateAdminUserDto"
Cohesion: 0.29
Nodes (6): QueryTransactionDto, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional

### Community 70 - "ApiBearerAuth"
Cohesion: 0.17
Nodes (10): TransactionsController, ApiBearerAuth, ApiTags, Controller, UseFilters, UseGuards, TransactionsModule, Module (+2 more)

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.12
Nodes (16): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength, ForgotPasswordDto, ApiProperty, IsEmail (+8 more)

### Community 73 - "ApiProperty"
Cohesion: 0.16
Nodes (11): IsIn, IsExpoPushToken(), RegisterPushTokenDto, ApiProperty, IsString, ApiProperty, IsString, UnregisterPushTokenDto (+3 more)

### Community 74 - "QueryNotificationsDto"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 75 - ".applyUserControlAction"
Cohesion: 0.26
Nodes (3): AdminService, Injectable, AdminUserControlActionType

### Community 76 - ".createUser"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 77 - "ResendVerificationDto"
Cohesion: 0.20
Nodes (5): AuthService, Injectable, Injectable, VerificationTokenResult, VerificationTokenService

### Community 79 - "FxOperationsService"
Cohesion: 0.18
Nodes (6): Injectable, calculatePersistedRate(), FxOperationsService, MAX_TRANSACTION_TOTAL, PERSISTED_RATE_RELATIVE_TOLERANCE, rows

### Community 88 - "Injectable"
Cohesion: 0.19
Nodes (10): CreateCashClosingDto, ApiProperty, ApiPropertyOptional, IsDateString, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 92 - "CreateExpenseItemDto"
Cohesion: 0.17
Nodes (10): CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength (+2 more)

### Community 93 - "UpdateAdminUserDto"
Cohesion: 0.20
Nodes (8): Patch, ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 94 - "QueryNotificationsDto"
Cohesion: 0.22
Nodes (8): QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform, Type

### Community 95 - ".applyUserControlAction"
Cohesion: 0.29
Nodes (3): Body, Param, Post

### Community 96 - "LoginDto"
Cohesion: 0.29
Nodes (5): LoginDto, ApiProperty, IsEmail, IsString, MinLength

### Community 97 - "UpdateExchangeRateDto"
Cohesion: 0.33
Nodes (5): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto

### Community 98 - "VerifyEmailDto"
Cohesion: 0.40
Nodes (4): ApiProperty, IsNotEmpty, IsString, VerifyEmailDto

## Knowledge Gaps
- **167 isolated node(s):** `MAX_TRANSACTION_TOTAL`, `PERSISTED_RATE_RELATIVE_TOLERANCE`, `DailyExpenseByCategory`, `DailyExpenseCategorySummary`, `DailyBreakdownItem` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `JwtAuthGuard` to `ExpenseItemsService`, `CashService`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `CurrenciesController`, `ExchangeRatesService`, `CreateCashAdjustmentDto`, `AuthController`, `ReconciliationsController`, `auth.service.ts`, `cash-audits.controller.ts`, `SubscriptionsService`, `environment.ts`, `NotificationsService`, `RegisterPaymentDto`, `environment.ts`, `AddBalanceDto`, `expenses.controller.ts`, `ApiProperty`, `CreateExpenseItemDto`, `UpdateAdminUserDto`, `.applyUserControlAction`?**
  _High betweenness centrality (0.323) - this node is a cross-community bridge._
- **Why does `Expo` connect `Controller` to `WorkerPaymentsController`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `Controller`, `CreateTransactionDto`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **What connects `MAX_TRANSACTION_TOTAL`, `PERSISTED_RATE_RELATIVE_TOLERANCE`, `DailyExpenseByCategory` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.14333333333333334 - nodes in this community are weakly interconnected._
- **Should `CurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.07857142857142857 - nodes in this community are weakly interconnected._