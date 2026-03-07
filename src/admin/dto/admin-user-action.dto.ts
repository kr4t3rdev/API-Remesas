import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsInt, IsISO8601, IsNotEmpty, IsObject, IsOptional, IsString, Min } from 'class-validator';

export enum AdminUserControlActionType {
  TEMP_BLOCK = 'TEMP_BLOCK',
  UNBLOCK = 'UNBLOCK',
  SUSPEND_ACCOUNT = 'SUSPEND_ACCOUNT',
  REACTIVATE_ACCOUNT = 'REACTIVATE_ACCOUNT',
  FORCE_PASSWORD_RESET = 'FORCE_PASSWORD_RESET',
  REVOKE_ALL_SESSIONS = 'REVOKE_ALL_SESSIONS',
  CHANGE_ROLE = 'CHANGE_ROLE',
  SUSPEND_LICENSE = 'SUSPEND_LICENSE',
  EXTEND_LICENSE = 'EXTEND_LICENSE',
}

export class AdminUserActionPayloadDto {
  @ApiPropertyOptional({ enum: Role, example: Role.USER })
  @IsOptional()
  @IsEnum(Role)
  newRole?: Role;

  @ApiPropertyOptional({ example: '2026-03-10T12:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  blockUntil?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  extendDays?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  licenseId?: number;
}

export class AdminUserActionDto {
  @ApiProperty({ enum: AdminUserControlActionType })
  @IsEnum(AdminUserControlActionType)
  actionType!: AdminUserControlActionType;

  @ApiProperty({ example: 'Actividad sospechosa detectada' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ type: AdminUserActionPayloadDto })
  @IsOptional()
  @IsObject()
  payload?: AdminUserActionPayloadDto;
}

