import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { Mechanic } from '../../modules/mechanics/entities/mechanic.entity';
import { Workshop } from '../../modules/workshops/entities/workshop.entity';
import { Vehicle } from '../../modules/vehicles/entities/vehicle.entity';
import { Maintenance } from '../../modules/maintenances/entities/maintenance.entity';
import { Role } from '../../common/constants/roles.enum';
import { VehicleStatus } from '../../common/constants/vehicle-status.enum';
import { MaintenanceStatus } from '../../common/constants/maintenance-status.enum';
import { MaintenanceType } from '../../common/constants/maintenance-type.enum';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async runSeed() {
    this.logger.log('--- Iniciando ejecución de seeders idempotentes ---');

    const userRepo = this.dataSource.getRepository(User);
    const mechanicRepo = this.dataSource.getRepository(Mechanic);
    const workshopRepo = this.dataSource.getRepository(Workshop);
    const vehicleRepo = this.dataSource.getRepository(Vehicle);
    const maintenanceRepo = this.dataSource.getRepository(Maintenance);

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('FleetCore2026*', salt);

    // 1. Usuarios: 1 ADMIN y 2 TECHNICIAN
    let adminUser = await userRepo.findOne({ where: { email: 'admin@fleetcore.com' } });
    if (!adminUser) {
      adminUser = await userRepo.save(
        userRepo.create({
          email: 'admin@fleetcore.com',
          password: defaultPassword,
          role: Role.ADMIN,
          isActive: true,
        }),
      );
      this.logger.log('Usuario ADMIN creado: admin@fleetcore.com');
    }

    let techUser1 = await userRepo.findOne({ where: { email: 'carlos.perez@fleetcore.com' } });
    if (!techUser1) {
      techUser1 = await userRepo.save(
        userRepo.create({
          email: 'carlos.perez@fleetcore.com',
          password: defaultPassword,
          role: Role.TECHNICIAN,
          isActive: true,
        }),
      );
      this.logger.log('Usuario TECHNICIAN 1 creado: carlos.perez@fleetcore.com');
    }

    let techUser2 = await userRepo.findOne({ where: { email: 'laura.gomez@fleetcore.com' } });
    if (!techUser2) {
      techUser2 = await userRepo.save(
        userRepo.create({
          email: 'laura.gomez@fleetcore.com',
          password: defaultPassword,
          role: Role.TECHNICIAN,
          isActive: true,
        }),
      );
      this.logger.log('Usuario TECHNICIAN 2 creado: laura.gomez@fleetcore.com');
    }

    // 2. Mecánicos: 2 activos vinculados a los técnicos y 1 inactivo
    let mechanic1 = await mechanicRepo.findOne({ where: { email: 'carlos.perez@fleetcore.com' } });
    if (!mechanic1) {
      mechanic1 = await mechanicRepo.save(
        mechanicRepo.create({
          name: 'Carlos Pérez',
          email: 'carlos.perez@fleetcore.com',
          specialty: 'Mantenimiento Preventivo y Motores',
          isActive: true,
          user: techUser1,
        }),
      );
      this.logger.log('Mecánico 1 (Activo) vinculado a techUser1 creado');
    }

    let mechanic2 = await mechanicRepo.findOne({ where: { email: 'laura.gomez@fleetcore.com' } });
    if (!mechanic2) {
      mechanic2 = await mechanicRepo.save(
        mechanicRepo.create({
          name: 'Laura Gómez',
          email: 'laura.gomez@fleetcore.com',
          specialty: 'Frenos y Suspensión',
          isActive: true,
          user: techUser2,
        }),
      );
      this.logger.log('Mecánico 2 (Activo) vinculado a techUser2 creado');
    }

    let mechanic3 = await mechanicRepo.findOne({ where: { email: 'roberto.diaz@fleetcore.com' } });
    if (!mechanic3) {
      mechanic3 = await mechanicRepo.save(
        mechanicRepo.create({
          name: 'Roberto Díaz',
          email: 'roberto.diaz@fleetcore.com',
          specialty: 'Sistemas Eléctricos',
          isActive: false,
          user: null,
        }),
      );
      this.logger.log('Mecánico 3 (Inactivo) creado');
    }

    // 3. Talleres: 1 activo y 1 inactivo
    let workshop1 = await workshopRepo.findOne({ where: { name: 'Taller Norte Principal' } });
    if (!workshop1) {
      workshop1 = await workshopRepo.save(
        workshopRepo.create({
          name: 'Taller Norte Principal',
          address: 'Av. Cra 68 # 80-20, Bogotá',
          isActive: true,
        }),
      );
      this.logger.log('Taller 1 (Activo) creado');
    }

    let workshop2 = await workshopRepo.findOne({ where: { name: 'Taller Sur Auxiliar' } });
    if (!workshop2) {
      workshop2 = await workshopRepo.save(
        workshopRepo.create({
          name: 'Taller Sur Auxiliar',
          address: 'Calle 45 Sur # 12-34, Bogotá',
          isActive: false,
        }),
      );
      this.logger.log('Taller 2 (Inactivo) creado');
    }

    // 4. Vehículos: 4 vehículos (2 AVAILABLE, 1 IN_MAINTENANCE con su mantenimiento IN_PROGRESS, y 1 INACTIVE)
    let vehicle1 = await vehicleRepo.findOne({ where: { plate: 'ABC123' } });
    if (!vehicle1) {
      vehicle1 = await vehicleRepo.save(
        vehicleRepo.create({
          plate: 'ABC123',
          brand: 'Chevrolet',
          model: 'NPR',
          year: 2022,
          mileage: 45000,
          status: VehicleStatus.AVAILABLE,
        }),
      );
      this.logger.log('Vehículo 1 (AVAILABLE, ABC123) creado');
    }

    let vehicle2 = await vehicleRepo.findOne({ where: { plate: 'XYZ789' } });
    if (!vehicle2) {
      vehicle2 = await vehicleRepo.save(
        vehicleRepo.create({
          plate: 'XYZ789',
          brand: 'Hino',
          model: 'Dutro City',
          year: 2021,
          mileage: 62000,
          status: VehicleStatus.AVAILABLE,
        }),
      );
      this.logger.log('Vehículo 2 (AVAILABLE, XYZ789) creado');
    }

    let vehicle3 = await vehicleRepo.findOne({ where: { plate: 'DEF456' } });
    if (!vehicle3) {
      vehicle3 = await vehicleRepo.save(
        vehicleRepo.create({
          plate: 'DEF456',
          brand: 'Kenworth',
          model: 'T800',
          year: 2020,
          mileage: 125000,
          status: VehicleStatus.IN_MAINTENANCE,
        }),
      );
      this.logger.log('Vehículo 3 (IN_MAINTENANCE, DEF456) creado');
    }

    let vehicle4 = await vehicleRepo.findOne({ where: { plate: 'GHI999' } });
    if (!vehicle4) {
      vehicle4 = await vehicleRepo.save(
        vehicleRepo.create({
          plate: 'GHI999',
          brand: 'International',
          model: 'WorkStar',
          year: 2018,
          mileage: 210000,
          status: VehicleStatus.INACTIVE,
        }),
      );
      this.logger.log('Vehículo 4 (INACTIVE, GHI999) creado');
    }

    // 5. Mantenimientos:
    // a) Mantenimiento en curso (IN_PROGRESS) para vehículo 3
    const existingInProgress = await maintenanceRepo.findOne({
      where: {
        vehicle: { id: vehicle3.id },
        status: MaintenanceStatus.IN_PROGRESS,
      },
    });

    if (!existingInProgress) {
      const scheduledDate = new Date();
      scheduledDate.setHours(scheduledDate.getHours() - 1);
      const estimatedEndDate = new Date();
      estimatedEndDate.setHours(estimatedEndDate.getHours() + 3);

      await maintenanceRepo.save(
        maintenanceRepo.create({
          type: MaintenanceType.CORRECTIVE,
          description: 'Reparación de sistema de embrague y caja de cambios',
          initialMileage: 125000,
          scheduledDate,
          estimatedEndDate,
          status: MaintenanceStatus.IN_PROGRESS,
          vehicle: vehicle3,
          mechanic: mechanic1,
          workshop: workshop1,
        }),
      );
      this.logger.log('Mantenimiento IN_PROGRESS asociado al vehículo 3 creado');
    }

    // b) Al menos 1 mantenimiento COMPLETED para mostrar historial (en vehículo 1)
    const existingCompleted = await maintenanceRepo.findOne({
      where: {
        vehicle: { id: vehicle1.id },
        status: MaintenanceStatus.COMPLETED,
      },
    });

    if (!existingCompleted) {
      const pastScheduled = new Date();
      pastScheduled.setDate(pastScheduled.getDate() - 30);
      const pastCompleted = new Date(pastScheduled.getTime() + 3 * 60 * 60 * 1000);

      await maintenanceRepo.save(
        maintenanceRepo.create({
          type: MaintenanceType.PREVENTIVE,
          description: 'Cambio de aceite, filtros y chequeo de frenos',
          initialMileage: 40000,
          scheduledDate: pastScheduled,
          estimatedEndDate: pastCompleted,
          status: MaintenanceStatus.COMPLETED,
          vehicle: vehicle1,
          mechanic: mechanic1,
          workshop: workshop1,
          workDone: 'Cambio de aceite sintético 15W-40, filtro de aceite y filtro de aire',
          finalCost: 350000,
          completedAt: pastCompleted,
          finalMileage: 40150,
        }),
      );
      this.logger.log('Mantenimiento COMPLETED asociado al vehículo 1 creado para historial');
    }

    this.logger.log('--- Seeders completados exitosamente sin duplicados ---');
  }
}
