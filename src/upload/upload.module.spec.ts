import { MODULE_METADATA } from '@nestjs/common/constants';
import { PrismaService } from '../database/prisma/prisma.service';
import { UploadModule } from './upload.module';

describe('UploadModule', () => {
  it('uses the global database provider instead of creating another Prisma client', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, UploadModule);
    expect(providers).not.toContain(PrismaService);
  });
});
