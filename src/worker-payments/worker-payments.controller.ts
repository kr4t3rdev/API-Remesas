import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { WorkerPaymentsService } from './worker-payments.service';
import { WorkerDto, WorkerMutationResultDto } from './worker-payments.swagger';
import {
  CreateWorkerDto,
  UpdateWorkerDto,
  CreateTransactionDto,
  AddBalanceDto,
  DepositDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Worker Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('worker-payments')
export class WorkerPaymentsController {
  constructor(private readonly workerPaymentsService: WorkerPaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear trabajador' })
  @ApiResponse({ status: 201, description: 'Trabajador creado', type: WorkerDto })
  create(@Body() createDto: CreateWorkerDto, @CurrentUser('id') userId: number) {
    return this.workerPaymentsService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar trabajadores' })
  @ApiResponse({ status: 200, description: 'Lista de trabajadores', type: WorkerDto, isArray: true })
  findAll(@CurrentUser('id') userId: number) {
    return this.workerPaymentsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener trabajador por ID con transacciones' })
  @ApiResponse({ status: 200, description: 'Trabajador encontrado', type: WorkerDto })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.workerPaymentsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar trabajador' })
  @ApiResponse({ status: 200, description: 'Trabajador actualizado', type: WorkerDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWorkerDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.workerPaymentsService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar trabajador' })
  @ApiResponse({ status: 200, description: 'Trabajador eliminado', type: WorkerDto })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.workerPaymentsService.remove(id, userId);
  }

  @Post(':id/transaction')
  @ApiOperation({ summary: 'Registrar transacción del trabajador' })
  @ApiResponse({ status: 201, description: 'Transacción registrada', type: WorkerMutationResultDto })
  createTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() createDto: CreateTransactionDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.workerPaymentsService.createTransaction(id, createDto, userId);
  }

  @Post(':id/balance')
  @ApiOperation({ summary: 'Agregar saldo al trabajador' })
  @ApiResponse({ status: 201, description: 'Saldo agregado', type: WorkerMutationResultDto })
  addBalance(
    @Param('id', ParseIntPipe) id: number,
    @Body() addDto: AddBalanceDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.workerPaymentsService.addBalance(id, addDto, userId);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Depositar saldo del trabajador a caja/cuenta' })
  @ApiResponse({ status: 201, description: 'Depósito realizado', type: WorkerMutationResultDto })
  deposit(
    @Param('id', ParseIntPipe) id: number,
    @Body() depositDto: DepositDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.workerPaymentsService.deposit(id, depositDto, userId);
  }
}
