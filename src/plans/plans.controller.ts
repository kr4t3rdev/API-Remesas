import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PlansService } from './plans.service';
import { PlanDto } from '../common/swagger/shared-response.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Listar planes' })
  @ApiResponse({ status: 200, type: PlanDto, isArray: true })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener plan por ID' })
  @ApiResponse({ status: 200, type: PlanDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear plan' })
  @ApiResponse({ status: 201, description: 'Plan creado', type: PlanDto })
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar plan' })
  @ApiResponse({ status: 200, type: PlanDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar plan' })
  @ApiResponse({ status: 200, description: 'Plan eliminado', type: PlanDto })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.delete(id);
  }
}
