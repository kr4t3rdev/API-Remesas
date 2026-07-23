import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PlatformSeriesQueryDto } from './platform-series-query.dto';

describe('PlatformSeriesQueryDto', () => {
  it.each(['abc', '0', '25', '1.5'])('rejects invalid monthsBack %s', async (monthsBack) => {
    const errors = await validate(
      plainToInstance(PlatformSeriesQueryDto, { monthsBack }),
    );

    expect(errors).not.toHaveLength(0);
  });

  it.each([
    [{}, undefined],
    [{ monthsBack: '1' }, 1],
    [{ monthsBack: '24' }, 24],
  ])('accepts a valid monthsBack query %#', async (query, expected) => {
    const dto = plainToInstance(PlatformSeriesQueryDto, query);

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.monthsBack).toBe(expected);
  });
});
