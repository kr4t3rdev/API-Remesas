import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RemittanceEventDto } from './dto/remittance-event.dto';
import { RemittancesService } from './remittances.service';

@ApiTags('Remittances')
@Controller('remittances')
export class RemittancesController {
  constructor(private readonly service: RemittancesService) {}

  @Post('events')
  ingest(@Headers('x-provider-token') token: string, @Body() event: RemittanceEventDto) { this.service.assertProviderToken(token); return this.service.ingest(event.userId, event); }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Get()
  list(@CurrentUser('id') userId: number) { return this.service.list(userId); }

  @UseGuards(JwtAuthGuard) @ApiBearerAuth() @Post(':id/retry')
  retry(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number, @Body() event: RemittanceEventDto) { return this.service.retry(userId, id, event); }
}
