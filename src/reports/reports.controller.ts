import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  GetAuditSummaryDto,
  GetCashFlowReportDto,
  GetCurrencyReportByIdParamDto,
  GetCurrencyReportDto,
  GetDailyReportDto,
  GetExpensesReportDto,
  GetFxPerformanceReportDto,
  GetPeriodReportDto,
  GetProfitReportDto,
} from './dto/reports.dto';
import {
  AccountsReportDto,
  AuditSummaryReportDtoSwagger,
  CashFlowReportDtoSwagger,
  CurrencyReportDto,
  DailyReportDto,
  ExpensesReportDto,
  FxPerformanceReportDto,
  ObjectivesReportDto,
  PeriodReportDto,
  ProfitReportDto,
} from './reports.swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Resumen del día' })
  @ApiResponse({ status: 200, type: DailyReportDto })
  getDailyReport(
    @CurrentUser('id') userId: number,
    @Query() dto: GetDailyReportDto,
  ) {
    return this.reportsService.getDailyReport(userId, dto.date);
  }

  @Get('period')
  @ApiOperation({ summary: 'Reporte por período' })
  @ApiResponse({ status: 200, type: PeriodReportDto })
  getPeriodReport(
    @CurrentUser('id') userId: number,
    @Query() dto: GetPeriodReportDto,
  ) {
    return this.reportsService.getPeriodReport(
      userId,
      dto.startDate,
      dto.endDate,
    );
  }

  @Get('profit')
  @ApiOperation({ summary: 'Reporte de ganancias' })
  @ApiResponse({ status: 200, type: ProfitReportDto })
  getProfitReport(
    @CurrentUser('id') userId: number,
    @Query() dto: GetProfitReportDto,
  ) {
    return this.reportsService.getProfitReport(
      userId,
      dto.startDate,
      dto.endDate,
    );
  }

  @Get('currency/:id')
  @ApiOperation({ summary: 'Reporte por moneda' })
  @ApiResponse({ status: 200, type: CurrencyReportDto })
  getCurrencyReport(
    @CurrentUser('id') userId: number,
    @Param() params: GetCurrencyReportByIdParamDto,
    @Query() query: GetCurrencyReportDto,
  ) {
    return this.reportsService.getCurrencyReport(
      userId,
      params.id,
      query.startDate,
      query.endDate,
    );
  }

  @Get('fx-performance')
  @ApiOperation({ summary: 'Rendimiento de operaciones FX' })
  @ApiResponse({ status: 200, type: FxPerformanceReportDto })
  getFxPerformanceReport(
    @CurrentUser('id') userId: number,
    @Query() dto: GetFxPerformanceReportDto,
  ) {
    return this.reportsService.getFxPerformanceReport(
      userId,
      dto.startDate,
      dto.endDate,
      dto.currency,
    );
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Reporte de gastos' })
  @ApiResponse({ status: 200, type: ExpensesReportDto })
  getExpensesReport(
    @CurrentUser('id') userId: number,
    @Query() dto: GetExpensesReportDto,
  ) {
    return this.reportsService.getExpensesReport(
      userId,
      dto.startDate,
      dto.endDate,
      dto.category,
    );
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Estado de cuentas bancarias' })
  @ApiResponse({ status: 200, type: AccountsReportDto })
  getAccountsReport(@CurrentUser('id') userId: number) {
    return this.reportsService.getAccountsReport(userId);
  }

  @Get('objectives')
  @ApiOperation({ summary: 'Avance de objetivos' })
  @ApiResponse({ status: 200, type: ObjectivesReportDto })
  getObjectivesReport(@CurrentUser('id') userId: number) {
    return this.reportsService.getObjectivesReport(userId);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Flujo de efectivo' })
  @ApiResponse({ status: 200, type: CashFlowReportDtoSwagger })
  getCashFlowReport(
    @CurrentUser('id') userId: number,
    @Query() dto: GetCashFlowReportDto,
  ) {
    return this.reportsService.getCashFlowReport(
      userId,
      dto.startDate,
      dto.endDate,
    );
  }

  @Get('audit-summary')
  @ApiOperation({ summary: 'Resumen de arqueos' })
  @ApiResponse({ status: 200, type: AuditSummaryReportDtoSwagger })
  getAuditSummary(
    @CurrentUser('id') userId: number,
    @Query() dto: GetAuditSummaryDto,
  ) {
    return this.reportsService.getAuditSummary(
      userId,
      dto.startDate,
      dto.endDate,
    );
  }
}
