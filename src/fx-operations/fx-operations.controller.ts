import { BadRequestException, Body, Controller, Headers, Post, UseGuards, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateFxTransferDto } from './dto/create-fx-transfer.dto';
import { OpenCurrencyPositionDto } from './dto/open-currency-position.dto';
import { FxOperationsService } from './fx-operations.service';
import { FxOpenPositionResultDto, FxTransferResultDto } from '../common/swagger/shared-response.dto';
import { FxDomainExceptionFilter } from './fx-domain-exception.filter';

@ApiTags('FX Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseFilters(FxDomainExceptionFilter)
@Controller('fx-operations')
export class FxOperationsController {
  constructor(private readonly fxOperationsService: FxOperationsService) {}

  @Post('transfers')
  @ApiResponse({ status: 201, description: 'Transferencia FX creada', type: FxTransferResultDto })
  @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'Unique key for safely retrying the FX transfer request' })
  createTransfer(@CurrentUser('id') userId: number, @Body() dto: CreateFxTransferDto, @Headers('Idempotency-Key') idempotencyKey?: string) {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key header is required for FX transfers');
    }
    return this.fxOperationsService.createTransfer(userId, dto, idempotencyKey.trim());
  }

  @Post('positions/open')
  @ApiResponse({ status: 201, description: 'Posición abierta', type: FxOpenPositionResultDto })
  openPosition(@CurrentUser('id') userId: number, @Body() dto: OpenCurrencyPositionDto) {
    return this.fxOperationsService.openPosition(userId, dto);
  }
}
