import { parseCorsOrigins, validateEnvironment } from './environment';

describe('environment configuration', () => {
  it('requires JWT_SECRET', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production' })).toThrow(
      'JWT_SECRET',
    );
  });

  it('rejects invalid configured origins', () => {
    expect(() =>
      validateEnvironment({ JWT_SECRET: 'secret', CORS_ORIGINS: 'not-a-url' }),
    ).toThrow('CORS_ORIGINS');
  });

  it('allows local development origins by default', () => {
    expect(parseCorsOrigins(undefined, 'development')).toEqual([
      'http://localhost:19006',
      'http://localhost:8081',
      'http://localhost:3000',
    ]);
  });

  it('parses a comma-separated allowlist', () => {
    expect(
      parseCorsOrigins('https://app.example.com, https://admin.example.com'),
    ).toEqual(['https://app.example.com', 'https://admin.example.com']);
  });
});
