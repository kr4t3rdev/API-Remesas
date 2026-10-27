# Graph Report - API  (2026-10-24)

## Corpus Check
- 243 files · ~109,307 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1831 nodes · 2972 edges · 162 communities (95 shown, 67 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a00a3c86`
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
- CreateRateHistoryDto
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
- RemittancesService
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
- RemittanceEventDto
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
- CashBalancesController
- CashService
- ApiPropertyOptional
- IsNumber
- IsInt
- Transform
- schema.d.ts
- RateHistoryController
- CheckEmailDto
- ObjectivesModule
- PlansModule
- HealthController
- UpdateAdminUserDto
- toDecimalString
- ObjectivesModule
- AssignLicenseDto
- RateHistoryModule
- ReportsModule
- ApiQuery
- Put
- Query
- UploadController
- Put
- VerificationTokenService
- cash.service.ts
- admin.module.ts
- OpenCurrencyPositionDto
- environment.ts
- AppModule
- Put
- Injectable
- Patch
- ApiQuery

## God Nodes (most connected - your core abstractions)
1. `PrismaService` - 36 edges
2. `ReportsService` - 29 edges
3. `AdminService` - 26 edges
4. `AuthService` - 23 edges
5. `AdminController` - 22 edges
6. `scripts` - 22 edges
7. `AuthController` - 20 edges
8. `WorkerPaymentsService` - 20 edges
9. `compilerOptions` - 19 edges
10. `RemittancesService` - 18 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `buildSwaggerConfig()`  [EXTRACTED]
  scripts/export-openapi.ts → src/swagger.ts
- `bootstrap()` --calls--> `buildSwaggerConfig()`  [EXTRACTED]
  src/main.ts → src/swagger.ts

## Import Cycles
- None detected.

## Communities (162 total, 67 thin omitted)

### Community 0 - "ExpenseItemsService"
Cohesion: 0.09
Nodes (19): ApiParam, ExpenseItemsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller (+11 more)

### Community 2 - "CashService"
Cohesion: 0.14
Nodes (11): CurrenciesService, Injectable, CreateCurrencyDto, ApiProperty, IsBoolean, IsNotEmpty, IsOptional, IsString (+3 more)

### Community 3 - "CreateExpenseDto"
Cohesion: 0.07
Nodes (29): serializableTransaction(), TransactionRunner, CreateExpenseDto, ExpenseCategory, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum (+21 more)

### Community 4 - "CurrentUser"
Cohesion: 0.10
Nodes (23): ObjectivesController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+15 more)

### Community 5 - "fx-operations.service.ts"
Cohesion: 0.19
Nodes (15): HttpCode, CashController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body (+7 more)

### Community 6 - "devDependencies"
Cohesion: 0.04
Nodes (48): devDependencies, eslint, eslint-config-prettier, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing (+40 more)

### Community 7 - "BankAccountsController"
Cohesion: 0.08
Nodes (25): BankAccountsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, CurrentUser (+17 more)

### Community 8 - "CurrenciesController"
Cohesion: 0.18
Nodes (10): CreateObjectiveDto, ApiProperty, ApiPropertyOptional, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+2 more)

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
Cohesion: 0.06
Nodes (31): RolesGuard, Injectable, CreatePlanDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNumber, IsOptional (+23 more)

### Community 13 - "ExchangeRatesService"
Cohesion: 0.09
Nodes (20): ApiPropertyOptional, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches, Max (+12 more)

### Community 14 - "RateHistoryController"
Cohesion: 0.17
Nodes (8): QueryTransactionDto, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, TransactionsService, Injectable

### Community 15 - "SubscriptionsService"
Cohesion: 0.17
Nodes (15): ExpensesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, CurrentUser (+7 more)

### Community 16 - "current-user.decorator.ts"
Cohesion: 0.16
Nodes (7): Catch, CurrencyPositionUnavailableError, FX_ERROR_CODES, FxDomainError, InsufficientSaldoError, InvalidRateError, FxDomainExceptionFilter

### Community 17 - "NotificationsService"
Cohesion: 0.40
Nodes (4): RenewLicenseDto, ApiProperty, IsEnum, IsInt

### Community 18 - "CreateCashAdjustmentDto"
Cohesion: 0.07
Nodes (24): CashAdjustmentsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+16 more)

### Community 19 - "app.module.ts"
Cohesion: 0.05
Nodes (52): IsDateString, IsInt, CurrentUser, GetAuditSummaryDto, GetCashFlowReportDto, GetCurrencyReportByIdParamDto, GetCurrencyReportDto, GetDailyReportDto (+44 more)

### Community 20 - "AuthController"
Cohesion: 0.10
Nodes (17): ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, CurrentUser, Delete (+9 more)

### Community 21 - "upload.controller.ts"
Cohesion: 0.48
Nodes (5): generateHtmlTemplate(), generateTextTemplate(), getTemplate(), TemplateData, TemplateOutput

### Community 22 - "auth.controller.ts"
Cohesion: 0.20
Nodes (13): Put, ExchangeRatesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller (+5 more)

### Community 23 - "CreateAdminUserDto"
Cohesion: 0.19
Nodes (22): AdminRiskLevel, CreateAdminUserAccessDto, CreateAdminUserContactDto, CreateAdminUserDto, CreateAdminUserLicenseSetupDto, CreateAdminUserPreferencesDto, CreateAdminUserProfileDto, CreateAdminUserSecurityDto (+14 more)

### Community 25 - "upload.controller.ts"
Cohesion: 0.14
Nodes (16): TransactionsController, ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse, ApiTags, Body, Controller (+8 more)

### Community 28 - "AuthService"
Cohesion: 0.20
Nodes (9): CreateExpenseItemDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength (+1 more)

### Community 29 - "transactions.controller.ts"
Cohesion: 0.13
Nodes (9): JwtStrategy, Injectable, PrismaService, Injectable, rows, RegisterPushTokenDto, CYCLE_DAYS, CYCLE_USD (+1 more)

### Community 30 - "ChangePasswordDto"
Cohesion: 0.07
Nodes (56): ApiExtraModels, ApiProperty, AdminAuditLogDto, AdminExpiringLicenseDto, AdminKpisDto, AdminLicenseActionDto, AdminPlatformSeriesBucketDto, AdminPlatformSeriesDto (+48 more)

### Community 31 - "admin.controller.ts"
Cohesion: 0.17
Nodes (11): build, buildCommand, builder, deploy, healthcheckPath, healthcheckTimeout, preDeployCommand, restartPolicyMaxRetries (+3 more)

### Community 32 - "AdminUserActionDto"
Cohesion: 0.29
Nodes (6): AGENTS.md — App Finance API, Codebase Knowledge Graph (codebase-memory-mcp), Flujo de descubrimiento, Graphify, Proyecto, Índice, APP y cross-repo

### Community 33 - "cash-audits.controller.ts"
Cohesion: 0.07
Nodes (25): CashAuditsController, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller (+17 more)

### Community 34 - "QueryNotificationsDto"
Cohesion: 0.53
Nodes (5): ApiProperty, WorkerBalanceDto, WorkerDto, WorkerMutationResultDto, WorkerTransactionDto

### Community 35 - "auth.module.ts"
Cohesion: 0.18
Nodes (10): CreateBankAccountDto, ApiProperty, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString (+2 more)

### Community 36 - "SubscriptionsService"
Cohesion: 0.18
Nodes (13): PlansController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Delete (+5 more)

### Community 37 - "SubscriptionsService"
Cohesion: 0.40
Nodes (4): ApiProperty, IsNotEmpty, IsString, VerifyEmailDto

### Community 39 - "CashService"
Cohesion: 0.16
Nodes (3): ExchangeRatesModule, Module, ExchangeRatesService

### Community 40 - ".reactivateLicense"
Cohesion: 0.19
Nodes (12): RemittancesController, ApiBearerAuth, ApiResponse, ApiTags, Body, Controller, CurrentUser, Get (+4 more)

### Community 43 - "ExpensesService"
Cohesion: 0.07
Nodes (22): ApiBody, ApiConsumes, Res, AvatarUploadResponseDto, AvatarUserDto, ApiBearerAuth, ApiProperty, ApiResponse (+14 more)

### Community 45 - "AdminService"
Cohesion: 0.29
Nodes (6): PlatformSeriesQueryDto, IsInt, IsOptional, Max, Min, Type

### Community 46 - "RegisterPaymentDto"
Cohesion: 0.10
Nodes (19): RateHistoryController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, CurrentUser (+11 more)

### Community 47 - "environment.ts"
Cohesion: 0.13
Nodes (21): NotificationsController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, CurrentUser (+13 more)

### Community 48 - "HealthController"
Cohesion: 0.08
Nodes (21): ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, Body, Controller, CurrentUser (+13 more)

### Community 50 - "UpdateWorkerDto"
Cohesion: 0.60
Nodes (4): ExpenseItemDto, ExpenseItemReportDto, ExpenseItemReportItemDto, ApiProperty

### Community 51 - "CreateFxTransferDto"
Cohesion: 0.05
Nodes (36): AddBalanceDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+28 more)

### Community 52 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 56 - "subscriptions.service.ts"
Cohesion: 0.18
Nodes (10): RegisterPaymentDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsNumber, IsOptional (+2 more)

### Community 60 - "FxOperationsService"
Cohesion: 0.05
Nodes (16): Injectable, AuthService, calculatePersistedRate(), FxOperationsService, MAX_TRANSACTION_TOTAL, PERSISTED_RATE_RELATIVE_TOLERANCE, CreateTransactionDto, ApiProperty (+8 more)

### Community 62 - "CreateTransactionDto"
Cohesion: 0.19
Nodes (10): ExpenseDto, ExpenseListDto, FxTransferResultDto, PlanDto, ReconcileIssueDto, ReconcilePositionDto, RemittanceDto, RemittanceReconcileDto (+2 more)

### Community 65 - "DepositDto"
Cohesion: 0.18
Nodes (10): RemittanceEventDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 66 - "ExpensesService"
Cohesion: 0.25
Nodes (7): ResetPasswordDto, ApiProperty, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 67 - "CreateRateHistoryDto"
Cohesion: 0.22
Nodes (8): CreateRateHistoryDto, RateSource, ApiProperty, IsEnum, IsNumber, IsOptional, IsString, Min

### Community 69 - "AssignLicenseDto"
Cohesion: 0.60
Nodes (4): RateHistoryEntryDto, RateHistoryResetDto, RateHistoryStatsDto, ApiProperty

### Community 70 - "ApiBearerAuth"
Cohesion: 0.10
Nodes (21): Global, AdminModule, Module, AppModule, Module, CurrenciesModule, Module, DatabaseModule (+13 more)

### Community 72 - "SetPrimaryCurrencyDto"
Cohesion: 0.20
Nodes (9): RegisterDto, ApiProperty, ApiPropertyOptional, IsEmail, IsOptional, IsString, Matches, MaxLength (+1 more)

### Community 74 - "QueryExpenseDto"
Cohesion: 0.29
Nodes (6): OpenCurrencyPositionDto, ApiProperty, IsInt, IsNumber, Max, Min

### Community 75 - ".applyUserControlAction"
Cohesion: 0.16
Nodes (15): IsISO8601, IsObject, AdminUserActionDto, AdminUserActionPayloadDto, ApiProperty, ApiPropertyOptional, IsEnum, IsInt (+7 more)

### Community 76 - ".createUser"
Cohesion: 0.29
Nodes (6): CreateUserDto, ApiProperty, IsEmail, IsEnum, IsString, MinLength

### Community 77 - "ResendVerificationDto"
Cohesion: 0.33
Nodes (5): LoginDto, ApiProperty, IsEmail, IsString, MinLength

### Community 80 - "scripts"
Cohesion: 0.09
Nodes (22): scripts, build, lint, openapi:check, openapi:check:diff, openapi:export, openapi:lint, prisma:generate (+14 more)

### Community 84 - "notifications.controller.ts"
Cohesion: 0.24
Nodes (8): IsIn, IsExpoPushToken(), RegisterPushTokenDto, ApiProperty, IsString, ApiProperty, IsString, UnregisterPushTokenDto

### Community 85 - "cash.controller.ts"
Cohesion: 0.18
Nodes (10): CreateCashClosingDto, ApiProperty, ApiPropertyOptional, IsDateString, IsInt, IsNumber, IsOptional, IsString (+2 more)

### Community 87 - "Expo"
Cohesion: 0.20
Nodes (5): expo-server-sdk, Expo, ExpoPushMessage, ExpoPushReceipt, ExpoPushTicket

### Community 88 - "RemittancesService"
Cohesion: 0.33
Nodes (5): QueryExpenseItemDto, ApiPropertyOptional, IsDateString, IsOptional, IsString

### Community 89 - "auth.controller.ts"
Cohesion: 0.10
Nodes (27): ActivateUserResponseDto, AdminUserListItemDto, AuthUserDto, AvailabilityResponseDto, CreateUserResponseDto, CurrentUserDto, LoginResponseDto, RegisterResponseDto (+19 more)

### Community 94 - "package.json"
Cohesion: 0.25
Nodes (7): author, description, keywords, license, main, name, version

### Community 103 - "NotificationsService"
Cohesion: 0.26
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

### Community 112 - "RemittanceEventDto"
Cohesion: 0.40
Nodes (4): SuspendLicenseDto, ApiPropertyOptional, IsOptional, IsString

### Community 127 - "smoke.ts"
Cohesion: 0.22
Nodes (8): AssertSchemas, LoginBody, LoginOp, LoginResponse, LoginUser, MeResponse, _schemaGuard, Schemas

### Community 128 - "CashBalancesController"
Cohesion: 0.21
Nodes (10): CashBalancesController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Controller, CurrentUser, Get (+2 more)

### Community 129 - "CashService"
Cohesion: 0.16
Nodes (7): CashModule, Module, CashService, toDecimal(), Injectable, closingA, closingB

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

### Community 139 - "HealthController"
Cohesion: 0.20
Nodes (7): ApiOkResponse, HealthController, ApiTags, Controller, Get, HealthModule, Module

### Community 140 - "UpdateAdminUserDto"
Cohesion: 0.25
Nodes (7): ApiPropertyOptional, IsBoolean, IsEmail, IsOptional, IsString, MaxLength, UpdateAdminUserDto

### Community 141 - "toDecimalString"
Cohesion: 0.19
Nodes (5): CashBalancesModule, Module, CashBalancesService, Injectable, toDecimalString()

### Community 143 - "AssignLicenseDto"
Cohesion: 0.22
Nodes (8): AssignLicenseDto, ApiProperty, ApiPropertyOptional, IsDateString, IsEnum, IsInt, IsOptional, IsString

### Community 150 - "UploadController"
Cohesion: 0.50
Nodes (3): ApiProperty, IsEnum, UpdateStatusDto

### Community 154 - "admin.module.ts"
Cohesion: 0.15
Nodes (9): AuthModule, Module, Injectable, VerificationTokenResult, VerificationTokenService, EmailModule, Module, NotificationsModule (+1 more)

### Community 155 - "OpenCurrencyPositionDto"
Cohesion: 0.17
Nodes (12): FxOperationsController, ApiBearerAuth, ApiHeader, ApiResponse, ApiTags, Body, Controller, CurrentUser (+4 more)

### Community 156 - "environment.ts"
Cohesion: 0.52
Nodes (5): assertHttpUrl(), DEVELOPMENT_ORIGINS, Environment, parseCorsOrigins(), validateEnvironment()

## Knowledge Gaps
- **204 isolated node(s):** `paths`, `webhooks`, `components`, `$defs`, `operations` (+199 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PushNotificationsService` connect `ApiProperty` to `ReportsService`, `admin.module.ts`, `transactions.controller.ts`, `upload.controller.ts`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `Expo` connect `Expo` to `ApiProperty`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `Expo`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `paths`, `webhooks`, `components` to the rest of the system?**
  _204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ExpenseItemsService` be split into smaller, more focused modules?**
  _Cohesion score 0.09230769230769231 - nodes in this community are weakly interconnected._
- **Should `CashService` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `CreateExpenseDto` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._