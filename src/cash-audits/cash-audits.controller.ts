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
  ApiQuery,
} from '@nestjs/swagger';
import { CashAuditsService } from './cash-audits.service';
import { CreateCashAuditDto } from './dto/create-cash-audit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CashAuditDto } from '../cash/cash.swagger';

@ApiTags('Cash Audits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-audits')
export class CashAuditsController {
  constructor(private readonly cashAuditsService: CashAuditsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar arqueo de caja' })
  @ApiResponse({ status: 201, description: 'Arqueo registrado', type: CashAuditDto })
  create(@CurrentUser('id') userId: number, @Body() createDto: CreateCashAuditDto) {
    return this.cashAuditsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar arqueos' })
  @ApiQuery({ name: 'currencyId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de arqueos', type: CashAuditDto, isArray: true })
  findAll(@CurrentUser('id') userId: number, @Query('currencyId') currencyId?: number) {
    return this.cashAuditsService.findAll(userId, currencyId ? Number(currencyId) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener arqueo por ID' })
  @ApiResponse({ status: 200, description: 'Arqueo encontrado', type: CashAuditDto })
  @ApiResponse({ status: 404, description: 'Arqueo no encontrado' })
  findOne(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.cashAuditsService.findOne(userId, id);
  }
}
