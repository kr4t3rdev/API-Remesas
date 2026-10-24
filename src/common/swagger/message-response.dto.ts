import { ApiProperty } from '@nestjs/swagger';

/**
 * Shared response shape for operations that only return a human-readable
 * message. Defined once so every module references the same component in
 * the OpenAPI contract instead of duplicating identical schemas.
 */
export class MessageResponseDto {
  @ApiProperty({ example: 'Operación realizada correctamente' })
  message!: string;
}
