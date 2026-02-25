import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Resumen del día' })
  @ApiQuery({ name: 'date', required: false })
  @ApiResponse({ status: 200, description: 'Resumen diario' })
  getDailyReport(
    @CurrentUser('id') userId: number,
    @Query('date') date?: string,
  ) {
    return this.reportsService.getDailyReport(userId, date);
  }

  @Get('period')
  @ApiOperation({ summary: 'Reporte por período' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Reporte del período' })
  getPeriodReport(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getPeriodReport(userId, startDate, endDate);
  }

  @Get('profit')
  @ApiOperation({ summary: 'Reporte de ganancias' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Reporte de ganancias' })
  getProfitReport(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getProfitReport(userId, startDate, endDate);
  }

  @Get('currency/:id')
  @ApiOperation({ summary: 'Reporte por moneda' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Reporte de la moneda' })
  getCurrencyReport(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getCurrencyReport(userId, id, startDate, endDate);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Reporte de gastos' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'Reporte de gastos' })
  getExpensesReport(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('category') category?: string,
  ) {
    return this.reportsService.getExpensesReport(userId, startDate, endDate, category);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Estado de cuentas bancarias' })
  @ApiResponse({ status: 200, description: 'Estado de cuentas' })
  getAccountsReport(@CurrentUser('id') userId: number) {
    return this.reportsService.getAccountsReport(userId);
  }

  @Get('objectives')
  @ApiOperation({ summary: 'Avance de objetivos' })
  @ApiResponse({ status: 200, description: 'Avance de objetivos' })
  getObjectivesReport(@CurrentUser('id') userId: number) {
    return this.reportsService.getObjectivesReport(userId);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Flujo de efectivo' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Flujo de efectivo' })
  getCashFlowReport(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getCashFlowReport(userId, startDate, endDate);
  }

  @Get('audit-summary')
  @ApiOperation({ summary: 'Resumen de arqueos' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Resumen de arqueos' })
  getAuditSummary(
    @CurrentUser('id') userId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAuditSummary(userId, startDate, endDate);
  }
}
