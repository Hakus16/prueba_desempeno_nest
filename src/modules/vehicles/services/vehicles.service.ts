import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehicleStatus } from '../../../common/constants/vehicle-status.enum';
import { VehiclesRepository } from '../repositories/vehicles.repository';

/**
 * Capa de Lógica de Negocio / Servicio para Vehículos.
 * Aplica las reglas del negocio de flota vehicular y delega el acceso a datos.
 */
@Injectable()
export class VehiclesService {
  constructor(private readonly vehiclesRepository: VehiclesRepository) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const normalizedPlate = createVehicleDto.plate.trim().toUpperCase();
    const existing = await this.vehiclesRepository.findByPlate(normalizedPlate, true);

    if (existing) {
      throw new ConflictException(`Ya existe un vehículo registrado con la placa ${normalizedPlate}`);
    }

    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      plate: normalizedPlate,
      status: createVehicleDto.status || VehicleStatus.AVAILABLE,
    });

    return this.vehiclesRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehiclesRepository.findAll();
  }

  async findById(id: number): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }
    return vehicle;
  }

  async findByPlate(plate: string): Promise<Vehicle> {
    const normalizedPlate = plate.trim().toUpperCase();
    const vehicle = await this.vehiclesRepository.findByPlate(normalizedPlate);
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con placa ${normalizedPlate} no encontrado`);
    }
    return vehicle;
  }

  async findByIdOrPlate(term: string): Promise<Vehicle> {
    const numericId = Number(term);
    if (!isNaN(numericId) && Number.isInteger(numericId)) {
      const byId = await this.vehiclesRepository.findById(numericId);
      if (byId) return byId;
    }

    return this.findByPlate(term);
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findById(id);

    if (updateVehicleDto.plate) {
      const normalizedPlate = updateVehicleDto.plate.trim().toUpperCase();
      if (normalizedPlate !== vehicle.plate) {
        const existing = await this.vehiclesRepository.findByPlate(normalizedPlate);
        if (existing) {
          throw new ConflictException(`La placa ${normalizedPlate} ya está en uso por otro vehículo`);
        }
        vehicle.plate = normalizedPlate;
      }
    }

    Object.assign(vehicle, updateVehicleDto);
    return this.vehiclesRepository.save(vehicle);
  }

  async remove(id: number): Promise<{ message: string }> {
    const vehicle = await this.findById(id);
    vehicle.status = VehicleStatus.INACTIVE;
    await this.vehiclesRepository.save(vehicle);
    await this.vehiclesRepository.softDelete(id);
    return { message: `Vehículo con ID ${id} inactivado y archivado lógicamente con éxito` };
  }
}
