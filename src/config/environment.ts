type Environment = Record<string, unknown>;

const DEVELOPMENT_ORIGINS = [
  'http://localhost:19006',
  'http://localhost:8081',
  'http://localhost:3000',
];

function assertHttpUrl(value: string, variable: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variable} must contain valid HTTP(S) URLs`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${variable} must contain valid HTTP(S) URLs`);
  }
  return url.origin;
}

export function parseCorsOrigins(
  value: string | undefined,
  nodeEnv = 'development',
  appUrl?: string,
): string[] {
  if (!value?.trim()) {
    if (nodeEnv !== 'production') return DEVELOPMENT_ORIGINS;
    if (appUrl?.trim()) return [assertHttpUrl(appUrl.trim(), 'APP_URL')];
    throw new Error('CORS_ORIGINS is required in production');
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => assertHttpUrl(origin, 'CORS_ORIGINS'));
}

export function validateEnvironment(config: Environment): Environment {
  const jwtSecret = config.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || !jwtSecret.trim()) {
    throw new Error('JWT_SECRET is required');
  }

  const nodeEnv = String(config.NODE_ENV ?? 'development');
  const appUrl =
    typeof config.APP_URL === 'string' ? config.APP_URL : undefined;
  if (appUrl?.trim()) assertHttpUrl(appUrl.trim(), 'APP_URL');

  parseCorsOrigins(
    typeof config.CORS_ORIGINS === 'string' ? config.CORS_ORIGINS : undefined,
    nodeEnv,
    appUrl,
  );
  return config;
}
