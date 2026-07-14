import { FxOperationsController } from './fx-operations.controller';

describe('FxOperationsController', () => {
  it('forwards Idempotency-Key to the transfer service', async () => {
    const service = { createTransfer: jest.fn().mockResolvedValue({ id: 1 }) };
    const controller = new FxOperationsController(service as any);
    const dto = { type: 'COMPRA' as any, currencyId: 2, amount: 10, rate: 260 };

    await controller.createTransfer(7, dto, 'fx-123');

    expect(service.createTransfer).toHaveBeenCalledWith(7, dto, 'fx-123');
  });
});
