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
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear transacción (compra/venta)' })
  @ApiResponse({ status: 201, description: 'Transacción creada' })
  create(
    @CurrentUser('id') userId: number,
    @Body() createDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transacciones' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones' })
  findAll(
    @CurrentUser('id') userId: number,
    @Query() query: QueryTransactionDto,
  ) {
    return this.transactionsService.findAll(userId, query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Transacciones pendientes de reconciliar' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones pendientes' })
  findPending(@CurrentUser('id') userId: number) {
    return this.transactionsService.findPending(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener transacción por ID' })
  @ApiResponse({ status: 200, description: 'Transacción encontrada' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  findOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionsService.findOne(userId, id);
  }
}
