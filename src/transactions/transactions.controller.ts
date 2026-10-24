import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  UseFilters,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionDto } from '../common/swagger/shared-response.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FxDomainExceptionFilter } from '../fx-operations/fx-domain-exception.filter';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseFilters(FxDomainExceptionFilter)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'Unique key for safely retrying the transaction request' })
  @ApiOperation({ summary: 'Crear transacción (compra/venta)' })
  @ApiResponse({ status: 201, description: 'Transacción creada', type: TransactionDto })
  create(
    @CurrentUser('id') userId: number,
    @Body() createDto: CreateTransactionDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key header is required for transactions');
    }
    return this.transactionsService.create(userId, createDto, idempotencyKey.trim());
  }

  @Get()
  @ApiOperation({ summary: 'Listar transacciones' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones', type: TransactionDto, isArray: true })
  findAll(
    @CurrentUser('id') userId: number,
    @Query() query: QueryTransactionDto,
  ) {
    return this.transactionsService.findAll(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener transacción por ID' })
  @ApiResponse({ status: 200, description: 'Transacción encontrada', type: TransactionDto })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  findOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.transactionsService.findOne(userId, id);
  }
}
