/**
 * Compile-time smoke test for the generated contract types.
 *
 * Verifies that the generated schema.d.ts is not only syntactically valid
 * but actually usable: component schemas and operations are reachable with
 * the shapes SDK consumers depend on.
 *
 * Response typing (task 1.12) progresses controller by controller; each
 * block below is tightened as its controller lands typed responses.
 *
 * Fase 2 del plan de clientes nativos: task 2.15.
 */
import type { components, operations } from './schema';

type Schemas = components['schemas'];

// Core request schemas must exist and be object-shaped.
type AssertSchemas = [
  Schemas['LoginDto'] extends object ? true : false,
  Schemas['RegisterDto'] extends object ? true : false,
  Schemas['CreateTransactionDto'] extends object ? true : false,
  Schemas['CreatePlanDto'] extends object ? true : false,
];

// Auth (task 1.12: 15/15 typed): the login operation is reachable through
// its stable operationId, with typed request body AND typed responses.
type LoginOp = operations['auth_login'];
type LoginBody = NonNullable<LoginOp['requestBody']>['content']['application/json'];
type LoginResponse = NonNullable<LoginOp['responses'][201]>['content']['application/json'];
type LoginUser = LoginResponse['user'];

// The current-user endpoint must return the typed user shape.
type MeResponse = NonNullable<operations['auth_getCurrentUser']['responses'][200]>['content']['application/json'];

// Compile-time guards: these aliases must resolve, or the file fails to typecheck.
const _schemaGuard: AssertSchemas = [true, true, true, true];
export type { Schemas, LoginBody, LoginResponse, LoginUser, MeResponse };
void _schemaGuard;
