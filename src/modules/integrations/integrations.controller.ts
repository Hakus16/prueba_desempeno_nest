import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { Public } from '../../common/decorators/public.decorator';
import { VehiclesService } from '../vehicles/vehicles.service';
import { MaintenancesService } from '../maintenances/maintenances.service';
import { VehicleStatus } from '../../common/constants/vehicle-status.enum';

@ApiTags('Integrations (x-api-key)')
@Public()
@UseGuards(ApiKeyGuard)
@ApiHeader({
  name: 'x-api-key',
  description: 'Clave de autenticación para integraciones externas autorizadas',
  required: true,
})
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly maintenancesService: MaintenancesService,
  ) {}

  @Get('vehicles/:plate/history')
  @ApiOperation({
    summary: 'Consultar estado e historial de mantenimientos de un vehículo para socios externos',
  })
  @ApiParam({ name: 'plate', description: 'Placa del vehículo (ej. ABC123)' })
  @ApiResponse({ status: 200, description: 'Historial e información del vehículo' })
  @ApiResponse({ status: 401, description: 'API Key inválida o no enviada' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async getVehicleHistoryForExternal(@Param('plate') plate: string) {
    const vehicle = await this.vehiclesService.findByPlate(plate);
    const maintenances = await this.maintenancesService.findVehicleHistory(vehicle.id);

    return {
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        available: vehicle.status === VehicleStatus.AVAILABLE,
      },
      maintenances: maintenances.map((m) => ({
        id: m.id,
        type: m.type,
        status: m.status,
        description: m.description,
        mileage: m.finalMileage || m.initialMileage,
        cost: m.finalCost ? Number(m.finalCost) : 0,
        finishedAt: m.completedAt,
        mechanic: m.mechanic
          ? {
              id: m.mechanic.id,
              name: m.mechanic.name,
            }
          : null,
        workshop: m.workshop
          ? {
              id: m.workshop.id,
              name: m.workshop.name,
            }
          : null,
      })),
    };
  }
}
