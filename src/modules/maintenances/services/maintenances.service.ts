import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Maintenance } from '../entities/maintenance.entity';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from '../dto/update-maintenance-status.dto';
import { MaintenanceStatus } from '../../../common/constants/maintenance-status.enum';
import { VehicleStatus } from '../../../common/constants/vehicle-status.enum';
import { MaintenancesRepository } from '../repositories/maintenances.repository';
import { VehiclesRepository } from '../../vehicles/repositories/vehicles.repository';
import { MechanicsRepository } from '../../mechanics/repositories/mechanics.repository';
import { WorkshopsRepository } from '../../workshops/repositories/workshops.repository';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

/**
 * Capa de Lógica de Negocio / Servicio para Mantenimientos.
 * Aplica todas las reglas de negocio, validaciones cruzadas y máquina de estados.
 */
@Injectable()
export class MaintenancesService {
  constructor(
    private readonly maintenancesRepository: MaintenancesRepository,
    private readonly vehiclesRepository: VehiclesRepository,
    private readonly mechanicsRepository: MechanicsRepository,
    private readonly workshopsRepository: WorkshopsRepository,
  ) {}

  /**
   * Valida y crea un nuevo mantenimiento cumpliendo con las reglas de negocio.
   */
  async create(createDto: CreateMaintenanceDto): Promise<Maintenance> {
    // 1. Validar vehículo existente y no inactivo
    const vehicle = await this.vehiclesRepository.findById(createDto.vehicleId);
    if (!vehicle) {
      throw new NotFoundException(`No se encontró el vehículo con ID ${createDto.vehicleId}`);
    }
    if (vehicle.status === VehicleStatus.INACTIVE) {
      throw new BadRequestException('Un vehículo en estado INACTIVE no puede ser asociado a un nuevo mantenimiento');
    }

    // Validar odómetro respecto al kilometraje actual del vehículo
    if (createDto.initialMileage < vehicle.mileage) {
      throw new BadRequestException(
        `El kilometraje registrado en el mantenimiento (${createDto.initialMileage} km) no puede ser inferior al kilometraje actual del vehículo (${vehicle.mileage} km)`,
      );
    }

    // Validar que el vehículo no tenga un mantenimiento activo
    const activeVehicleMaintenance = await this.maintenancesRepository.findActiveByVehicle(vehicle.id);
    if (activeVehicleMaintenance) {
      throw new ConflictException(`El vehículo ${vehicle.plate} ya tiene un mantenimiento activo`);
    }

    // 2. Validar mecánico existente y activo
    const mechanic = await this.mechanicsRepository.findById(createDto.mechanicId);
    if (!mechanic) {
      throw new NotFoundException(`No se encontró el mecánico con ID ${createDto.mechanicId}`);
    }
    if (!mechanic.isActive) {
      throw new BadRequestException('No se puede asignar un mecánico inactivo a un nuevo mantenimiento');
    }

    // 3. Validar taller existente y activo
    const workshop = await this.workshopsRepository.findById(createDto.workshopId);
    if (!workshop) {
      throw new NotFoundException(`No se encontró el taller con ID ${createDto.workshopId}`);
    }
    if (!workshop.isActive) {
      throw new BadRequestException('No se puede asignar un mantenimiento a un taller inactivo');
    }

    // 4. Validar cruce de horarios del mecánico
    const newStart = new Date(createDto.scheduledDate);
    const newEnd = createDto.estimatedEndDate
      ? new Date(createDto.estimatedEndDate)
      : new Date(newStart.getTime() + 2 * 60 * 60 * 1000);

    if (newEnd <= newStart) {
      throw new BadRequestException('La fecha estimada de finalización debe ser posterior a la fecha programada');
    }

    const mechanicActiveMaintenances = await this.maintenancesRepository.findActiveByMechanic(mechanic.id);
    for (const m of mechanicActiveMaintenances) {
      const existingStart = new Date(m.scheduledDate);
      const existingEnd = m.estimatedEndDate
        ? new Date(m.estimatedEndDate)
        : new Date(existingStart.getTime() + 2 * 60 * 60 * 1000);

      // Hay cruce si (newStart < existingEnd) && (newEnd > existingStart)
      if (newStart < existingEnd && newEnd > existingStart) {
        throw new ConflictException(
          `El mecánico ${mechanic.name} ya tiene un mantenimiento activo en ese horario (${existingStart.toISOString()} - ${existingEnd.toISOString()})`,
        );
      }
    }

    const newMaintenance = this.maintenancesRepository.create({
      type: createDto.type,
      description: createDto.description,
      initialMileage: createDto.initialMileage,
      scheduledDate: newStart,
      estimatedEndDate: newEnd,
      status: MaintenanceStatus.SCHEDULED,
      vehicle,
      mechanic,
      workshop,
    });

    return this.maintenancesRepository.save(newMaintenance);
  }

