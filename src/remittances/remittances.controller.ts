import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RemittanceEventDto } from './dto/remittance-event.dto';
import { RemittancesService } from './remittances.service';
import { RemittanceDto, RemittanceReconcileDto } from '../common/swagger/shared-response.dto';

@ApiTags('Remittances')
@Controller('remittances')
export class RemittancesController {
  constructor(private readonly service: RemittancesService) {}

  @Post('events')
  @ApiResponse({ status: 200, description: 'Evento procesado', type: RemittanceDto })
  ingest(@Headers('x-provider-token') token: string, @Body() event: RemittanceEventDto) { const userId = this.service.resolveProviderTenant(token); return this.service.ingest(userId, event); }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Get()
  @ApiResponse({ status: 200, description: 'Remesas del tenant', type: RemittanceDto, isArray: true })
  list(@CurrentUser('id') userId: number) { return this.service.list(userId); }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Get('reconciliation')
  @ApiResponse({ status: 200, type: RemittanceReconcileDto })
  reconcile(@CurrentUser('id') userId: number) { return this.service.reconcile(userId); }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Post(':id/retry')
  @ApiResponse({ status: 200, description: 'Remesa o transacción reprocesada', type: RemittanceDto })
  retry(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number, @Body() event: RemittanceEventDto) { return this.service.retry(userId, id, event); }
}
