import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateWorkerDto } from './create-worker.dto';

export class UpdateWorkerDto {
  @ApiProperty({ description: 'Nombre del trabajador', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Teléfono del trabajador', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'URL de la foto del trabajador', required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
