import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { CurrenciesService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

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
}
