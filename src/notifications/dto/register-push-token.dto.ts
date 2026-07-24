import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Expo push token' })
  @IsString()
  pushToken: string;

  @ApiProperty({ enum: ['android', 'ios'] })
  @IsString()
  @IsIn(['android', 'ios'])
  platform: string;
}