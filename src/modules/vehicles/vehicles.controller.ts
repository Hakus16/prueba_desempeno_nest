import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/roles.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo vehículo (Solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Vehículo registrado exitosamente' })
  @ApiResponse({ status: 409, description: 'Placa duplicada' })
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Listar todos los vehículos registrados' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos' })
  async findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':term')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  @ApiOperation({ summary: 'Consultar información de un vehículo mediante su ID o Placa' })
  @ApiParam({ name: 'term', description: 'ID numérico o Placa del vehículo (ej. ABC123)' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async findOne(@Param('term') term: string) {
    return this.vehiclesService.findByIdOrPlate(term);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar información de un vehículo (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Vehículo actualizado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Inactivación y eliminación lógica de un vehículo (Solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Vehículo inactivado' })
  async remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}
