import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports ready after a successful database probe', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]) };
    const controller = new HealthController(prisma as never);

    await expect(controller.check()).resolves.toEqual({ status: 'ok' });
  });

  it('returns a generic unavailable response when the database probe fails', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('secret')) };
    const controller = new HealthController(prisma as never);

    await expect(controller.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
