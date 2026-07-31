import { Prisma } from '@prisma/client';
import { serializableTransaction } from './serializable-transaction';

describe('serializableTransaction', () => {
  it('uses Serializable isolation', async () => {
    const prisma = {
      $transaction: jest.fn().mockResolvedValue('ok'),
    };

    await expect(serializableTransaction(prisma, async () => 'ok')).resolves.toBe('ok');
    expect(prisma.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  });

  it('retries P2034 conflicts and succeeds', async () => {
    const conflict = new Prisma.PrismaClientKnownRequestError('conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });
    const prisma = {
      $transaction: jest.fn()
        .mockRejectedValueOnce(conflict)
        .mockResolvedValueOnce('ok'),
    };

    await expect(serializableTransaction(prisma, async () => 'ok')).resolves.toBe('ok');
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });
});
