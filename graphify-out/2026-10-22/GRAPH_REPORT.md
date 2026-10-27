# Graph Report - API  (2026-10-22)

## Corpus Check
- 234 files · ~96,586 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1746 nodes · 3056 edges · 154 communities (88 shown, 66 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29377f5f`
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
- upload.controller.ts
- auth.controller.ts
- CreateAdminUserDto
- ReconciliationsController
- upload.controller.ts
- auth.service.ts
- Injectable
- AuthService
- transactions.controller.ts
- ChangePasswordDto
- admin.controller.ts
- AdminUserActionDto
- cash-audits.controller.ts
- QueryNotificationsDto
- auth.module.ts
- SubscriptionsService
- SubscriptionsService
- CashService
- .reactivateLicense
- HealthController
- SubscriptionsService
- ExpensesService
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
- QueryExpenseDto
- .applyUserControlAction
- .createUser
- ResendVerificationDto
- .activateUser
- SetPrimaryCurrencyDto
- scripts
- Injectable
- SubscriptionsService
- reports.dto.ts
- notifications.controller.ts
- cash.controller.ts
- Expo
- CreateExpenseDto
- auth.controller.ts
- ApiProperty
- ApiPropertyOptional
- IsBoolean
- UpdateAdminUserDto
- package.json
- .applyUserControlAction
- LoginDto
- IsNumber
- IsOptional
- IsString
- Max
- Min
- ValidateIf
- NotificationsService
- compilerOptions
- ChangePasswordDto
- .uploadAvatar
- ExpensesService
- ActivateUserDto
- ForgotPasswordDto
- ResendVerificationDto
- SetPrimaryCurrencyDto
- AdminModule
- ApiBearerAuth
- ApiOperation
- ApiResponse
- ApiTags
- Body
- Controller
- Delete
- Get
- Param
- Patch
- Post
- Roles
- UseGuards
- Injectable
- smoke.ts
- environment.ts
- AppModule
- ApiPropertyOptional
- IsNumber
- IsInt
- Transform
- schema.d.ts
- RateHistoryController
- CheckEmailDto
- ObjectivesModule
- PlansModule
- ExchangeRatesService
- UpdateAdminUserDto
- RateHistoryModule
- ObjectivesModule
- expenses.tenant-isolation.spec.ts
- RateHistoryModule
- ReportsModule
- ApiQuery
- Put
- Query
- notifications.service.ts
- ExpenseItemsModule
- Put
- OpenCurrencyPositionDto
- Injectable

## God Nodes (most connected - your core abstractions)
1. `CurrentUser` - 77 edges
2. `PrismaService` - 43 edges
3. `ReportsService` - 29 edges
4. `AdminService` - 24 edges
5. `AuthService` - 23 edges
6. `scripts` - 22 edges
7. `AdminController` - 22 edges
8. `WorkerPaymentsService` - 22 edges
9. `AuthController` - 20 edges
10. `CreateExpenseDto` - 20 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `buildSwaggerConfig()`  [EXTRACTED]
  scripts/export-openapi.ts → src/swagger.ts
- `bootstrap()` --calls--> `buildSwaggerConfig()`  [EXTRACTED]
  src/main.ts → src/swagger.ts

## Import Cycles
- None detected.

## Communities (154 total, 66 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.06
Nodes (36): ApiParam, CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString (+28 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.17
Nodes (12): ExpensesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+4 more)

### Community 4 - "CurrentUser"
Cohesion: 0.08
Nodes (30): CreateObjectiveDto, ApiProperty, ApiPropertyOptional, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+22 more)

### Community 5 - "fx-operations.service.ts"
Cohesion: 0.18
Nodes (16): HttpCode, Put, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags (+8 more)

### Community 6 - "devDependencies"
Cohesion: 0.04
Nodes (48): devDependencies, eslint, eslint-config-prettier, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing (+40 more)

### Community 7 - "BankAccountsController"
Cohesion: 0.07
Nodes (28): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+20 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.22
Nodes (8): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString

### Community 9 - "ReportsService"
Cohesion: 0.19
Nodes (7): mockEmailService, mockPushNotificationsService, prisma, EmailResult, SendEmailDto, EmailService, Injectable

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
Nodes (15): ApiPropertyOptional, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches, Max (+7 more)

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
Cohesion: 0.14
Nodes (11): Roles(), RolesGuard, Injectable, RenewLicenseDto, ApiProperty, IsEnum, IsInt, SuspendLicenseDto (+3 more)

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.07
Nodes (24): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 19 - "app.module.ts"
Cohesion: 0.07
Nodes (37): CurrentUser, ReportsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, Get (+29 more)

### Community 20 - "AuthController"
Cohesion: 0.18
Nodes (13): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete, Get (+5 more)

### Community 21 - "upload.controller.ts"
Cohesion: 0.14
Nodes (9): Res, ApiTags, Controller, Get, UploadController, Module, UploadModule, Injectable (+1 more)

### Community 22 - "auth.controller.ts"
Cohesion: 0.20
Nodes (5): CashBalancesModule, Module, CashBalancesService, Injectable, toDecimalString()

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.12
Nodes (15): TransactionsController, ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags, Body, Controller (+7 more)

### Community 28 - "AuthService"
Cohesion: 0.18
Nodes (11): JwtAuthGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+3 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.14
Nodes (7): JwtStrategy, Injectable, PrismaService, Injectable, RegisterPushTokenDto, CYCLE_DAYS, CYCLE_USD

### Community 30 - "ChangePasswordDto"
Cohesion: 0.07
Nodes (58): ApiExtraModels, ApiProperty, IsDateString, IsInt, CashAdjustmentDto, CashAuditDto, CashAuditorDto, CashBalanceDto (+50 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.29
Nodes (6): AGENTS.md — App Finance API, Codebase Knowledge Graph (codebase-memory-mcp), Flujo de descubrimiento, Graphify, Proyecto, Índice, APP y cross-repo

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.07
Nodes (25): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+17 more)

### Community 35 - "auth.module.ts"
Cohesion: 0.14
Nodes (9): AdminModule, Module, AuthModule, Module, Injectable, VerificationTokenResult, VerificationTokenService, NotificationsModule (+1 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.21
Nodes (10): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, CurrentUser, Get (+2 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.40
Nodes (4): ApiProperty, IsNotEmpty, IsString, VerifyEmailDto

### Community 39 - "CashService"
Cohesion: 0.16
Nodes (7): CashModule, Module, CashService, toDecimal(), Injectable, closingA, closingB

### Community 40 - ".reactivateLicense"
Cohesion: 0.07
Nodes (22): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+14 more)

### Community 41 - "HealthController"
Cohesion: 0.20
Nodes (7): ApiOkResponse, HealthController, ApiTags, Controller, Get, HealthModule, Module

### Community 45 - "AdminService"
Cohesion: 0.29
Nodes (6): PlatformSeriesQueryDto, IsInt, IsOptional, Max, Min, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.08
Nodes (26): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min (+18 more)

### Community 47 - "environment.ts"
Cohesion: 0.15
Nodes (10): NotificationsController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, Patch (+2 more)

### Community 48 - "HealthController"
Cohesion: 0.08
Nodes (35): ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+27 more)

### Community 51 - "CreateFxTransferDto"
Cohesion: 0.16
Nodes (8): CreateWorkerDto, ApiProperty, IsOptional, IsString, ApiProperty, IsOptional, IsString, UpdateWorkerDto

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 60 - "FxOperationsService"
Cohesion: 0.15
Nodes (7): calculatePersistedRate(), FxOperationsService, MAX_TRANSACTION_TOTAL, PERSISTED_RATE_RELATIVE_TOLERANCE, rows, TransactionsService, Injectable

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
Cohesion: 0.25
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 67 - "fx-operations.controller.ts"
Cohesion: 0.14
Nodes (14): CreateExpenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber (+6 more)

### Community 70 - "ApiBearerAuth"
Cohesion: 0.16
Nodes (15): Global, AppModule, Module, DatabaseModule, Module, FxOperationsModule, Module, ObjectivesModule (+7 more)

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.20
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 73 - "ApiProperty"
Cohesion: 0.21
Nodes (5): Body, Delete, Post, PushNotificationsService, Injectable

### Community 75 - ".applyUserControlAction"
Cohesion: 0.07
Nodes (17): IsISO8601, IsObject, AdminService, AdminUserActionDto, AdminUserActionPayloadDto, AdminUserControlActionType, ApiProperty, ApiPropertyOptional (+9 more)

### Community 76 - ".createUser"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 77 - "ResendVerificationDto"
Cohesion: 0.33
Nodes (5): LoginDto, ApiProperty, IsEmail, IsString, MinLength

### Community 80 - "scripts"
Cohesion: 0.09
Nodes (22): scripts, build, lint, openapi:check, openapi:check:diff, openapi:export, openapi:lint, prisma:generate (+14 more)

### Community 82 - "SubscriptionsService"
Cohesion: 0.26
Nodes (4): SubscriptionsModule, Module, SubscriptionsService, Injectable

### Community 84 - "notifications.controller.ts"
Cohesion: 0.23
Nodes (8): IsIn, IsExpoPushToken(), RegisterPushTokenDto, ApiProperty, IsString, ApiProperty, IsString, UnregisterPushTokenDto

### Community 85 - "cash.controller.ts"
Cohesion: 0.18
Nodes (10): CreateCashClosingDto, ApiProperty, ApiPropertyOptional, IsDateString, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 87 - "Expo"
Cohesion: 0.20
Nodes (5): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 88 - "CreateExpenseDto"
Cohesion: 0.28
Nodes (4): serializableTransaction(), TransactionRunner, ExpensesService, Injectable

### Community 89 - "auth.controller.ts"
Cohesion: 0.06
Nodes (40): ActivateUserResponseDto, AdminUserListItemDto, AuthUserDto, AvailabilityResponseDto, CreateUserResponseDto, CurrentUserDto, LoginResponseDto, RegisterResponseDto (+32 more)

### Community 94 - "package.json"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 103 - "NotificationsService"
Cohesion: 0.33
Nodes (3): main(), NotificationsService, Injectable

### Community 104 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, lib, module, moduleResolution, noEmit, skipLibCheck, strict, target (+1 more)

### Community 105 - "ChangePasswordDto"
Cohesion: 0.33
Nodes (5): ChangePasswordDto, ApiProperty, IsOptional, IsString, MinLength

### Community 106 - ".uploadAvatar"
Cohesion: 0.50
Nodes (5): inertStub(), main(), bootstrap(), buildSwaggerConfig(), OPENAPI_OPTIONS

### Community 108 - "ActivateUserDto"
Cohesion: 0.40
Nodes (4): ActivateUserDto, ApiPropertyOptional, IsBoolean, IsOptional

### Community 109 - "ForgotPasswordDto"
Cohesion: 0.40
Nodes (4): ForgotPasswordDto, ApiProperty, IsEmail, IsNotEmpty

### Community 110 - "ResendVerificationDto"
Cohesion: 0.40
Nodes (4): ResendVerificationDto, ApiProperty, IsEmail, IsNotEmpty

### Community 111 - "SetPrimaryCurrencyDto"
Cohesion: 0.40
Nodes (4): SetPrimaryCurrencyDto, ApiProperty, IsInt, IsNotEmpty

### Community 112 - "AdminModule"
Cohesion: 0.17
Nodes (11): QueryExpenseDto, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, Max, Min (+3 more)

### Community 127 - "smoke.ts"
Cohesion: 0.22
Nodes (8): AssertSchemas, LoginBody, LoginOp, LoginResponse, LoginUser, MeResponse, _schemaGuard, Schemas

### Community 128 - "environment.ts"
Cohesion: 0.52
Nodes (5): assertHttpUrl(), DEVELOPMENT_ORIGINS, Environment, parseCorsOrigins(), validateEnvironment()

### Community 129 - "AppModule"
Cohesion: 0.30
Nodes (4): ExpenseCategory, UpdateExpenseDto, ExpensesModule, Module

### Community 134 - "schema.d.ts"
Cohesion: 0.33
Nodes (5): components, $defs, operations, paths, webhooks

### Community 135 - "RateHistoryController"
Cohesion: 0.33
Nodes (5): ApiProperty, IsNumber, Max, Min, UpdateExchangeRateDto

### Community 136 - "CheckEmailDto"
Cohesion: 0.50
Nodes (3): IsEmail, CheckEmailDto, ApiProperty

### Community 137 - "ObjectivesModule"
Cohesion: 0.22
Nodes (8): QueryNotificationsDto, IsBoolean, IsInt, IsOptional, Max, Min, Transform, Type

### Community 138 - "PlansModule"
Cohesion: 0.40
Nodes (4): ApiProperty, IsNumber, Min, UpdateCashPolicyDto

### Community 139 - "ExchangeRatesService"
Cohesion: 0.14
Nodes (4): Injectable, ExchangeRatesModule, Module, ExchangeRatesService

### Community 140 - "UpdateAdminUserDto"
Cohesion: 0.25
Nodes (7): ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 149 - "notifications.service.ts"
Cohesion: 0.48
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 155 - "OpenCurrencyPositionDto"
Cohesion: 0.12
Nodes (16): OpenCurrencyPositionDto, ApiProperty, IsInt, IsNumber, Max, Min, FxOperationsController, ApiBearerAuth (+8 more)

## Knowledge Gaps
- **201 isolated node(s):** `paths`, `webhooks`, `components`, `$defs`, `operations` (+196 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **66 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CurrentUser` connect `app.module.ts` to `ExpenseItemsService`, `AppModule`, `CreateExpenseDto`, `CurrentUser`, `BankAccountsController`, `.reactivateLicense`, `ApiProperty`, `RegisterPaymentDto`, `environment.ts`, `AdminModule`, `RateHistoryController`, `UpdateWorkerDto`, `notifications.controller.ts`, `AuthController`, `upload.controller.ts`, `OpenCurrencyPositionDto`, `ChangePasswordDto`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Why does `Expo` connect `Expo` to `ApiProperty`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `Expo`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `paths`, `webhooks`, `components` to the rest of the system?**
  _201 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.06370543541788427 - nodes in this community are weakly interconnected._
- **Should `CurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.08080808080808081 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._