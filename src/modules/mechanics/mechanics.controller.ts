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
import { MechanicsService } from './mechanics.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Mechanics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo mecánico (Solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Mecánico registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'Correo duplicado' })
  async create(@Body() createMechanicDto: CreateMechanicDto) {
    return this.mechanicsService.create(createMechanicDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar todos los mecánicos registrados' })
  @ApiResponse({ status: 200, description: 'Lista de mecánicos' })
  async findAll() {
    return this.mechanicsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar un mecánico específico por ID' })
  @ApiResponse({ status: 200, description: 'Mecánico encontrado' })
  @ApiResponse({ status: 404, description: 'Mecánico no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.mechanicsService.findById(+id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar información de un mecánico (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Mecánico actualizado' })
  async update(
    @Param('id') id: string,
    @Body() updateMechanicDto: UpdateMechanicDto,
  ) {
    return this.mechanicsService.update(+id, updateMechanicDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Activar o inactivar un mecánico (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estado del mecánico actualizado' })
  async toggleStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.mechanicsService.toggleActive(+id, Boolean(isActive));
  }
}
