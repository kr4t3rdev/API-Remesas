import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RemittanceStatus } from '@prisma/client';
export class RemittanceEventDto {
  @ApiPropertyOptional({ deprecated: true, description: 'Ignored. Tenant identity is resolved from provider credentials.' }) @IsOptional() @IsInt() userId?: number;
  @ApiProperty() @IsString() provider!: string;
  @ApiProperty() @IsString() sourceId!: string;
  @ApiProperty({ enum: RemittanceStatus }) @IsEnum(RemittanceStatus) status!: RemittanceStatus;
  @ApiProperty() @IsInt() foreignCurrencyId!: number;
  @ApiProperty() @IsNumber() @Min(0.000001) foreignAmount!: number;
  @ApiProperty() @IsInt() localCurrencyId!: number;
  @ApiProperty() @IsNumber() @Min(0.000001) localAmount!: number;
  @ApiProperty() @IsNumber() @Min(0.000001) rate!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() idempotencyKey?: string;
}
