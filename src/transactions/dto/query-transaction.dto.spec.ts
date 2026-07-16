import { FxOperationKind } from '@prisma/client';
import { validate } from 'class-validator';
import { QueryTransactionDto } from './query-transaction.dto';

describe('QueryTransactionDto', () => {
  it.each([FxOperationKind.TRANSFER, FxOperationKind.REMITTANCE])(
    'accepts operationKind %s',
    async (operationKind) => {
      const dto = Object.assign(new QueryTransactionDto(), { operationKind });

      await expect(validate(dto)).resolves.toEqual([]);
    },
  );

  it('rejects unknown operation kinds', async () => {
    const dto = Object.assign(new QueryTransactionDto(), {
      operationKind: 'UNKNOWN',
    });

    const errors = await validate(dto);

    expect(errors).toEqual([
      expect.objectContaining({ property: 'operationKind' }),
    ]);
  });
});
