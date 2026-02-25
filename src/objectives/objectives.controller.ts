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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Objectives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear objetivo' })
  @ApiResponse({ status: 201, description: 'Objetivo creado' })
  create(@Body() createDto: CreateObjectiveDto, @CurrentUser('id') userId: number) {
    return this.objectivesService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar objetivos' })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Lista de objetivos' })
  findAll(@CurrentUser('id') userId: number, @Query('status') status?: string) {
    return this.objectivesService.findAll(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener objetivo por ID' })
  @ApiResponse({ status: 200, description: 'Objetivo encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.objectivesService.findOne(id, userId);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Obtener progreso del objetivo' })
  @ApiResponse({ status: 200, description: 'Progreso del objetivo' })
  getProgress(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.objectivesService.getProgress(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar objetivo' })
  @ApiResponse({ status: 200, description: 'Objetivo actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateObjectiveDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.objectivesService.update(id, updateDto, userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar estado del objetivo' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.objectivesService.updateStatus(id, updateStatusDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar objetivo' })
  @ApiResponse({ status: 200, description: 'Objetivo eliminado' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.objectivesService.remove(id, userId);
  }
}
