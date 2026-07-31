import { Prisma } from '@prisma/client';

type TransactionRunner = {
  $transaction: (
    callback: (tx: Prisma.TransactionClient) => Promise<unknown>,
    options: { isolationLevel: Prisma.TransactionIsolationLevel },
  ) => Promise<unknown>;
};

export async function serializableTransaction<T>(
  prisma: TransactionRunner,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }) as T;
    } catch (error) {
      const isConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034';
      if (!isConflict || attempt === maxAttempts) throw error;
    }
  }
  throw new Error('Serializable transaction failed');
}
