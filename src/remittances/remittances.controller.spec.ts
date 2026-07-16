import { RemittancesController } from './remittances.controller';
import { UnauthorizedException } from '@nestjs/common';

describe('RemittancesController', () => {
  it('uses the tenant resolved from the provider credential, not the body', async () => {
    const service = {
      resolveProviderTenant: jest.fn().mockReturnValue(8),
      ingest: jest.fn().mockResolvedValue({ id: 1 }),
    } as any;
    const controller = new RemittancesController(service);

    await controller.ingest('tenant-token', { userId: 999, provider: 'stripe' } as any);

    expect(service.resolveProviderTenant).toHaveBeenCalledWith('tenant-token');
    expect(service.ingest).toHaveBeenCalledWith(8, expect.objectContaining({ userId: 999 }));
  });

  it('rejects an unmapped provider token before ingestion', () => {
    const service = {
      resolveProviderTenant: jest.fn(() => { throw new UnauthorizedException(); }),
      ingest: jest.fn(),
    } as any;
    const controller = new RemittancesController(service);

    expect(() => controller.ingest('unknown', { userId: 999 } as any)).toThrow(UnauthorizedException);
    expect(service.ingest).not.toHaveBeenCalled();
  });
});
