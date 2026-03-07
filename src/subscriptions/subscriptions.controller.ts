import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SubscriptionsService } from './subscriptions.service';
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
  listLicenses(@Query('userId') userId?: string) {
    return this.subscriptionsService.listLicenses(userId ? Number(userId) : undefined);
  }

  @Post('licenses')
  @ApiOperation({ summary: 'Asignar licencia a usuario' })
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
  renewLicense(@Param('id', ParseIntPipe) id: number, @Body() dto: RenewLicenseDto) {
    return this.subscriptionsService.renewLicense(id, dto);
  }

  @Patch('licenses/:id/suspend')
  @ApiOperation({ summary: 'Suspender licencia' })
  suspendLicense(@Param('id', ParseIntPipe) id: number, @Body() dto: SuspendLicenseDto) {
    return this.subscriptionsService.suspendLicense(id, dto.reason);
  }

  @Patch('licenses/:id/reactivate')
  @ApiOperation({ summary: 'Reactivar licencia' })
  reactivateLicense(@Param('id', ParseIntPipe) id: number, @Body() dto: SuspendLicenseDto) {
    return this.subscriptionsService.reactivateLicense(id, dto.reason);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Registrar pago de suscripción (USD -> CUP)' })
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
