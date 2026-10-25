import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateExpenseDto } from './create-expense.dto';

describe('CreateExpenseDto notes', () => {
  const base = {
    description: 'Internet',
    amount: '50',
    currencyId: 1,
    sourceType: 'CASH',
    category: 'servicios',
    date: '2026-03-06',
  };

  it('trims notes', async () => {
    const dto = plainToInstance(CreateExpenseDto, { ...base, notes: '  pago mensual  ' });
    expect(dto.notes).toBe('pago mensual');
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects notes longer than 1000 characters', async () => {
    const dto = plainToInstance(CreateExpenseDto, { ...base, notes: 'x'.repeat(1001) });
    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'notes')).toBe(true);
  });
});
