import {
  Controller,
  Get,
  Put,
  Delete,
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
import { ExchangeRatesService } from './exchange-rates.service';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ExchangeRateComputedDto,
  ExchangeRateDto,
  ExchangeRateUpdateResponseDto,
  ExchangeRateWithCurrencyDto,
  ExchangeRatesCurrentResponseDto,
  RemoveExchangeRateResponseDto,
} from './exchange-rates.swagger';

@ApiTags('Exchange Rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener tasas actuales' })
  @ApiResponse({ status: 200, description: 'Lista de tasas actuales', type: ExchangeRatesCurrentResponseDto })
  findCurrent(@CurrentUser('id') userId: number) {
    return this.exchangeRatesService.findCurrent(userId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Obtener todas las tasas (incluyendo inactivas)' })
  @ApiResponse({ status: 200, description: 'Lista de todas las tasas', type: ExchangeRateComputedDto, isArray: true })
  findAll(@CurrentUser('id') userId: number) {
    return this.exchangeRatesService.findAll(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Historial de tasas' })
  @ApiQuery({ name: 'currencyId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Historial de tasas', type: ExchangeRateWithCurrencyDto, isArray: true })
  getHistory(
    @CurrentUser('id') userId: number,
    @Query('currencyId') currencyId?: number,
  ) {
    if (currencyId) {
      return this.exchangeRatesService.getHistory(userId, Number(currencyId));
    }
    return this.exchangeRatesService.getHistory(userId);
  }

  @Get(':currencyId')
  @ApiOperation({ summary: 'Historial de tasas por moneda' })
  @ApiResponse({ status: 200, description: 'Historial de tasas de la moneda', type: ExchangeRateDto, isArray: true })
  findByCurrency(
    @CurrentUser('id') userId: number,
    @Param('currencyId', ParseIntPipe) currencyId: number,
  ) {
    return this.exchangeRatesService.findByCurrency(userId, currencyId);
  }

  @Put(':currencyId')
  @ApiOperation({ summary: 'Actualizar tasa de cambio' })
  @ApiResponse({ status: 200, description: 'Tasa actualizada', type: ExchangeRateUpdateResponseDto })
  @ApiResponse({ status: 404, description: 'Moneda no encontrada' })
  update(
    @CurrentUser('id') userId: number,
    @Param('currencyId', ParseIntPipe) currencyId: number,
    @Body() updateDto: UpdateExchangeRateDto,
  ) {
    return this.exchangeRatesService.update(userId, currencyId, updateDto);
  }

  @Delete(':currencyId')
  @ApiOperation({ summary: 'Eliminar tasa de cambio' })
  @ApiResponse({ status: 200, description: 'Tasa eliminada', type: RemoveExchangeRateResponseDto })
  @ApiResponse({ status: 400, description: 'No se puede eliminar la tasa porque tiene transacciones asociadas' })
  @ApiResponse({ status: 404, description: 'Tasa no encontrada' })
  remove(
    @CurrentUser('id') userId: number,
    @Param('currencyId', ParseIntPipe) currencyId: number,
  ) {
    return this.exchangeRatesService.remove(userId, currencyId);
  }
}
