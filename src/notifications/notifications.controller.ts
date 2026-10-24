import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { UnregisterPushTokenDto } from './dto/unregister-push-token.dto';
import { PushNotificationsService } from './push-notifications.service';
import {
  NotificationCountDto,
  NotificationListDto,
  NotificationOkDto,
  PushDeviceDto,
} from './notifications.swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Página de notificaciones', type: NotificationListDto })
  list(@CurrentUser('id') userId: number, @Query() query: QueryNotificationsDto) {
    return this.notificationsService.listForUser(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas' })
  @ApiResponse({ status: 200, type: NotificationCountDto })
  unreadCount(@CurrentUser('id') userId: number) {
    return this.notificationsService.getUnreadCount(userId).then((count) => ({ count }));
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas', type: NotificationCountDto })
  markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('register-push-token')
  @ApiOperation({ summary: 'Registrar un push token para notificaciones push' })
  @ApiResponse({ status: 201, description: 'Dispositivo registrado o actualizado', type: PushDeviceDto })
  registerPushToken(
    @CurrentUser('id') userId: number,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.pushNotificationsService.upsertDevice(userId, dto);
  }

  @Delete('push-token')
  @ApiOperation({ summary: 'Eliminar el push token registrado por este user' })
  @ApiResponse({ status: 200, type: NotificationOkDto })
  async unregisterPushToken(
    @CurrentUser('id') userId: number,
    @Body() dto: UnregisterPushTokenDto,
  ) {
    await this.pushNotificationsService.removeDevice(userId, dto);
    return { ok: true };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada', type: NotificationCountDto })
  markAsRead(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }
}
