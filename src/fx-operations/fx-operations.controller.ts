import { Body, Controller, Headers, Post, UseGuards, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateFxTransferDto } from './dto/create-fx-transfer.dto';
import { FxOperationsService } from './fx-operations.service';
import { FxDomainExceptionFilter } from './fx-domain-exception.filter';

@ApiTags('FX Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseFilters(FxDomainExceptionFilter)
@Controller('fx-operations')
export class FxOperationsController {
  constructor(private readonly fxOperationsService: FxOperationsService) {}

  @Post('transfers')
  createTransfer(@CurrentUser('id') userId: number, @Body() dto: CreateFxTransferDto, @Headers('Idempotency-Key') idempotencyKey?: string) {
    return this.fxOperationsService.createTransfer(userId, dto, idempotencyKey);
  }
}
