import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTransactionDto } from './create-transaction.dto';

describe('CreateTransactionDto decimal limits', () => {
  const valid = { type: 'COMPRA', currencyId: 2, amount: 10.12, rate: 270.1234 };

  it('accepts the legacy contract within Prisma decimal limits', async () => {
    await expect(validate(plainToInstance(CreateTransactionDto, valid))).resolves.toHaveLength(0);
  });

  it.each([
    ['amount', 10.123],
    ['rate', 270.12345],
    ['amount', 10000000000000],
    ['rate', 1000000],
  ])('rejects an incompatible %s', async (field, value) => {
    const errors = await validate(plainToInstance(CreateTransactionDto, { ...valid, [field]: value }));
    expect(errors.map((error) => error.property)).toContain(field);
  });
});
