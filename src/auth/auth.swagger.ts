import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTOs for the Auth module.
 *
 * Shapes mirror exactly what `AuthService` returns (its `select` clauses),
 * so generated SDKs type real payloads — see tasks 1.12 of the native
 * clients plan.
 */

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'usuario@email.com' })
  email!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'], example: 'USER' })
  role!: 'ADMIN' | 'USER';

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  failedLoginAttempts!: number;

  @ApiProperty({ type: String, nullable: true, format: 'date-time', example: null })
  blockedUntil!: string | null;

  @ApiProperty({ example: false })
  isBanned!: boolean;

  @ApiProperty({ type: String, nullable: true, format: 'date-time', example: null })
  bannedUntil!: string | null;

  @ApiProperty({ example: false })
  mustChangePassword!: boolean;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ example: false })
  mustChangePassword!: boolean;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

export class AvailabilityResponseDto {
  @ApiProperty({ example: false, description: 'true si el valor ya está registrado' })
  exists!: boolean;
}

export { MessageResponseDto } from '../common/swagger/message-response.dto';

export class RegisterResponseDto {
  @ApiProperty({ example: 'Registro exitoso. Te enviamos un email con las instrucciones para activar tu cuenta.' })
  message!: string;

  @ApiProperty({ example: 'usuario@email.com' })
  email!: string;
}

export class CurrentUserDto extends AuthUserDto {}

export class SetPrimaryCurrencyResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'usuario@email.com' })
  email!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'], example: 'USER' })
  role!: 'ADMIN' | 'USER';

  @ApiProperty({ example: 2, description: 'ID de la moneda principal del usuario' })
  primaryCurrencyId!: number;
}

export class AdminUserListItemDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'usuario@email.com' })
  email!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name!: string;

  @ApiProperty({ example: 'Juanito', nullable: true, type: String })
  nickname!: string | null;

  @ApiProperty({ enum: ['ADMIN', 'USER'], example: 'USER' })
  role!: 'ADMIN' | 'USER';

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ format: 'date-time', example: '2026-10-22T12:00:00.000Z' })
  createdAt!: string;
}

export class CreateUserResponseDto {
  @ApiProperty({ example: 2 })
  id!: number;

  @ApiProperty({ example: 'nuevo@email.com' })
  email!: string;

  @ApiProperty({ example: 'Nuevo Usuario' })
  name!: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'], example: 'USER' })
  role!: 'ADMIN' | 'USER';

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  failedLoginAttempts!: number;

  @ApiProperty({ type: String, nullable: true, format: 'date-time', example: null })
  blockedUntil!: string | null;

  @ApiProperty({ example: false })
  isBanned!: boolean;

  @ApiProperty({ format: 'date-time', example: '2026-10-22T12:00:00.000Z' })
  createdAt!: string;
}

export class ActivateUserResponseDto {
  @ApiProperty({ example: 'Usuario usuario@email.com activado correctamente. Ya puede iniciar sesión.' })
  message!: string;

  @ApiProperty({ type: AdminUserListItemDto })
  user!: AdminUserListItemDto;
}
