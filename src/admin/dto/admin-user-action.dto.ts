import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsInt, IsISO8601, IsNotEmpty, IsObject, IsOptional, IsString, Min, MinLength, Matches, MaxLength } from 'class-validator';

export enum AdminUserControlActionType {
  TEMP_BLOCK = 'TEMP_BLOCK',
  UNBLOCK = 'UNBLOCK',
  SUSPEND_ACCOUNT = 'SUSPEND_ACCOUNT',
  REACTIVATE_ACCOUNT = 'REACTIVATE_ACCOUNT',
  FORCE_PASSWORD_RESET = 'FORCE_PASSWORD_RESET',
  RESET_PASSWORD = 'RESET_PASSWORD',
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

  @ApiPropertyOptional({ example: 'Password123' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  @Matches(/^\S.*\S$|^\S$/, {
    message: 'La contraseña no puede tener espacios al inicio o al final',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  newPassword?: string;

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
