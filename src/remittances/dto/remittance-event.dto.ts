import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { RemittanceStatus } from '@prisma/client';
import { IsDecimalString } from '../../common/decorators/is-decimal-string.decorator';

export class RemittanceEventDto {
  @ApiPropertyOptional({ deprecated: true, description: 'Ignored. Tenant identity is resolved from provider credentials.' }) @IsOptional() @IsInt() userId?: number;
  @ApiProperty() @IsString() provider!: string;
  @ApiProperty() @IsString() sourceId!: string;
  @ApiProperty({ enum: RemittanceStatus }) @IsEnum(RemittanceStatus) status!: RemittanceStatus;
  @ApiProperty() @IsInt() foreignCurrencyId!: number;
  @ApiProperty({ type: String, example: '100.00', description: 'Importe en moneda extranjera (decimal string)' })
  @IsDecimalString({ min: '0.000001', max: '999999999.999999', maxDecimalPlaces: 6 })
  foreignAmount!: string;
  @ApiProperty() @IsInt() localCurrencyId!: number;
  @ApiProperty({ type: String, example: '24000.00', description: 'Importe en moneda local (decimal string)' })
  @IsDecimalString({ min: '0.01', max: '999999999.99', maxDecimalPlaces: 2 })
  localAmount!: string;
  @ApiProperty({ type: String, example: '240.5', description: 'Tasa aplicada (decimal string)' })
  @IsDecimalString({ min: '0.000001', max: '999999999.999999', maxDecimalPlaces: 6 })
  rate!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() idempotencyKey?: string;
}
