import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { Maintenance } from '../entities/maintenance.entity';
import { MaintenanceStatus } from '../../../common/constants/maintenance-status.enum';

/**
 * Capa de Acceso a Datos (Repositorio) para Mantenimientos.
 * Encapsula consultas complejas, relaciones y el manejo de transacciones atómicas.
 */
@Injectable()
export class MaintenancesRepository {
  constructor(
    @InjectRepository(Maintenance)
    private readonly repository: Repository<Maintenance>,
    private readonly dataSource: DataSource,
  ) {}

  create(data: Partial<Maintenance>): Maintenance {
    return this.repository.create(data);
  }

  async save(maintenance: Maintenance): Promise<Maintenance> {
    return this.repository.save(maintenance);
  }

  async findAll(): Promise<Maintenance[]> {
    return this.repository.find({
      relations: ['vehicle', 'mechanic', 'workshop'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async findActive(): Promise<Maintenance[]> {
    return this.repository.find({
      where: {
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
      relations: ['vehicle', 'mechanic', 'workshop'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async findById(id: number): Promise<Maintenance | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['vehicle', 'mechanic', 'workshop'],
    });
  }

  async findActiveByVehicle(vehicleId: number): Promise<Maintenance | null> {
    return this.repository.findOne({
      where: {
        vehicle: { id: vehicleId },
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
    });
  }

  async findActiveByMechanic(mechanicId: number): Promise<Maintenance[]> {
    return this.repository.find({
      where: {
        mechanic: { id: mechanicId },
        status: In([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
      },
    });
  }

  async findByVehicle(vehicleId: number): Promise<Maintenance[]> {
    return this.repository.find({
      where: { vehicle: { id: vehicleId } },
      relations: ['vehicle', 'mechanic', 'workshop'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async findByMechanic(mechanicId: number): Promise<Maintenance[]> {
    return this.repository.find({
      where: { mechanic: { id: mechanicId } },
      relations: ['vehicle', 'mechanic', 'workshop'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async findVehicleHistory(vehicleId: number): Promise<Maintenance[]> {
    return this.repository.find({
      where: { vehicle: { id: vehicleId } },
      relations: ['mechanic', 'workshop'],
      order: { scheduledDate: 'DESC' },
    });
  }

  /**
   * Ejecuta una transacción atómica encapsulada en la capa de persistencia.
   */
  async executeTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(operation);
  }
}
