import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CashService } from './cash.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateCashPolicyDto } from './dto/update-cash-policy.dto';
import { CreateCashClosingDto } from './dto/create-cash-closing.dto';
import {
  CashAuditorDto,
  CashClosingDto,
  CashOverviewDto,
  CashPolicyDetailDto,
  CashPolicyDto,
  CashValuationDto,
} from './cash.swagger';

@ApiTags('Cash')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Obtener resumen operativo de caja' })
  @ApiResponse({ status: 200, description: 'Resumen de caja por moneda', type: CashOverviewDto })
  getOverview(@CurrentUser('id') userId: number) {
    return this.cashService.getOverview(userId);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Obtener políticas de caja por moneda' })
  @ApiResponse({ status: 200, description: 'Políticas por moneda activa', type: CashPolicyDto, isArray: true })
  getPolicies(@CurrentUser('id') userId: number) {
    return this.cashService.getPolicies(userId);
  }

  @Put('policies/:currencyId')
  @ApiOperation({ summary: 'Actualizar política de caja por moneda' })
  @ApiResponse({ status: 200, description: 'Política creada o actualizada', type: CashPolicyDetailDto })
  updatePolicy(
    @CurrentUser('id') userId: number,
    @Param('currencyId', ParseIntPipe) currencyId: number,
    @Body() dto: UpdateCashPolicyDto,
  ) {
    return this.cashService.updatePolicy(userId, currencyId, dto);
  }

  @Get('auditors')
  @ApiOperation({ summary: 'Obtener usuarios disponibles como auditores' })
  @ApiResponse({ status: 200, description: 'Auditores disponibles para este tenant', type: CashAuditorDto, isArray: true })
  getAuditors(@CurrentUser('id') userId: number) {
    return this.cashService.getAuditors(userId);
  }

  @Get('closings')
  @ApiOperation({ summary: 'Listar cierres diarios de caja' })
  @ApiQuery({ name: 'currencyId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de cierres diarios', type: CashClosingDto, isArray: true })
  getClosings(@CurrentUser('id') userId: number, @Query('currencyId', new ParseIntPipe({ optional: true })) currencyId?: number) {
    return this.cashService.getClosings(userId, currencyId);
  }

  @Post('closings')
  @ApiOperation({ summary: 'Crear cierre diario de caja' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Cierre diario creado o ya existente de forma idempotente', type: CashClosingDto })
  @ApiResponse({ status: 409, description: 'Ya existe un cierre con datos diferentes' })
  createClosing(@CurrentUser('id') userId: number, @Body() dto: CreateCashClosingDto) {
    return this.cashService.createClosing(userId, dto);
  }

  @Get('closings/:id')
  @ApiOperation({ summary: 'Obtener cierre diario' })
  @ApiResponse({ status: 200, description: 'Cierre diario encontrado', type: CashClosingDto })
  getClosing(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.cashService.getClosing(userId, id);
  }

  @Get('valuation')
  @ApiOperation({ summary: 'Valorar caja global en una moneda destino' })
  @ApiQuery({ name: 'currencyId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Valuación de caja', type: CashValuationDto })
  getValuation(@CurrentUser('id') userId: number, @Query('currencyId', new ParseIntPipe({ optional: true })) currencyId?: number) {
    return this.cashService.getValuation(userId, currencyId);
  }
}
