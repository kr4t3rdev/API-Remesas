import {
  Controller,
  Get,
  Post,
  Body,
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
import { CashAdjustmentsService } from './cash-adjustments.service';
import { CreateCashAdjustmentDto } from './dto/create-cash-adjustment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cash Adjustments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-adjustments')
export class CashAdjustmentsController {
  constructor(private readonly cashAdjustmentsService: CashAdjustmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear ajuste de caja' })
  @ApiResponse({ status: 201, description: 'Ajuste creado' })
  create(@Body() createDto: CreateCashAdjustmentDto, @CurrentUser('id') userId: number) {
    return this.cashAdjustmentsService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ajustes' })
  @ApiQuery({ name: 'currencyId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de ajustes' })
  findAll(@CurrentUser('id') userId: number, @Query('currencyId') currencyId?: number) {
    return this.cashAdjustmentsService.findAll(userId, currencyId ? Number(currencyId) : undefined);
  }
}
