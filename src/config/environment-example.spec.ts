import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('.env.example security and development defaults', () => {
  const example = readFileSync(resolve(__dirname, '../../.env.example'), 'utf8');

  it('contains only unmistakable SMTP placeholders', () => {
    expect(example).toContain('SMTP_USER=your-smtp-user@example.com');
    expect(example).toContain('SMTP_PASSWORD=your-smtp-app-password');
    expect(example).toContain('SMTP_FROM=your-smtp-user@example.com');
  });

  it('does not activate a production-only CORS allowlist in development', () => {
    expect(example).toContain('# CORS_ORIGINS=https://app.example.com');
    expect(example).not.toMatch(/^CORS_ORIGINS=/m);
  });
});
