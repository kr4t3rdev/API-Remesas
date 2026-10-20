import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckNicknameDto {
  @ApiProperty({ example: 'Juanito' })
  @IsString()
  @MinLength(2, { message: 'El nickname debe tener al menos 2 caracteres' })
  @MaxLength(30, { message: 'El nickname debe tener como máximo 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'El nickname debe contener solo letras, números, guiones y guiones bajos',
  })
  nickname!: string;
}
