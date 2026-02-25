import {
  Controller,
  Get,
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
import { CashBalancesService } from './cash-balances.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cash Balances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-balances')
export class CashBalancesController {
  constructor(private readonly cashBalancesService: CashBalancesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener saldos de caja por moneda' })
  @ApiResponse({ status: 200, description: 'Lista de saldos' })
  findAll(@CurrentUser('id') userId: number) {
    return this.cashBalancesService.findAll(userId);
  }

  @Get(':currencyId')
  @ApiOperation({ summary: 'Obtener saldo de una moneda específica' })
  @ApiResponse({ status: 200, description: 'Saldo de la moneda' })
  findByCurrency(
    @CurrentUser('id') userId: number,
    @Param('currencyId', ParseIntPipe) currencyId: number,
  ) {
    return this.cashBalancesService.findByCurrency(userId, currencyId);
  }
}
