import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { AdminUserActionDto } from './dto/admin-user-action.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'KPIs de administración' })
  getKpis(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('planId') planId?: string,
  ) {
    return this.adminService.getKpis(dateFrom, dateTo, planId ? Number(planId) : undefined);
  }

  @Get('users')
  @ApiOperation({ summary: 'Listado operativo de usuarios' })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Post('users')
  @ApiOperation({ summary: 'Crear usuario desde consola admin (CRUD extendido en una sola captura)' })
  createUser(
    @CurrentUser('id') actorUserId: number,
    @Body() dto: CreateAdminUserDto,
  ) {
    return this.adminService.createUserFromAdminConsole(actorUserId, dto);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Detalle operativo de un usuario' })
  getUserDetail(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Actualizar datos base (CRUD) de usuario' })
  updateUserBasic(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') actorUserId: number,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUserBasic(id, actorUserId, dto);
  }

  @Post('users/:id/actions')
  @ApiOperation({ summary: 'Aplicar control operativo de usuario (no-CRUD)' })
  applyUserControlAction(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') actorUserId: number,
    @Body() dto: AdminUserActionDto,
  ) {
    return this.adminService.applyUserControlAction(id, actorUserId, dto);
  }

  @Get('users/blocked')
  @ApiOperation({ summary: 'Usuarios bloqueados o baneados' })
  getBlockedUsers() {
    return this.adminService.getBlockedUsers();
  }

  @Get('licenses/expiring')
  @ApiOperation({ summary: 'Licencias por vencer' })
  getExpiringLicenses(@Query('windowDays') windowDays = '7') {
    return this.adminService.getExpiringLicenses(Number(windowDays));
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Bitácora de auditoría admin' })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
