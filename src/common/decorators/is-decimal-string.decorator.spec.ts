import { validate } from 'class-validator';
import { IsDecimalString } from './is-decimal-string.decorator';

class AmountDto {
  @IsDecimalString()
  amount!: string;
}

class BoundedDto {
  @IsDecimalString({ min: '0', max: '1' })
  margin!: string;
}

describe('IsDecimalString', () => {
  const errorsFor = async (dto: object): Promise<string[]> => {
    const errors = await validate(dto as object);
    return errors.flatMap((error) => Object.values(error.constraints ?? {}));
  };

  it('acepta decimal strings válidos', async () => {
    for (const value of ['0', '265.09', '0.05', '120', '999999999.999999']) {
      const dto = new AmountDto();
      dto.amount = value;
      expect(await errorsFor(dto)).toEqual([]);
    }
  });

  it('rechaza números JSON', async () => {
    const dto = new AmountDto();
    (dto as unknown as { amount: unknown }).amount = 265.09;
    expect(await errorsFor(dto)).toHaveLength(1);
  });

  it('rechaza formatos no decimales', async () => {
    for (const value of ['', 'abc', '-1', '1,5', '1e3', '1.2.3', ' ']) {
      const dto = new AmountDto();
      dto.amount = value;
      expect(await errorsFor(dto)).toHaveLength(1);
    }
  });

  it('aplica el rango con Decimal', async () => {
    const valid = new BoundedDto();
    valid.margin = '0.05';
    expect(await errorsFor(valid)).toEqual([]);

    const tooHigh = new BoundedDto();
    tooHigh.margin = '1.5';
    expect(await errorsFor(tooHigh)).toHaveLength(1);

    const negative = new BoundedDto();
    negative.margin = '-0.1';
    expect(await errorsFor(negative)).toHaveLength(1);
  });

  it('expone un mensaje en español', async () => {
    const dto = new AmountDto();
    dto.amount = 'abc';
    const [message] = await errorsFor(dto);
    expect(message).toContain('decimal string');
  });

  it('respeta el máximo de decimales', async () => {
    class PreciseDto {
      @IsDecimalString({ maxDecimalPlaces: 2 })
      amount!: string;
    }

    const valid = new PreciseDto();
    valid.amount = '100.25';
    expect(await errorsFor(valid)).toEqual([]);

    const invalid = new PreciseDto();
    invalid.amount = '100.255';
    expect(await errorsFor(invalid)).toHaveLength(1);
  });

  it('respeta el mensaje custom del DTO', async () => {
    class CustomMessageDto {
      @IsDecimalString({ min: '0.01', message: 'El monto debe ser mayor a cero' })
      amount!: string;
    }

    const dto = new CustomMessageDto();
    dto.amount = '0';
    const [message] = await errorsFor(dto);
    expect(message).toBe('El monto debe ser mayor a cero');
  });
});
