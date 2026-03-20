import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'abc123-def456-ghi789' })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token!: string;
}
