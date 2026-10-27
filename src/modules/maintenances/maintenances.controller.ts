import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MaintenancesService } from './maintenances.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { MechanicsService } from '../mechanics/mechanics.service';

@ApiTags('Maintenances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('maintenances')
export class MaintenancesController {
  constructor(
    private readonly maintenancesService: MaintenancesService,
    private readonly mechanicsService: MechanicsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo mantenimiento programado (Solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Mantenimiento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Reglas de negocio infringidas (taller inactivo, km menor, etc.)' })
  @ApiResponse({ status: 409, description: 'Vehículo ya en mantenimiento o solapamiento de horario de mecánico' })
  async create(@Body() createDto: CreateMaintenanceDto) {
    return this.maintenancesService.create(createDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Actualizar el estado de un mantenimiento (ADMIN y TECHNICIAN)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado y vehículo ajustado correspondientemente' })
  @ApiResponse({ status: 400, description: 'Transición inválida o falta de información obligatoria de cierre' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateMaintenanceStatusDto,
  ) {
    return this.maintenancesService.updateStatus(+id, updateDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar todos los mantenimientos' })
  async findAll() {
    return this.maintenancesService.findAll();
  }

  @Get('active')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar mantenimientos activos (SCHEDULED e IN_PROGRESS)' })
  async findActive() {
    return this.maintenancesService.findActive();
  }

  @Get('my-assigned')
  @Roles(Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar mantenimientos asignados al técnico en sesión' })
  async findMyAssigned(@CurrentUser() user: User) {
    const mechanic = await this.mechanicsService.findByUserId(user.id);
    if (!mechanic) {
      return [];
    }
    return this.maintenancesService.findByMechanic(mechanic.id);
  }

  @Get('vehicle/:vehicleId')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar mantenimientos por vehículo' })
  @ApiParam({ name: 'vehicleId', type: Number })
  async findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.maintenancesService.findByVehicle(+vehicleId);
  }

  @Get('vehicle/:vehicleId/history')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar el historial completo de mantenimientos de un vehículo' })
  @ApiParam({ name: 'vehicleId', type: Number })
  async findVehicleHistory(@Param('vehicleId') vehicleId: string) {
    return this.maintenancesService.findVehicleHistory(+vehicleId);
  }

  @Get('mechanic/:mechanicId')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar mantenimientos asignados a un mecánico específico' })
  @ApiParam({ name: 'mechanicId', type: Number })
  async findByMechanic(@Param('mechanicId') mechanicId: string) {
    return this.maintenancesService.findByMechanic(+mechanicId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar un mantenimiento por su ID' })
  @ApiParam({ name: 'id', type: Number })
  async findById(@Param('id') id: string) {
    return this.maintenancesService.findById(+id);
  }
}
