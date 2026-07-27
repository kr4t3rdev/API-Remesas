import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { UnregisterPushTokenDto } from './dto/unregister-push-token.dto';
import { PushNotificationsService } from './push-notifications.service';

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
  list(@CurrentUser('id') userId: number, @Query() query: QueryNotificationsDto) {
    return this.notificationsService.listForUser(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas' })
  unreadCount(@CurrentUser('id') userId: number) {
    return this.notificationsService.getUnreadCount(userId).then((count) => ({ count }));
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('register-push-token')
  @ApiOperation({ summary: 'Registrar un push token para notificaciones push' })
  registerPushToken(
    @CurrentUser('id') userId: number,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.pushNotificationsService.upsertDevice(userId, dto);
  }

  @Delete('push-token')
  @ApiOperation({ summary: 'Eliminar el push token registrado por este user' })
  async unregisterPushToken(
    @CurrentUser('id') userId: number,
    @Body() dto: UnregisterPushTokenDto,
  ) {
    await this.pushNotificationsService.removeDevice(userId, dto);
    return { ok: true };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  markAsRead(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }
}
