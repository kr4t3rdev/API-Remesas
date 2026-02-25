# Sistema Casa de Cambio - Diseño

> **Fecha:** 2026-02-21
> **Contexto:** Casa de cambio en Cuba con operaciones de compra/venta de divisas

---

## Resumen del Negocio

| Aspecto | Detalle |
|---------|---------|
| Tipo | Casa de cambio física |
| Ubicación | Cuba |
| Usuarios | 1 (dueño) |
| Monedas | USD, EUR, MEX, CAD, CUP, MLC |
| Operaciones | Compra y venta de divisas |
| Control de caja | Balance continuo + arqueos físicos |
| Tipos de cambio | Tasa referencia + margen configurable |
| Regulaciones | Sin requisitos específicos |

---

## Stack Tecnológico

| Componente | Tecnología | Justificación |
|------------|-----------|---------------|
| Framework | NestJS 10 | Arquitectura modular, DI, escalable |
| ORM | Prisma | Excelente DX, migraciones, tipado |
| Base de datos | PostgreSQL | ACID, transacciones, robustez |
| Validación | class-validator + DTOs | Built-in NestJS |
| Auth | JWT + Passport | Simple para 1 usuario |
| Docs | Swagger/OpenAPI | Documentación automática |

---

## Modelo de Datos

### Diagrama Entidad-Relación

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Currency   │────<│  ExchangeRate    │     │     User        │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │
       │
       ├────────────────────┬────────────────────┬────────────────────┐
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Transaction │     │ CashBalance │     │ CashAudit   │     │BankAccount  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                                                            │
       │                                                            │
       ▼                                                            ▼
┌─────────────────────┐                                    ┌───────────────────┐
│IncomeReconciliation │                                    │ExpenseReconciliation│
└─────────────────────┘                                    └───────────────────┘
                                                                    │
       ┌────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Expense   │     │ RateHistory │     │  Objective  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Tablas

#### 1. currencies
Monedas disponibles en el sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| code | String | Código ISO (USD, EUR, MEX, CAD, CUP, MLC) |
| name | String | Nombre completo |
| symbol | String | Símbolo ($, €, etc.) |
| isActive | Boolean | Moneda activa/inactiva |

#### 2. exchange_rates
Tasas de cambio con márgenes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| currencyId | Int | FK → currencies |
| referenceRate | Decimal(10,4) | Tasa de referencia |
| buyMargin | Decimal(5,4) | Margen para compra |
| sellMargin | Decimal(5,4) | Margen para venta |
| effectiveDate | DateTime | Fecha efectiva |

**Cálculo de tasas:**
- Tasa compra = referenceRate × (1 - buyMargin)
- Tasa venta = referenceRate × (1 + sellMargin)

#### 3. transactions
Operaciones de compra/venta de divisas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| type | Enum | COMPRA, VENTA |
| currencyId | Int | FK → currencies |
| amount | Decimal(15,2) | Monto en divisa extranjera |
| rate | Decimal(10,4) | Tasa aplicada |
| totalCup | Decimal(15,2) | Monto total en CUP |
| marginProfit | Decimal(15,2) | Ganancia de la operación |
| status | Enum | PENDIENTE, RECONCILIADO |
| notes | String? | Notas adicionales |

#### 4. cash_balances
Saldo actual en caja por moneda.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| currencyId | Int | FK → currencies (unique) |
| balance | Decimal(15,2) | Saldo actual |

#### 5. cash_audits
Arqueos de caja físicos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| currencyId | Int | FK → currencies |
| expectedBalance | Decimal(15,2) | Saldo esperado según sistema |
| actualBalance | Decimal(15,2) | Saldo físico contado |
| difference | Decimal(15,2) | Diferencia |
| notes | String? | Notas |

#### 6. cash_adjustments
Ajustes manuales al saldo de caja.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| currencyId | Int | FK → currencies |
| amount | Decimal(15,2) | Monto del ajuste |
| type | Enum | INGRESO, EGRESO |
| reason | String | Razón del ajuste |

#### 7. bank_accounts
Cuentas bancarias del negocio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| name | String | Nombre de la cuenta |
| bankName | String | Nombre del banco |
| currencyId | Int | FK → currencies |
| accountNumber | String | Número de cuenta |
| balance | Decimal(15,2) | Saldo actual |
| isActive | Boolean | Cuenta activa/inactiva |

#### 8. expenses
Gastos operativos del negocio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| description | String | Descripción del gasto |
| amount | Decimal(15,2) | Monto |
| currencyId | Int | FK → currencies |
| category | String | Categoría (renta, servicios, salario, insumos, otros) |
| date | DateTime | Fecha del gasto |
| status | Enum | PENDIENTE, RECONCILIADO |
| notes | String? | Notas |

