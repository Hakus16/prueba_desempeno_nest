import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from './dto/update-maintenance-status.dto';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Mechanic } from '../mechanics/entities/mechanic.entity';
import { Workshop } from '../workshops/entities/workshop.entity';
import { MaintenanceStatus } from '../../common/constants/maintenance-status.enum';
import { VehicleStatus } from '../../common/constants/vehicle-status.enum';

/**
 * Servicio encargado de la lógica y reglas de negocio del ciclo de vida
 * de los mantenimientos de FleetCore.
 */
@Injectable()
export class MaintenancesService {
  constructor(
    @InjectRepository(Maintenance)
    private readonly maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Registra un nuevo mantenimiento aplicando las reglas de negocio:
   * 1. Vehículo existente y no inactivo.
   * 2. Mecánico existente y activo.
   * 3. Taller existente y activo.
   * 4. Vehículo sin mantenimiento activo previo.
   * 5. Kilometraje inicial >= kilometraje actual del vehículo.
   * 6. Mecánico sin cruces de horario con otros mantenimientos activos.
   */
  async create(createDto: CreateMaintenanceDto): Promise<Maintenance> {
    // 1. Validar vehículo
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createDto.vehicleId },
    });
    if (!vehicle) {
      throw new NotFoundException(`No se encontró el vehículo con ID ${createDto.vehicleId}`);
    }
    if (vehicle.status === VehicleStatus.INACTIVE) {
      throw new BadRequestException('Un vehículo en estado INACTIVE no puede ser asociado a un nuevo mantenimiento');
    }

    // Validar kilometraje respecto al actual del vehículo
    if (createDto.initialMileage < vehicle.mileage) {
      throw new BadRequestException(
        `El kilometraje registrado en el mantenimiento (${createDto.initialMileage} km) no puede ser inferior al kilometraje actual del vehículo (${vehicle.mileage} km)`,
      );
    }

    // Validar que el vehículo no tenga un mantenimiento activo
    const activeVehicleMaintenance = await this.maintenanceRepository.findOne({
      where: {
        vehicle: { id: vehicle.id },
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
    });
    if (activeVehicleMaintenance) {
      throw new ConflictException(`El vehículo ${vehicle.plate} ya tiene un mantenimiento activo`);
    }

    // 2. Validar mecánico
    const mechanic = await this.mechanicRepository.findOne({
      where: { id: createDto.mechanicId },
    });
    if (!mechanic) {
      throw new NotFoundException(`No se encontró el mecánico con ID ${createDto.mechanicId}`);
    }
    if (!mechanic.isActive) {
      throw new BadRequestException('No se puede asignar un mecánico inactivo a un nuevo mantenimiento');
    }

    // 3. Validar taller
    const workshop = await this.workshopRepository.findOne({
      where: { id: createDto.workshopId },
    });
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
      : new Date(newStart.getTime() + 2 * 60 * 60 * 1000); // 2 horas por defecto

    if (newEnd <= newStart) {
      throw new BadRequestException('La fecha estimada de finalización debe ser posterior a la fecha programada');
    }

    // Buscar mantenimientos activos del mecánico
    const mechanicActiveMaintenances = await this.maintenanceRepository.find({
      where: {
        mechanic: { id: mechanic.id },
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
    });

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

    const newMaintenance = this.maintenanceRepository.create({
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

    return this.maintenanceRepository.save(newMaintenance);
  }

  /**
   * Actualiza el estado de un mantenimiento mediante una transacción de base de datos.
   * Maneja las transiciones permitidas y el cambio de estado del vehículo en forma atómica.
   */
  async updateStatus(
    id: number,
    updateDto: UpdateMaintenanceStatusDto,
  ): Promise<Maintenance> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener mantenimiento con relaciones bloqueado para actualización
      const maintenance = await queryRunner.manager.findOne(Maintenance, {
        where: { id },
        relations: ['vehicle', 'mechanic', 'workshop'],
      });

      if (!maintenance) {
        throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
      }

      const currentStatus = maintenance.status;
      const targetStatus = updateDto.status;
      const vehicle = maintenance.vehicle;

      // 2. Validar transiciones de estado
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

      // 3. Procesar transiciones válidas
      if (targetStatus === MaintenanceStatus.IN_PROGRESS) {
        if (currentStatus !== MaintenanceStatus.SCHEDULED) {
          throw new BadRequestException(`No se puede pasar a IN_PROGRESS desde el estado actual (${currentStatus})`);
        }
        maintenance.status = MaintenanceStatus.IN_PROGRESS;
        vehicle.status = VehicleStatus.IN_MAINTENANCE;
        await queryRunner.manager.save(vehicle);
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

        // Actualizar vehículo a AVAILABLE y actualizar su kilometraje
        vehicle.status = VehicleStatus.AVAILABLE;
        vehicle.mileage = updateDto.finalMileage;
        await queryRunner.manager.save(vehicle);
      } else if (targetStatus === MaintenanceStatus.CANCELLED) {
        maintenance.status = MaintenanceStatus.CANCELLED;
        // Si el vehículo estaba en mantenimiento, regresa a disponible
        if (vehicle.status === VehicleStatus.IN_MAINTENANCE) {
          vehicle.status = VehicleStatus.AVAILABLE;
          await queryRunner.manager.save(vehicle);
        }
      } else if (targetStatus === MaintenanceStatus.SCHEDULED) {
        if (currentStatus !== MaintenanceStatus.SCHEDULED) {
          throw new BadRequestException(`No se puede regresar a SCHEDULED desde el estado ${currentStatus}`);
        }
      }

      const updatedMaintenance = await queryRunner.manager.save(maintenance);
      await queryRunner.commitTransaction();

      return updatedMaintenance;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      relations: ['vehicle', 'mechanic', 'workshop'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async findActive(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: {
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
      relations: ['vehicle', 'mechanic', 'workshop'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async findByVehicle(vehicleId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { vehicle: { id: vehicleId } },
      relations: ['vehicle', 'mechanic', 'workshop'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async findByMechanic(mechanicId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { mechanic: { id: mechanicId } },
      relations: ['vehicle', 'mechanic', 'workshop'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async findVehicleHistory(vehicleId: number): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      where: { vehicle: { id: vehicleId } },
      relations: ['mechanic', 'workshop'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async findById(id: number): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['vehicle', 'mechanic', 'workshop'],
    });
    if (!maintenance) {
      throw new NotFoundException(`Mantenimiento con ID ${id} no encontrado`);
    }
    return maintenance;
  }
}
