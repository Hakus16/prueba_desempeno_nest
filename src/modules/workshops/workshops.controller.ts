import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Workshops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo taller (Solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Taller registrado exitosamente' })
  async create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopsService.create(createWorkshopDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos los talleres' })
  @ApiResponse({ status: 200, description: 'Lista completa de talleres' })
  async findAll() {
    return this.workshopsService.findAll();
  }

  @Get('active')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Listar únicamente talleres activos' })
  @ApiResponse({ status: 200, description: 'Lista de talleres activos' })
  async findActive() {
    return this.workshopsService.findActive();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar información de un taller específico' })
  @ApiResponse({ status: 200, description: 'Taller encontrado' })
  @ApiResponse({ status: 404, description: 'Taller no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.workshopsService.findById(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar información de un taller (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Taller actualizado' })
  async update(
    @Param('id') id: string,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return this.workshopsService.update(+id, updateWorkshopDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Activar o inactivar un taller (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estado del taller actualizado' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.workshopsService.toggleActive(+id, Boolean(isActive));
  }
}
