import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTOs for the Auth module. These mirror the exact shapes
 * returned by AuthService; they exist so the OpenAPI contract (and the
 * generated native SDKs) can type auth responses. Keep them in sync
 * with auth.service.ts return statements.
 */
export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin@cambios.com' })
  email!: string;

  @ApiProperty({ example: 'Admin' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'] })
  role!: 'ADMIN' | 'USER';

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  failedLoginAttempts!: number;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  blockedUntil!: Date | null;

  @ApiProperty()
  isBanned!: boolean;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  bannedUntil!: Date | null;

  @ApiProperty()
  mustChangePassword!: boolean;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT de acceso' })
  access_token!: string;

  @ApiProperty()
  mustChangePassword!: boolean;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

export class MessageResponseDto {
  @ApiProperty()
  message!: string;
}

export class RegisterResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ example: 'nuevo@cambios.com' })
  email!: string;
}

export class ExistsResponseDto {
  @ApiProperty()
  exists!: boolean;
}

export class CreatedUserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'nuevo@cambios.com' })
  email!: string;

  @ApiProperty({ example: 'Nuevo Usuario' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'] })
  role!: 'ADMIN' | 'USER';

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  failedLoginAttempts!: number;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  blockedUntil!: Date | null;

  @ApiProperty()
  isBanned!: boolean;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  bannedUntil!: Date | null;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;
}

export class UserListItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin@cambios.com' })
  email!: string;

  @ApiProperty({ example: 'Admin' })
  name!: string;

  @ApiProperty({ type: 'string', nullable: true })
  nickname!: string | null;

  @ApiProperty({ enum: ['ADMIN', 'USER'] })
  role!: 'ADMIN' | 'USER';

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;
}

export class ActivatedUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin@cambios.com' })
  email!: string;

  @ApiProperty({ example: 'Admin' })
  name!: string;

  @ApiProperty({ type: 'string', nullable: true })
  nickname!: string | null;

  @ApiProperty({ enum: ['ADMIN', 'USER'] })
  role!: 'ADMIN' | 'USER';

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: Date;
}

export class ActivateUserResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: ActivatedUserDto })
  user!: ActivatedUserDto;
}

export class PrimaryCurrencyUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin@cambios.com' })
  email!: string;

  @ApiProperty({ example: 'Admin' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'] })
  role!: 'ADMIN' | 'USER';

  @ApiProperty({ type: 'integer' })
  primaryCurrencyId!: number;
}
