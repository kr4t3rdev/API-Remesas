import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  const dto = { type: 'COMPRA', currencyId: 2, amount: 10, rate: 260 } as any;

  it.each([undefined, '', '   '])('rejects a blank Idempotency-Key', (key) => {
    const service = { create: jest.fn() };
    const controller = new TransactionsController(service as any);

    expect(() => controller.create(7, dto, key)).toThrow('Idempotency-Key header is required for transactions');
    expect(service.create).not.toHaveBeenCalled();
  });

  it('trims and forwards a valid Idempotency-Key', async () => {
    const service = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    const controller = new TransactionsController(service as any);

    await controller.create(7, dto, ' legacy-1 ');

    expect(service.create).toHaveBeenCalledWith(7, dto, 'legacy-1');
  });
});