  /**
   * Actualiza el estado del mantenimiento ejecutando la lógica de transición
   * de estados y la actualización del vehículo atómicamente.
   */
  async updateStatus(
    id: number,
    updateDto: UpdateMaintenanceStatusDto,
  ): Promise<Maintenance> {
    return this.maintenancesRepository.executeTransaction(async (manager) => {
      const maintenance = await manager.findOne(Maintenance, {
        where: { id },
        relations: ['vehicle', 'mechanic', 'workshop'],
      });

      if (!maintenance) {
        throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
      }

      const currentStatus = maintenance.status;
      const targetStatus = updateDto.status;
      const vehicle = maintenance.vehicle;

      // Validar inmutabilidad de estados terminales
      if (currentStatus === MaintenanceStatus.COMPLETED) {
        throw new BadRequestException('Un mantenimiento en estado COMPLETED no puede regresar a un estado anterior');
      }

      if (currentStatus === MaintenanceStatus.CANCELLED) {
        if (
          targetStatus === MaintenanceStatus.IN_PROGRESS ||
          targetStatus === MaintenanceStatus.COMPLETED
        ) {
          throw new BadRequestException('Un mantenimiento en estado CANCELLED no puede cambiar a IN_PROGRESS o COMPLETED');
        }
      }

      // Procesar transiciones válidas
      if (targetStatus === MaintenanceStatus.IN_PROGRESS) {
        if (currentStatus !== MaintenanceStatus.SCHEDULED) {
          throw new BadRequestException(`No se puede pasar a IN_PROGRESS desde el estado actual (${currentStatus})`);
        }
        maintenance.status = MaintenanceStatus.IN_PROGRESS;
        vehicle.status = VehicleStatus.IN_MAINTENANCE;
        await manager.save(Vehicle, vehicle);
      } else if (targetStatus === MaintenanceStatus.COMPLETED) {
        if (currentStatus !== MaintenanceStatus.IN_PROGRESS && currentStatus !== MaintenanceStatus.SCHEDULED) {
          throw new BadRequestException(`No se puede completar un mantenimiento en estado ${currentStatus}`);
        }

        // Validar información obligatoria de cierre
        if (
          !updateDto.workDone ||
          updateDto.finalCost === undefined ||
          !updateDto.completedAt ||
          updateDto.finalMileage === undefined
        ) {
          throw new BadRequestException(
            'No se puede completar un mantenimiento si no contiene la información obligatoria de cierre: trabajo realizado, costo final, fecha de finalización y kilometraje final',
          );
        }

        if (updateDto.finalMileage < maintenance.initialMileage) {
          throw new BadRequestException(
            `El kilometraje final (${updateDto.finalMileage} km) no puede ser inferior al inicial (${maintenance.initialMileage} km)`,
          );
        }

        maintenance.status = MaintenanceStatus.COMPLETED;
        maintenance.workDone = updateDto.workDone;
        maintenance.finalCost = updateDto.finalCost;
        maintenance.completedAt = new Date(updateDto.completedAt);
        maintenance.finalMileage = updateDto.finalMileage;

        // Actualizar vehículo a AVAILABLE y actualizar odómetro
        vehicle.status = VehicleStatus.AVAILABLE;
        vehicle.mileage = updateDto.finalMileage;
        await manager.save(Vehicle, vehicle);
      } else if (targetStatus === MaintenanceStatus.CANCELLED) {
        maintenance.status = MaintenanceStatus.CANCELLED;
        if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
          vehicle.status = VehicleStatus.AVAILABLE;
          await manager.save(Vehicle, vehicle);
        }
      } else if (targetStatus === MaintenanceStatus.SCHEDULED) {
        if (currentStatus !== MaintenanceStatus.SCHEDULED) {
          throw new BadRequestException(`No se puede regresar a SCHEDULED desde el estado ${currentStatus}`);
        }
      }

      return manager.save(Maintenance, maintenance);
    });
  }

  async findAll(): Promise<Maintenance[]> {
    return this.maintenancesRepository.findAll();
  }

  async findActive(): Promise<Maintenance[]> {
    return this.maintenancesRepository.findActive();
  }

  async findByVehicle(vehicleId: number): Promise<Maintenance[]> {
    return this.maintenancesRepository.findByVehicle(vehicleId);
  }

  async findByMechanic(mechanicId: number): Promise<Maintenance[]> {
    return this.maintenancesRepository.findByMechanic(mechanicId);
  }

  async findVehicleHistory(vehicleId: number): Promise<Maintenance[]> {
    return this.maintenancesRepository.findVehicleHistory(vehicleId);
  }

  async findById(id: number): Promise<Maintenance> {
    const maintenance = await this.maintenancesRepository.findById(id);
    if (!maintenance) {
      throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
    }
    return maintenance;
  }
}
