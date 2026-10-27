import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { MaintenancesModule } from '../maintenances/maintenances.module';

@Module({
  imports: [VehiclesModule, MaintenancesModule],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
