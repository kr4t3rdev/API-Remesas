import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RateHistoryService } from './rate-history.service';
import { RateHistoryEntryDto, RateHistoryResetDto, RateHistoryStatsDto } from './rate-history.swagger';
import { CreateRateHistoryDto } from './dto/create-rate-history.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Rate History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rate-history')
export class RateHistoryController {
  constructor(private readonly rateHistoryService: RateHistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar tasa en el historial' })
  @ApiResponse({ status: 201, description: 'Tasa registrada', type: RateHistoryEntryDto })
  create(
    @CurrentUser('id') userId: number,
    @Body() createDto: CreateRateHistoryDto,
  ) {
    return this.rateHistoryService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener historial de tasas' })
  @ApiQuery({ name: 'currencyId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Historial de tasas', type: RateHistoryEntryDto, isArray: true })
  findAll(
    @CurrentUser('id') userId: number,
    @Query('currencyId') currencyId?: number,
  ) {
    if (currencyId) {
      return this.rateHistoryService.findAll(userId, Number(currencyId));
    }
    return this.rateHistoryService.findAll(userId);
  }

  @Get('manual')
  @ApiOperation({ summary: 'Obtener tasas registradas manualmente' })
  @ApiQuery({ name: 'currencyId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tasas manuales', type: RateHistoryEntryDto, isArray: true })
  getManualEntries(
    @CurrentUser('id') userId: number,
    @Query('currencyId') currencyId?: number,
  ) {
    if (currencyId) {
      return this.rateHistoryService.getManualEntries(userId, Number(currencyId));
    }
    return this.rateHistoryService.getManualEntries(userId);
  }

  @Get('pair/:fromId/:toId')
  @ApiOperation({ summary: 'Historial de tasas por par de monedas' })
  @ApiResponse({ status: 200, description: 'Historial del par', type: RateHistoryEntryDto, isArray: true })
  findByPair(
    @CurrentUser('id') userId: number,
    @Param('fromId', ParseIntPipe) fromId: number,
    @Param('toId', ParseIntPipe) toId: number,
  ) {
    return this.rateHistoryService.findByPair(userId, fromId, toId);
  }

  @Get('stats/:fromId/:toId')
  @ApiOperation({ summary: 'Estadísticas de tasas por par' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Estadísticas del par', type: RateHistoryStatsDto })
  getStats(
    @CurrentUser('id') userId: number,
    @Param('fromId', ParseIntPipe) fromId: number,
    @Param('toId', ParseIntPipe) toId: number,
    @Query('days') days?: number,
  ) {
    return this.rateHistoryService.getStats(
      userId,
      fromId,
      toId,
      days ? Number(days) : 30,
    );
  }

  @Get('latest/:fromId/:toId')
  @ApiOperation({ summary: 'Obtener última tasa de un par' })
  @ApiResponse({ status: 200, description: 'Última tasa (decimal-string, null si no hay registro)' })
  getLatestRate(
    @CurrentUser('id') userId: number,
    @Param('fromId', ParseIntPipe) fromId: number,
    @Param('toId', ParseIntPipe) toId: number,
  ) {
    return this.rateHistoryService.getLatestRate(userId, fromId, toId);
  }

  @Delete()
  @ApiOperation({ summary: 'Resetear historial de tasas' })
  @ApiQuery({ name: 'currencyId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Historial reseteado', type: RateHistoryResetDto })
  resetHistory(
    @CurrentUser('id') userId: number,
    @Query('currencyId') currencyId?: number,
  ) {
    if (currencyId) {
      return this.rateHistoryService.resetHistory(userId, Number(currencyId));
    }
    return this.rateHistoryService.resetHistory(userId);
  }
}
