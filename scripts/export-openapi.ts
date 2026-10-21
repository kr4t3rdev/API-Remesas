/**
 * Exports the OpenAPI contract to `openapi.json` at the repo root.
 *
 * Design constraints (Fase 1 del plan de clientes nativos):
 * - NO database: PrismaService is replaced with an inert stub, so the
 *   export never connects to PostgreSQL (ni producción ni ninguna otra).
 * - NO production environment: dummy CI-only env values are set before
 *   the app module is loaded, purely to satisfy config validation.
 * - Deterministic: same code -> byte-identical file (checked in CI by
 *   regenerating and running `git diff --exit-code openapi.json`).
 *
 * Run with: npm run openapi:export
 */
import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Dummy env BEFORE loading AppModule (ConfigModule validates on init).
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://ci:ci@localhost:5432/ci';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'ci-only-export-secret';

import { Test } from '@nestjs/testing';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { buildSwaggerConfig, OPENAPI_OPTIONS } from '../src/swagger';

/** Recursive inert stub: any property/call resolves without touching a DB. */
function inertStub(): unknown {
  const fn = function () {
    return undefined;
  };
  return new Proxy(fn, {
    get: (_target, prop) => {
      if (prop === 'then') return undefined; // not a thenable
      if (prop === '$connect' || prop === '$disconnect') {
        return async () => undefined;
      }
      return inertStub();
    },
    apply: () => inertStub(),
  });
}

async function main() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(inertStub())
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  await app.init();

  const document = SwaggerModule.createDocument(
    app,
    buildSwaggerConfig(),
    OPENAPI_OPTIONS,
  );

  const out = join(__dirname, '..', 'openapi.json');
  writeFileSync(out, JSON.stringify(document, null, 2) + '\n', 'utf8');
  const paths = Object.keys(document.paths ?? {}).length;
  console.log(`OpenAPI contract written to ${out} (${paths} paths)`);

  await app.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('openapi export failed:', err);
  process.exit(1);
});
