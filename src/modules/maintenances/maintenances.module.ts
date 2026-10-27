import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { MaintenancesRepository } from './repositories/maintenances.repository';
import { MaintenancesService } from './services/maintenances.service';
import { MaintenancesController } from './maintenances.controller';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { MechanicsModule } from '../mechanics/mechanics.module';
import { WorkshopsModule } from '../workshops/workshops.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Maintenance]),
    VehiclesModule,
    MechanicsModule,
    WorkshopsModule,
  ],
  controllers: [MaintenancesController],
  providers: [MaintenancesRepository, MaintenancesService],
  exports: [MaintenancesRepository, MaintenancesService, TypeOrmModule],
})
export class MaintenancesModule {}
