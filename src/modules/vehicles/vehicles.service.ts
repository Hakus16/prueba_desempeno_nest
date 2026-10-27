import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus } from '../../common/constants/vehicle-status.enum';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const normalizedPlate = createVehicleDto.plate.trim().toUpperCase();
    const existing = await this.vehicleRepository.findOne({
      where: { plate: normalizedPlate },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Ya existe un vehículo registrado con la placa ${normalizedPlate}`);
    }

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      plate: normalizedPlate,
      status: createVehicleDto.status || VehicleStatus.AVAILABLE,
    });

    return this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['maintenances'],
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con ID ${id} no encontrado`);
    }
    return vehicle;
  }

  async findByPlate(plate: string): Promise<Vehicle> {
    const normalizedPlate = plate.trim().toUpperCase();
    const vehicle = await this.vehicleRepository.findOne({
      where: { plate: normalizedPlate },
      relations: ['maintenances'],
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehículo con placa ${normalizedPlate} no encontrado`);
    }
    return vehicle;
  }

  async findByIdOrPlate(term: string): Promise<Vehicle> {
    const numericId = Number(term);
    if (!isNaN(numericId) && Number.isInteger(numericId)) {
      const byId = await this.vehicleRepository.findOne({
        where: { id: numericId },
        relations: ['maintenances'],
      });
      if (byId) return byId;
    }

    return this.findByPlate(term);
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findById(id);

    if (updateVehicleDto.plate) {
      const normalizedPlate = updateVehicleDto.plate.trim().toUpperCase();
      if (normalizedPlate !== vehicle.plate) {
        const existing = await this.vehicleRepository.findOne({
          where: { plate: normalizedPlate },
        });
        if (existing) {
          throw new ConflictException(`La placa ${normalizedPlate} ya está en uso por otro vehículo`);
        }
        vehicle.plate = normalizedPlate;
      }
    }

    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: number): Promise<{ message: string }> {
    const vehicle = await this.findById(id);
    vehicle.status = VehicleStatus.INACTIVE;
    await this.vehicleRepository.save(vehicle);
    await this.vehicleRepository.softDelete(id);
    return { message: `Vehículo con ID ${id} inactivado y archivado lógicamente con éxito` };
  }
}
