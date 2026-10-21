import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

/**
 * Single source for the OpenAPI document configuration.
 *
 * Used by:
 * - `src/main.ts` to serve Swagger UI at /api/docs.
 * - `scripts/export-openapi.ts` to export the versioned contract
 *   (`openapi.json` at the repo root) without a database.
 *
 * The operationIdFactory produces stable, human-readable operationIds
 * (e.g. `AuthController.login` -> `auth_login`) so generated SDKs
 * (Swift / Kotlin / TypeScript) do not churn when methods are reordered.
 * Renaming a controller or handler IS a contract change on purpose:
 * it will show up in the contract diff in CI.
 */
export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Casa de Cambio API')
    .setDescription('Sistema de gestión para casa de cambio')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
}

export const OPENAPI_OPTIONS: SwaggerDocumentOptions = {
  operationIdFactory: (controllerKey: string, methodKey: string) => {
    const resource = controllerKey
      .replace(/Controller$/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase();
    return `${resource}_${methodKey}`;
  },
};