#### 9. expense_reconciliations
Reconciliación de gastos con cuentas bancarias.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| expenseId | Int | FK → expenses (unique) |
| bankAccountId | Int | FK → bank_accounts |
| amount | Decimal(15,2) | Monto debitado |
| appliedRate | Decimal(10,4)? | Tasa aplicada si hubo conversión |
| rateType | Enum? | ACTUAL, CUSTOM |
| notes | String? | Notas |

#### 10. income_reconciliations
Reconciliación de ventas con cuentas bancarias.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| transactionId | Int | FK → transactions (unique) |
| bankAccountId | Int | FK → bank_accounts |
| amount | Decimal(15,2) | Monto acreditado |
| appliedRate | Decimal(10,4)? | Tasa aplicada si hubo conversión |
| rateType | Enum? | ACTUAL, CUSTOM |
| notes | String? | Notas |

#### 11. rate_history
Historial de tasas personalizadas usadas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| currencyFromId | Int | FK → currencies |
| currencyToId | Int | FK → currencies |
| rate | Decimal(10,4) | Tasa usada |
| source | Enum | MANUAL, SYSTEM |
| referenceType | String? | expense, income |
| referenceId | Int? | ID de referencia |

#### 12. objectives
Objetivos/metas del negocio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| name | String | Nombre del objetivo |
| description | String? | Descripción |
| targetAmount | Decimal(15,2) | Monto objetivo |
| currentAmount | Decimal(15,2) | Monto acumulado |
| currencyId | Int | FK → currencies |
| bankAccountId | Int? | FK → bank_accounts (opcional) |
| status | Enum | ACTIVO, COMPLETADO, PAUSADO |
| completedAt | DateTime? | Fecha de completado |

#### 13. users
Usuario del sistema (1 usuario).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | PK |
| email | String | Email único |
| password | String | Hash bcrypt |
| name | String | Nombre |

### Enums

```typescript
enum TransactionType {
  COMPRA = 'COMPRA',
  VENTA = 'VENTA'
}

enum ReconciliationStatus {
  PENDIENTE = 'PENDIENTE',
  RECONCILIADO = 'RECONCILIADO'
}

enum AdjustmentType {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO'
}

enum RateType {
  ACTUAL = 'ACTUAL',
  CUSTOM = 'CUSTOM'
}

enum RateSource {
  MANUAL = 'MANUAL',
  SYSTEM = 'SYSTEM'
}

enum ObjectiveStatus {
  ACTIVO = 'ACTIVO',
  COMPLETADO = 'COMPLETADO',
  PAUSADO = 'PAUSADO'
}
```

---

## Flujos de Negocio

### Flujo de Compra de Divisa

```
1. Cliente trae divisa extranjera (ej: USD)
2. Sistema muestra tasa de compra actual
3. Usuario registra transacción:
   - type: COMPRA
   - currencyId: USD
   - amount: 100
   - rate: 180 (tasa compra)
   - totalCup: 18,000 (lo que se paga en CUP)
   - marginProfit: calculado automáticamente
4. CashBalance USD aumenta +100
5. CashBalance CUP disminuye -18,000
6. Status: PENDIENTE (para reconciliar)
```

### Flujo de Venta de Divisa

```
1. Cliente quiere comprar divisa (ej: EUR)
2. Sistema muestra tasa de venta actual
3. Usuario registra transacción:
   - type: VENTA
   - currencyId: EUR
   - amount: 50
   - rate: 210 (tasa venta)
   - totalCup: 10,500 (lo que cobra en CUP)
   - marginProfit: calculado automáticamente
4. CashBalance EUR disminuye -50
5. CashBalance CUP aumenta +10,500
6. Status: PENDIENTE (para reconciliar)
```

### Flujo de Reconciliación de Ingreso (Venta)

```
1. Usuario selecciona venta pendiente
2. Selecciona cuenta bancaria destino
3. Si moneda de cuenta != CUP:
   - Mostrar dialog con:
     * Tasa actual del sistema
     * Opción de ingresar tasa personalizada
   - Guardar tasa usada en rate_history
4. Actualizar balance de cuenta bancaria
5. Marcar transacción como RECONCILIADO
6. Crear income_reconciliation
```

### Flujo de Reconciliación de Gasto

