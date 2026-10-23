import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Currencies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las monedas' })
  @ApiResponse({ status: 200, description: 'Lista de monedas' })
  findAll() {
    return this.currenciesService.findAll();
  }

  @Get('with-primary')
  @ApiOperation({ summary: 'Listar monedas con información de moneda principal del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de monedas con primary currency' })
  findAllWithPrimary(@CurrentUser('id') userId: number) {
    return this.currenciesService.findAllWithPrimary(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener moneda por ID' })
  @ApiResponse({ status: 200, description: 'Moneda encontrada' })
  @ApiResponse({ status: 404, description: 'Moneda no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.currenciesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nueva moneda' })
  @ApiResponse({ status: 201, description: 'Moneda creada' })
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currenciesService.create(createCurrencyDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar moneda' })
  @ApiResponse({ status: 200, description: 'Moneda actualizada' })
  @ApiResponse({ status: 404, description: 'Moneda no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar moneda' })
  @ApiResponse({ status: 200, description: 'Moneda eliminada' })
  @ApiResponse({ status: 404, description: 'Moneda no encontrada' })
  @ApiResponse({ status: 400, description: 'La moneda es principal de usuarios' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.currenciesService.remove(id);
  }
}
