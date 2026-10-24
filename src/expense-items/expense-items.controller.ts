import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ExpenseItemsService } from './expense-items.service';
import { ExpenseItemDto, ExpenseItemReportDto } from './expense-items.swagger';
import { CreateExpenseItemDto } from './dto/create-expense-item.dto';
import { UpdateExpenseItemDto } from './dto/update-expense-item.dto';
import { QueryExpenseItemDto } from './dto/query-expense-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Expense Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expense-items')
export class ExpenseItemsController {
  constructor(private readonly expenseItemsService: ExpenseItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear elemento de gasto' })
  @ApiResponse({ status: 201, description: 'Elemento creado exitosamente', type: ExpenseItemDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createDto: CreateExpenseItemDto, @CurrentUser('id') userId: number) {
    return this.expenseItemsService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar elementos de gasto' })
  @ApiResponse({ status: 200, description: 'Lista de elementos', type: ExpenseItemDto, isArray: true })
  findAll(@Query() query: QueryExpenseItemDto, @CurrentUser('id') userId: number) {
    return this.expenseItemsService.findAll(query, userId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Obtener categorías usadas' })
  @ApiResponse({ status: 200, description: 'Lista de categorías', type: String, isArray: true })
  getCategories(@CurrentUser('id') userId: number) {
    return this.expenseItemsService.getCategories(userId);
  }

  @Get('reports/:period')
  @ApiOperation({ summary: 'Generar reporte de gastos' })
  @ApiResponse({ status: 200, type: ExpenseItemReportDto })
  @ApiParam({ name: 'period', enum: ['month', 'quarter', 'semester', 'year', 'all', 'single'] })
  @ApiResponse({ status: 200, description: 'Reporte generado' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  getReport(
    @Param('period') period: string,
    @Query('date') date: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.expenseItemsService.getReport(period, userId, date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener elemento por ID' })
  @ApiResponse({ status: 200, description: 'Elemento encontrado', type: ExpenseItemDto })
  @ApiResponse({ status: 404, description: 'Elemento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.expenseItemsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar elemento de gasto' })
  @ApiResponse({ status: 200, description: 'Elemento actualizado', type: ExpenseItemDto })
  @ApiResponse({ status: 404, description: 'Elemento no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateExpenseItemDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.expenseItemsService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar elemento de gasto' })
  @ApiResponse({ status: 200, description: 'Elemento eliminado', type: ExpenseItemDto })
  @ApiResponse({ status: 404, description: 'Elemento no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.expenseItemsService.remove(id, userId);
  }
}
