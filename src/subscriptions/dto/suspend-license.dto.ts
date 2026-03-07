import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SuspendLicenseDto {
  @ApiPropertyOptional({ example: 'Pago vencido' })
  @IsOptional()
  @IsString()
  reason?: string;
}
