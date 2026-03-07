import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle, Role } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateAdminUserProfileDto {
  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiPropertyOptional({ example: 'ID-9988' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  documentId?: string;

  @ApiPropertyOptional({ example: 'Operaciones' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ example: 'Analista Senior' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;
}

class CreateAdminUserContactDto {
  @ApiPropertyOptional({ example: '+53 555 12 34' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[0-9+()\-\s]{7,40}$/, { message: 'phone must be a valid phone format' })
  phone?: string;

  @ApiPropertyOptional({ example: 'alt@empresa.com' })
  @IsOptional()
  @IsEmail()
  alternateEmail?: string;

  @ApiPropertyOptional({ example: 'Calle 100 #23' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  address?: string;
}

class CreateAdminUserAccessDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  forcePasswordChangeOnFirstLogin?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  sendInviteEmail?: boolean;
}

enum AdminRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

class CreateAdminUserSecurityDto {
  @ApiPropertyOptional({ enum: AdminRiskLevel, example: AdminRiskLevel.MEDIUM })
  @IsOptional()
  @IsEnum(AdminRiskLevel)
  riskLevel?: AdminRiskLevel;

  @ApiPropertyOptional({ example: 'Requiere acceso a panel de soporte' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  notes?: string;
}

class CreateAdminUserPreferencesDto {
  @ApiPropertyOptional({ example: 'es-CU' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/, { message: 'locale must follow language-region format' })
  locale?: string;

  @ApiPropertyOptional({ example: 'America/Havana' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Matches(/^[A-Za-z_]+\/[A-Za-z_]+$/, { message: 'timezone must follow Area/Location format' })
  timezone?: string;
}

class CreateAdminUserLicenseSetupDto {
  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  planId?: number;

  @ApiPropertyOptional({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsOptional()
  @IsEnum(BillingCycle)
  cycle?: BillingCycle;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  startImmediately?: boolean;
}

export class CreateAdminUserDto {
  @ApiProperty({ example: 'Nuevo Usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'nuevo@cambios.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional({ type: CreateAdminUserProfileDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminUserProfileDto)
  profile?: CreateAdminUserProfileDto;

  @ApiPropertyOptional({ type: CreateAdminUserContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminUserContactDto)
  contact?: CreateAdminUserContactDto;

  @ApiPropertyOptional({ type: CreateAdminUserAccessDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminUserAccessDto)
  access?: CreateAdminUserAccessDto;

  @ApiPropertyOptional({ type: CreateAdminUserSecurityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminUserSecurityDto)
  security?: CreateAdminUserSecurityDto;

  @ApiPropertyOptional({ type: CreateAdminUserPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminUserPreferencesDto)
  preferences?: CreateAdminUserPreferencesDto;

  @ApiPropertyOptional({ type: CreateAdminUserLicenseSetupDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAdminUserLicenseSetupDto)
  licenseSetup?: CreateAdminUserLicenseSetupDto;
}
