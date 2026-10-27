import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlatformSeriesQueryDto {
  @ApiProperty({
    type: Number,
    required: false,
    minimum: 1,
    maximum: 24,
    example: 6,
    description: 'Meses hacia atrás a incluir en la serie. Por defecto: 6.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  monthsBack?: number;
}
