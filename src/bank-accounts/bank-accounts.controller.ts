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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  BankAccountBalanceDto,
  BankAccountDto,
  BankAccountTransactionsDto,
} from './bank-accounts.swagger';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear cuenta bancaria' })
  @ApiResponse({ status: 201, description: 'Cuenta creada', type: BankAccountDto })
  create(
    @CurrentUser('id') userId: number,
    @Body() createDto: CreateBankAccountDto,
  ) {
    return this.bankAccountsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cuentas bancarias' })
  @ApiResponse({ status: 200, description: 'Lista de cuentas', type: BankAccountDto, isArray: true })
  findAll(@CurrentUser('id') userId: number) {
    return this.bankAccountsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cuenta por ID' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada', type: BankAccountDto })
  findOne(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bankAccountsService.findOne(userId, id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Obtener saldo de cuenta' })
  @ApiResponse({ status: 200, description: 'Saldo de la cuenta', type: BankAccountBalanceDto })
  getBalance(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bankAccountsService.getBalance(userId, id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Obtener movimientos de cuenta' })
  @ApiResponse({ status: 200, description: 'Movimientos de la cuenta', type: BankAccountTransactionsDto })
  getTransactions(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bankAccountsService.getTransactions(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Cuenta actualizada', type: BankAccountDto })
  update(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(userId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Cuenta desactivada (sin incluir la moneda)', type: BankAccountDto })
  remove(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bankAccountsService.remove(userId, id);
  }
}
