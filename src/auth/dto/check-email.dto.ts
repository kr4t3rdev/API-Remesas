import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email!: string;
}
