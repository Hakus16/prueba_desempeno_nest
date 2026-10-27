import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';

/**
 * Capa de Acceso a Datos (Repositorio) para Vehículos.
 * Aísla las operaciones sobre la tabla de vehículos de la base de datos PostgreSQL.
 */
@Injectable()
export class VehiclesRepository {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repository: Repository<Vehicle>,
  ) {}

  create(vehicleData: Partial<Vehicle>): Vehicle {
    return this.repository.create(vehicleData);
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    return this.repository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.repository.find({
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Vehicle | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['maintenances'],
    });
  }

  async findByPlate(plate: string, withDeleted = false): Promise<Vehicle | null> {
    return this.repository.findOne({
      where: { plate },
      relations: ['maintenances'],
      withDeleted,
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }
}
