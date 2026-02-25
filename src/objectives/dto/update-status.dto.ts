import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ObjectiveStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: ObjectiveStatus, example: 'ACTIVO' })
  @IsEnum(ObjectiveStatus)
  status: ObjectiveStatus;
}
