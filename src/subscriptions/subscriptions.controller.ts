import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionLicenseDto, SubscriptionPaymentDto } from './subscriptions.swagger';
import { AssignLicenseDto } from './dto/assign-license.dto';
import { RenewLicenseDto } from './dto/renew-license.dto';
import { SuspendLicenseDto } from './dto/suspend-license.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('licenses')
  @ApiOperation({ summary: 'Listar licencias' })
  @ApiResponse({ status: 200, type: SubscriptionLicenseDto, isArray: true })
  listLicenses(@Query('userId') userId?: string) {
    return this.subscriptionsService.listLicenses(userId ? Number(userId) : undefined);
  }

  @Get('licenses/:id')
  @ApiOperation({ summary: 'Obtener detalle de licencia' })
  @ApiResponse({ status: 200, type: SubscriptionLicenseDto })
  getLicense(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.getLicense(id);
  }

  @Post('licenses')
  @ApiOperation({ summary: 'Asignar licencia a usuario' })
  @ApiResponse({ status: 200, type: SubscriptionLicenseDto })
  assignLicense(@Body() dto: AssignLicenseDto) {
    return this.subscriptionsService.assignLicense({
      userId: dto.userId,
      planId: dto.planId,
      cycle: dto.cycle,
      state: dto.state,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      reason: dto.reason,
    });
  }

  @Patch('licenses/:id/renew')
  @ApiOperation({ summary: 'Renovar licencia' })
  @ApiResponse({ status: 200, type: SubscriptionLicenseDto })
  renewLicense(@Param('id', ParseIntPipe) id: number, @Body() dto: RenewLicenseDto) {
    return this.subscriptionsService.renewLicense(id, dto);
  }

  @Patch('licenses/:id/suspend')
  @ApiOperation({ summary: 'Suspender licencia' })
  @ApiResponse({ status: 200, type: SubscriptionLicenseDto })
  suspendLicense(@Param('id', ParseIntPipe) id: number, @Body() dto: SuspendLicenseDto) {
    return this.subscriptionsService.suspendLicense(id, dto.reason);
  }

  @Patch('licenses/:id/reactivate')
  @ApiOperation({ summary: 'Reactivar licencia' })
  @ApiResponse({ status: 200, type: SubscriptionLicenseDto })
  reactivateLicense(@Param('id', ParseIntPipe) id: number, @Body() dto: SuspendLicenseDto) {
    return this.subscriptionsService.reactivateLicense(id, dto.reason);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Registrar pago de suscripción (USD -> CUP)' })
  @ApiResponse({ status: 201, type: SubscriptionPaymentDto })
  registerPayment(@Body() dto: RegisterPaymentDto) {
    return this.subscriptionsService.registerPayment({
      userId: dto.userId,
      userLicenseId: dto.userLicenseId,
      planId: dto.planId,
      cycle: dto.cycle,
      amountUsd: dto.amountUsd,
      exchangeRateUsed: dto.exchangeRateUsed,
      bankAccountId: dto.bankAccountId,
      paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      notes: dto.notes,
    });
  }
}
