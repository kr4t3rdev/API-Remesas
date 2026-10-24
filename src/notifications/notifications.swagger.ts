import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTOs for the Notifications module.
 *
 * Shapes mirror exactly what NotificationsService and
 * PushNotificationsService return.
 */

export class NotificationDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ example: 7, nullable: true, description: 'Null en notificaciones globales de admin' })
  userId!: number | null;

  @ApiProperty({ example: 'USER_TEMP_BLOCKED', description: 'Tipo de notificación del enum NotificationType' })
  type!: string;

  @ApiProperty({ example: 'IN_APP', description: 'Canal de entrega del enum NotificationChannel' })
  channel!: string;

  @ApiProperty({ example: 'Cuenta bloqueada temporalmente' })
  title!: string;

  @ApiProperty({ example: 'Tu cuenta se desbloqueará en 30 minutos.' })
  message!: string;

  @ApiProperty({ nullable: true, description: 'Payload libre JSON' })
  payload!: Record<string, unknown> | null;

  @ApiProperty({ format: 'date-time', nullable: true, description: 'Null cuando la notificación no fue leída' })
  readAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class NotificationListMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 3 })
  unreadCount!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class NotificationListDto {
  @ApiProperty({ type: [NotificationDto] })
  data!: NotificationDto[];

  @ApiProperty({ type: NotificationListMetaDto })
  meta!: NotificationListMetaDto;
}

export class NotificationCountDto {
  @ApiProperty({ example: 3, description: 'Resultado de updateMany: filas afectadas, o total sin leer en unread-count' })
  count!: number;
}

export class PushDeviceDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 7 })
  userId!: number;

  @ApiProperty({ example: 'ExponentPushToken[xxxx]' })
  pushToken!: string;

  @ApiProperty({ example: 'ios' })
  platform!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class NotificationOkDto {
  @ApiProperty({ example: true })
  ok!: boolean;
}