```
1. Usuario registra gasto:
   - description: "Renta local"
   - amount: 5000
   - currencyId: CUP
   - category: "renta"
   - status: PENDIENTE
2. Usuario selecciona gasto pendiente
3. Selecciona cuenta bancaria origen
4. Si moneda de cuenta != moneda de gasto:
   - Mostrar dialog con:
     * Tasa actual del sistema
     * Opción de ingresar tasa personalizada
   - Guardar tasa usada en rate_history
5. Actualizar balance de cuenta bancaria
6. Marcar gasto como RECONCILIADO
7. Crear expense_reconciliation
```

### Flujo de Arqueo de Caja

```
1. Usuario cuenta efectivo físico por moneda
2. Registra arqueo:
   - currencyId: USD
   - expectedBalance: 5000 (según sistema)
   - actualBalance: 4980 (contado)
   - difference: -20
3. Si hay diferencia:
   - Sistema puede sugerir crear ajuste
4. Guardar registro para auditoría
```

---

## API Endpoints

### Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/auth/me` | Usuario actual |
| POST | `/auth/change-password` | Cambiar contraseña |

### Currencies

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/currencies` | Listar monedas |
| PATCH | `/currencies/:id` | Actualizar moneda |

### Exchange Rates

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/exchange-rates` | Tasas actuales |
| GET | `/exchange-rates/history` | Historial |
| PUT | `/exchange-rates/:currencyId` | Actualizar tasa |

### Transactions

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/transactions` | Listar (filtros: fecha, moneda, tipo) |
| GET | `/transactions/pending` | Pendientes de reconciliar |
| POST | `/transactions` | Crear compra/venta |
| GET | `/transactions/:id` | Detalle |

### Cash Balances

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/cash-balances` | Saldos actuales por moneda |
| GET | `/cash-balances/:currencyId` | Saldo de moneda específica |

### Cash Audits

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/cash-audits` | Historial de arqueos |
| POST | `/cash-audits` | Registrar arqueo |
| GET | `/cash-audits/:id` | Detalle |

### Cash Adjustments

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/cash-adjustments` | Historial de ajustes |
| POST | `/cash-adjustments` | Crear ajuste |

### Bank Accounts

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/bank-accounts` | Listar cuentas |
| POST | `/bank-accounts` | Crear cuenta |
| PATCH | `/bank-accounts/:id` | Actualizar cuenta |
| DELETE | `/bank-accounts/:id` | Desactivar |
| GET | `/bank-accounts/:id/balance` | Saldo de cuenta |
| GET | `/bank-accounts/:id/transactions` | Movimientos |

### Expenses

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/expenses` | Listar gastos (filtros) |
| POST | `/expenses` | Crear gasto |
| GET | `/expenses/pending` | Pendientes de reconciliar |
| GET | `/expenses/:id` | Detalle |
| PATCH | `/expenses/:id` | Actualizar gasto |
| DELETE | `/expenses/:id` | Eliminar |

### Reconciliations

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reconciliations` | Historial (filtros) |
| GET | `/reconciliations/expenses` | Reconciliaciones de gastos |
| GET | `/reconciliations/incomes` | Reconciliaciones de ingresos |
| POST | `/reconciliations/expense` | Reconciliar gasto |
| POST | `/reconciliations/income` | Reconciliar ingreso (venta) |
| GET | `/reconciliations/:id` | Detalle |

### Objectives

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/objectives` | Listar objetivos |
| POST | `/objectives` | Crear objetivo |
| PATCH | `/objectives/:id` | Actualizar objetivo |
| PATCH | `/objectives/:id/status` | Cambiar estado |
| DELETE | `/objectives/:id` | Eliminar |
| GET | `/objectives/:id/progress` | Progreso actual |

### Reports

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/reports/daily` | Resumen del día |
| GET | `/reports/period` | Por rango de fechas |
| GET | `/reports/profit` | Ganancias por período |
| GET | `/reports/currency/:id` | Detalle por moneda |
| GET | `/reports/expenses` | Gastos por categoría/período |
| GET | `/reports/accounts` | Estado de cuentas bancarias |
| GET | `/reports/objectives` | Avance de objetivos |
| GET | `/reports/cash-flow` | Flujo de efectivo |
| GET | `/reports/audit-summary` | Resumen de arqueos |

### Rate History

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/rate-history` | Historial de tasas usadas |
| GET | `/rate-history/by-currency` | Por par de monedas |

---

## Dependencias

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "decimal.js": "^10.4.3",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^3.0.8",
    "@types/bcrypt": "^5.0.0",
    "jest": "^29.5.0",
    "prisma": "^5.0.0",
    "source-map-support": "^0.5.21",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.0",
    "ts-node": "^10.9.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.0.0"
  }
}
```
