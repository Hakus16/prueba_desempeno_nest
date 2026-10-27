import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { MaintenancesService } from './maintenances.service';
import { MaintenancesController } from './maintenances.controller';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Mechanic } from '../mechanics/entities/mechanic.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { MechanicsModule } from '../mechanics/mechanics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Maintenance, Vehicle, Mechanic, Workshop]),
    MechanicsModule,
  ],
  controllers: [MaintenancesController],
  providers: [MaintenancesService],
  exports: [MaintenancesService, TypeOrmModule],
})
export class MaintenancesModule {}
