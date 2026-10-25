import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RemittanceEventDto } from './remittance-event.dto';

describe('RemittanceEventDto decimal limits', () => {
  // Decisión 1.14: los importes y tasas viajan como decimal-string.
  const valid = {
    provider: 'provider',
    sourceId: 'source',
    status: 'COMPLETED',
    foreignCurrencyId: 2,
    foreignAmount: '10.123456',
    localCurrencyId: 1,
    localAmount: '2700.12',
    rate: '270.1234',
  };

  it('accepts decimal strings compatible with Prisma decimal columns', async () => {
    await expect(validate(plainToInstance(RemittanceEventDto, valid))).resolves.toHaveLength(0);
  });

  it('rejects JSON numbers so clients cannot lose precision', async () => {
    const errors = await validate(plainToInstance(RemittanceEventDto, { ...valid, foreignAmount: 10.123456 }));
    expect(errors.map((error) => error.property)).toContain('foreignAmount');
  });

  it.each([
    ['foreignAmount', '10.1234567'],
    ['localAmount', '2700.1234567'],
    ['rate', '270.1234567'],
    ['localAmount', '1000000000000000'],
  ])('rejects an incompatible %s', async (field, value) => {
    const errors = await validate(plainToInstance(RemittanceEventDto, { ...valid, [field]: value }));
    expect(errors.map((error) => error.property)).toContain(field);
  });
});
