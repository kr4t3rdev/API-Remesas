import {
  Controller,
  Get,
  Post,
  Body,
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
import { ReconciliationsService } from './reconciliations.service';
import { ReconcileExpenseDto } from './dto/reconcile-expense.dto';
import { ReconcileIncomeDto } from './dto/reconcile-income.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reconciliations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reconciliations')
export class ReconciliationsController {
  constructor(private readonly reconciliationsService: ReconciliationsService) {}

  @Post('expense')
  @ApiOperation({ summary: 'Reconciliar gasto' })
  @ApiResponse({ status: 201, description: 'Gasto reconciliado' })
  reconcileExpense(
    @Body() dto: ReconcileExpenseDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.reconciliationsService.reconcileExpense(dto, userId);
  }

  @Post('income')
  @ApiOperation({ summary: 'Reconciliar ingreso (venta)' })
  @ApiResponse({ status: 201, description: 'Ingreso reconciliado' })
  reconcileIncome(
    @Body() dto: ReconcileIncomeDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.reconciliationsService.reconcileIncome(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las reconciliaciones' })
  @ApiResponse({ status: 200, description: 'Lista de reconciliaciones' })
  findAll(@CurrentUser('id') userId: number) {
    return this.reconciliationsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reconciliación por ID' })
  @ApiQuery({ name: 'type', enum: ['expense', 'income'] })
  @ApiResponse({ status: 200, description: 'Reconciliación encontrada' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('type') type: 'expense' | 'income',
    @CurrentUser('id') userId: number,
  ) {
    return this.reconciliationsService.findOne(id, type, userId);
  }
}
