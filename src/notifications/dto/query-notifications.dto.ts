import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Query de paginación y filtro del listado de notificaciones.
 *
 * Los decoradores `@ApiProperty` son **obligatorios**: sin ellos el DTO no
 * aparece en el OpenAPI y los SDKs generados no pueden enviar los query
 * params (el endpoint igual los aceptaba en runtime, pero el contrato
 * publicado no los declaraba → los clientes tipados quedaban con una
 * firma sin paginación).
 */
export class QueryNotificationsDto {
  @ApiProperty({
    type: Number,
    required: false,
    default: 1,
    minimum: 1,
    example: 1,
    description: 'Página del listado (1 por defecto).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiProperty({
    type: Number,
    required: false,
    default: 20,
    minimum: 1,
    maximum: 50,
    example: 20,
    description: 'Cantidad de notificaciones por página (20 por defecto, máximo 50).',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;

  @ApiProperty({
    type: Boolean,
    required: false,
    default: false,
    example: false,
    description: 'Traer solo las notificaciones no leídas.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  unreadOnly = false;
}
