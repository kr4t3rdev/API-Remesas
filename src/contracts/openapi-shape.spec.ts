import { readFileSync } from 'fs';
import { join } from 'path';

type SchemaDefinition = {
  type?: string;
  format?: string;
  nullable?: boolean;
  properties?: Record<string, unknown>;
  additionalProperties?: unknown;
  allOf?: unknown;
  $ref?: string;
  items?: { type?: string; properties?: unknown; $ref?: string; additionalProperties?: unknown };
};

type OpenApiDocument = {
  paths: Record<string, Record<string, {
    parameters?: Array<{ name: string; in: string; required?: boolean }>;
  }>>;
  components: { schemas: Record<string, SchemaDefinition> };
};

const contract = JSON.parse(
  readFileSync(join(__dirname, '../../openapi.json'), 'utf8'),
) as OpenApiDocument;

/**
 * Parámetros de query que el backend exige de verdad. Todo lo demás debe
 * publicarse como opcional: `@Query('x')` sin `required: false` hace que
 * Swagger los marque como obligatorios y el SDK generado los exige, aunque
 * el servicio los trate como opcionales.
 */
const REQUIRED_QUERY_ALLOWLIST = new Set([
  'GET /api/auth/check-email:email',
  'GET /api/auth/check-nickname:nickname',
  'GET /api/expense-items/reports/{period}:date',
  'GET /api/reports/period:startDate',
  'GET /api/reports/period:endDate',
  'GET /api/reports/profit:startDate',
  'GET /api/reports/profit:endDate',
  'GET /api/reports/fx-performance:startDate',
  'GET /api/reports/fx-performance:endDate',
  'GET /api/reports/cash-flow:startDate',
  'GET /api/reports/cash-flow:endDate',
]);

/**
 * Arrays que de verdad son de strings. Un `Array<{...}>` sin `type` explícito
 * no lo puede inferir el reflector de Swagger y degrada a
 * `items: {type: string}`, dejando el resto de la respuesta sin decodificar.
 */
const STRING_ARRAY_ALLOWLIST = new Set([
  'CashValuationDto.missingRates',
]);

/**
 * Payloads de interior desconocido que sí son libres a propósito: se
 * publican como `additionalProperties: true` y el cliente los lee de forma
 * defensiva. Cualquier mapa o array libre nuevo tiene que entrar aquí a
 * propósito, no colarse por descuido.
 */
const FREE_FORM_ALLOWLIST = new Set([
  'AdminAuditLogDto.metadata',
  'AdminAuditLogDto.newValue',
  'AdminAuditLogDto.previousValue',
  'AdminExpiringLicenseDto.plan',
  'AdminExpiringLicenseDto.user',
  'AuditSummaryReportDtoSwagger.audits[]',
  'BankAccountTransactionsDto.expenses[]',
  'CurrencyReportDto.transactions[]',
  'ExpenseDto.sourceBankAccount',
  'ExpensesReportDto.expenses[]',
  'FxOpenPositionResultDto.cashBalance',
  'FxOpenPositionResultDto.movement',
  'FxOpenPositionResultDto.position',
  'FxTransferResultDto.movement',
  'FxTransferResultDto.position',
  'NotificationDto.payload',
  'ObjectiveDto.bankAccount',
  'ObjectiveProgressDto.bankAccount',
  'RemittanceDto.movements[]',
  'RemittanceReconcileDto.primaryCashLedger',
  'SubscriptionLicenseDto.plan',
]);

describe('OpenAPI shape contract (the shape the generated SDK has to decode)', () => {
  it('never publishes a property as an opaque object', () => {
    const offenders: string[] = [];

    for (const [schemaName, schema] of Object.entries(contract.components.schemas)) {
      for (const [propertyName, definition] of Object.entries(schema.properties ?? {})) {
        const property = definition as SchemaDefinition;
        if (property.type !== 'object') continue;
        // A real object reference, a typed map or a typed inline shape all
        // describe their shape. A bare `type: object` describes nothing, so
        // every generated client falls back to an untyped payload.
        if (property.allOf || property.$ref) continue;
        if (property.additionalProperties || property.properties) continue;
        offenders.push(`${schemaName}.${propertyName}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it('only marks genuinely mandatory query parameters as required', () => {
    const published = new Set<string>();

    for (const [path, operations] of Object.entries(contract.paths)) {
      for (const [method, operation] of Object.entries(operations)) {
        for (const parameter of operation.parameters ?? []) {
          if (parameter.in !== 'query' || !parameter.required) continue;
          published.add(`${method.toUpperCase()} ${path}:${parameter.name}`);
        }
      }
    }

    expect([...published].sort()).toEqual([...REQUIRED_QUERY_ALLOWLIST].sort());
  });

  it('only downgrades to a string array the payloads that really are string arrays', () => {
    const published = new Set<string>();

    for (const [schemaName, schema] of Object.entries(contract.components.schemas)) {
      for (const [propertyName, definition] of Object.entries(schema.properties ?? {})) {
        const property = definition as SchemaDefinition;
        if (property.type !== 'array' || !property.items) continue;
        if (property.items.type !== 'string') continue;
        if (property.items.properties || property.items.$ref) continue;
        published.add(`${schemaName}.${propertyName}`);
      }
    }

    expect([...published].sort()).toEqual([...STRING_ARRAY_ALLOWLIST].sort());
  });

  it('only leaves free-form payloads free on purpose', () => {
    const published = new Set<string>();

    for (const [schemaName, schema] of Object.entries(contract.components.schemas)) {
      for (const [propertyName, definition] of Object.entries(schema.properties ?? {})) {
        const property = definition as SchemaDefinition;
        if (property.type === 'object' && property.additionalProperties === true) {
          published.add(`${schemaName}.${propertyName}`);
        }
        if (property.type === 'array' && property.items?.additionalProperties === true) {
          published.add(`${schemaName}.${propertyName}[]`);
        }
      }
    }

    expect([...published].sort()).toEqual([...FREE_FORM_ALLOWLIST].sort());
  });
});
