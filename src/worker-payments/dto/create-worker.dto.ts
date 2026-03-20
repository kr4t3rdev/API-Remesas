import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ description: 'Nombre del trabajador' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Teléfono del trabajador', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'URL de la foto del trabajador', required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
