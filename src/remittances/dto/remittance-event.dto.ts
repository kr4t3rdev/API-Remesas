import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { RemittanceStatus } from '@prisma/client';
export class RemittanceEventDto {
  @ApiPropertyOptional({ deprecated: true, description: 'Ignored. Tenant identity is resolved from provider credentials.' }) @IsOptional() @IsInt() userId?: number;
  @ApiProperty() @IsString() provider!: string;
  @ApiProperty() @IsString() sourceId!: string;
  @ApiProperty({ enum: RemittanceStatus }) @IsEnum(RemittanceStatus) status!: RemittanceStatus;
  @ApiProperty() @IsInt() foreignCurrencyId!: number;
  @ApiProperty() @IsNumber({ maxDecimalPlaces: 6 }) @Min(0.000001) @Max(999999999.999999) foreignAmount!: number;
  @ApiProperty() @IsInt() localCurrencyId!: number;
  @ApiProperty() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(999999999.99) localAmount!: number;
  @ApiProperty() @IsNumber({ maxDecimalPlaces: 6 }) @Min(0.000001) @Max(999999999.999999) rate!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() idempotencyKey?: string;
}
