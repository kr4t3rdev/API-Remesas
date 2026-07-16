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
} from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear gasto' })
  @ApiResponse({ status: 201, description: 'Gasto creado' })
  create(@Body() createDto: CreateExpenseDto, @CurrentUser('id') userId: number) {
    return this.expensesService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar gastos' })
  @ApiResponse({ status: 200, description: 'Lista de gastos' })
  findAll(@Query() query: QueryExpenseDto, @CurrentUser('id') userId: number) {
    return this.expensesService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener gasto por ID' })
  @ApiResponse({ status: 200, description: 'Gasto encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.expensesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar gasto' })
  @ApiResponse({ status: 200, description: 'Gasto actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateExpenseDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.expensesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar gasto' })
  @ApiResponse({ status: 200, description: 'Gasto eliminado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.expensesService.remove(id, userId);
  }
}
