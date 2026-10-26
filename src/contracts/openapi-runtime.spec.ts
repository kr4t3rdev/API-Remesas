import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import Ajv from 'ajv';
import * as request from 'supertest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { HealthController } from '../health/health.controller';
import { PrismaService } from '../database/prisma/prisma.service';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';

type OpenApiDocument = {
  paths: Record<string, Record<string, {
    responses: Record<string, { content?: Record<string, { schema?: unknown }> }>;
  }>>;
  components: { schemas: Record<string, unknown> };
};

const contract = JSON.parse(
  readFileSync(join(__dirname, '../../openapi.json'), 'utf8'),
) as OpenApiDocument;
const ajv = new Ajv({ strict: false, allErrors: true });

function resolveLocalRefs(schema: any): any {
  if (Array.isArray(schema)) return schema.map(resolveLocalRefs);
  if (!schema || typeof schema !== 'object') return schema;
  if (typeof schema.$ref === 'string' && schema.$ref.startsWith('#/components/schemas/')) {
    const name = schema.$ref.split('/').at(-1)!;
    const resolved = resolveLocalRefs(contract.components.schemas[name]);
    const siblings = Object.fromEntries(Object.entries(schema).filter(([key]) => key !== '$ref'));
    return { ...resolved, ...siblings };
  }
  return Object.fromEntries(Object.entries(schema).map(([key, value]) => [key, resolveLocalRefs(value)]));
}

function responseValidator(path: string, method: string, status: number) {
  const schema = contract.paths[path]?.[method]?.responses?.[String(status)]
    ?.content?.['application/json']?.schema;
  if (!schema) throw new Error(`Missing OpenAPI response schema: ${method.toUpperCase()} ${path} ${status}`);
  return ajv.compile(resolveLocalRefs(schema));
}

describe('OpenAPI runtime contract conformance (isolated controllers)', () => {
  let app: INestApplication;
  const prismaStub = { $queryRaw: jest.fn().mockResolvedValue(1) };
  const authServiceStub = { checkEmailExists: jest.fn().mockResolvedValue({ exists: false }) };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://ci:ci@localhost:5432/ci';
    process.env.JWT_SECRET = 'ci-only-runtime-contract-secret';

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController, AuthController],
      providers: [
        { provide: PrismaService, useValue: prismaStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/health returns a body conforming to the published 200 schema', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);
    const validate = responseValidator('/api/health', 'get', 200);

    expect(validate(response.body)).toBe(true);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('rejects an intentionally invalid response body (contract gate negative case)', () => {
    const validate = responseValidator('/api/health', 'get', 200);

    // Proves the runtime validator itself fails closed instead of only
    // checking happy-path examples (task 2.16).
    expect(validate({ status: 500 })).toBe(false);
  });

  it('GET /api/auth/check-email returns a body conforming to the published 200 schema', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/check-email')
      .query({ email: 'runtime-contract@example.test' })
      .expect(200);
    const validate = responseValidator('/api/auth/check-email', 'get', 200);

    expect(validate(response.body)).toBe(true);
    expect(response.body).toEqual({ exists: false });
    expect(authServiceStub.checkEmailExists).toHaveBeenCalledWith('runtime-contract@example.test');
  });

  // El cuerpo real de un servicio debe cumplir el esquema publicado: la
  // pierna CUP de las transferencias (`currency.id = null`) se serializaba
  // sin name/symbol/isActive y el SDK generado no podía decodificarla.
  it('the bank account transactions payload conforms to the published 200 schema', async () => {
    const prisma = {
      bankAccount: { findFirst: jest.fn().mockResolvedValue({ id: 4, userId: 7, currency: { id: 1, code: 'CUP' } }) },
      expense: { findMany: jest.fn().mockResolvedValue([]) },
      transaction: { findMany: jest.fn().mockResolvedValue([{
        id: 11, type: 'VENTA', operationKind: 'TRANSFER',
        amount: { toString: () => '10' }, totalCup: { toString: () => '2400' }, rate: { toString: () => '240' },
        currency: { id: 2, code: 'USD' }, sourceType: 'CASH', sourceBankAccountId: null,
        destinationType: 'BANK_ACCOUNT', destinationBankAccountId: 4, createdAt: new Date('2026-10-20T10:00:00.000Z'),
      }]) },
      currency: { findFirst: jest.fn().mockResolvedValue({ id: 1, code: 'CUP', name: 'Peso Cubano', symbol: '$', isActive: true }) },
    };

    const service = new BankAccountsService(prisma as unknown as PrismaService);
    const payload = await service.getTransactions(7, 4);
    // El cliente recibe el cuerpo serializado por NestJS: se replica ese
    // round-trip para validar exactamente lo que viaja por la red.
    const wire = JSON.parse(JSON.stringify(payload));
    const validate = responseValidator('/api/bank-accounts/{id}/transactions', 'get', 200);

    expect(validate(wire)).toBe(true);
  });
});
