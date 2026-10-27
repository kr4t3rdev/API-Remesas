import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUserActionDto } from './dto/admin-user-action.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { PlatformSeriesQueryDto } from './dto/platform-series-query.dto';
import {
  AdminAuditLogDto,
  AdminExpiringLicenseDto,
  AdminKpisDto,
  AdminPlatformSeriesDto,
  AdminProfileStatsDto,
  AdminServiceMetricsDto,
  AdminUserActionResultDto,
  AdminUserDetailDto,
  AdminUserDto,
} from './admin.swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs de administración' })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Fecha inicial del rango (YYYY-MM-DD). Por defecto: hace 30 días.',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Fecha final del rango (YYYY-MM-DD). Por defecto: hoy.',
  })
  @ApiQuery({
    name: 'planId',
    required: false,
    type: String,
    description: 'Id de plan para filtrar las licencias contadas.',
  })
  @ApiResponse({ status: 200, type: AdminKpisDto })
  getKpis(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('planId') planId?: string,
  ) {
    return this.adminService.getKpis(dateFrom, dateTo, planId ? Number(planId) : undefined);
  }

  @Get('reports/platform-series')
  @ApiOperation({ summary: 'Series temporales de plataforma (billing, newUsers, churn por mes)' })
  @ApiResponse({ status: 200, type: AdminPlatformSeriesDto })
  getPlatformSeries(@Query() query: PlatformSeriesQueryDto) {
    return this.adminService.getPlatformSeries(query.monthsBack ?? 6);
  }

  @Get('profile/stats')
  @ApiOperation({ summary: 'Estadísticas del perfil administrativo' })
  @ApiResponse({ status: 200, type: AdminProfileStatsDto })
  getProfileStats() {
    return this.adminService.getProfileStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Listado operativo de usuarios' })
  @ApiResponse({ status: 200, type: AdminUserDto, isArray: true })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users')
  @ApiOperation({ summary: 'Crear usuario desde consola admin (CRUD extendido en una sola captura)' })
  @ApiResponse({ status: 201, type: AdminUserDto })
  createUser(
    @CurrentUser('id') actorUserId: number,
    @Body() dto: CreateAdminUserDto,
  ) {
    return this.adminService.createUserFromAdminConsole(actorUserId, dto);
  }

  @Get('users/blocked')
  @ApiOperation({ summary: 'Usuarios bloqueados o baneados' })
  @ApiResponse({ status: 200, type: AdminUserDto, isArray: true })
  getBlockedUsers() {
    return this.adminService.getBlockedUsers();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Detalle operativo de un usuario' })
  @ApiResponse({ status: 200, type: AdminUserDetailDto })
  getUserDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Actualizar datos base (CRUD) de usuario' })
  @ApiResponse({ status: 200, type: AdminUserDto })
  updateUserBasic(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') actorUserId: number,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUserBasic(id, actorUserId, dto);
  }

  @Post('users/:id/actions')
  @ApiOperation({ summary: 'Aplicar control operativo de usuario (no-CRUD)' })
  @ApiResponse({ status: 200, description: 'Resultado según actionType', type: AdminUserActionResultDto })
  applyUserControlAction(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') actorUserId: number,
    @Body() dto: AdminUserActionDto,
  ) {
    return this.adminService.applyUserControlAction(id, actorUserId, dto);
  }

  @Get('licenses/expiring')
  @ApiOperation({ summary: 'Licencias por vencer' })
  @ApiQuery({
    name: 'windowDays',
    required: false,
    type: String,
    description: 'Ventana en días para contar licencias por vencer. Por defecto: 7.',
  })
  @ApiResponse({ status: 200, type: AdminExpiringLicenseDto, isArray: true })
  getExpiringLicenses(@Query('windowDays') windowDays = '7') {
    return this.adminService.getExpiringLicenses(Number(windowDays));
  }

  @Get('metrics/services')
  @ApiOperation({ summary: 'Métricas de servicios activos y expirados' })
  @ApiResponse({ status: 200, type: AdminServiceMetricsDto })
  getServiceMetrics() {
    return this.adminService.getServiceMetrics();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Bitácora de auditoría admin' })
  @ApiResponse({ status: 200, type: AdminAuditLogDto, isArray: true })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
