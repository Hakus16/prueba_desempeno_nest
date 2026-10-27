import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Mechanic } from '../entities/mechanic.entity';
import { CreateMechanicDto } from '../dto/create-mechanic.dto';
import { UpdateMechanicDto } from '../dto/update-mechanic.dto';
import { MechanicsRepository } from '../repositories/mechanics.repository';
import { UsersRepository } from '../../users/repositories/users.repository';

/**
 * Capa de Lógica de Negocio / Servicio para Mecánicos.
 * Aplica las reglas del módulo de mecánicos y coordina con los repositorios.
 */
@Injectable()
export class MechanicsService {
  constructor(
    private readonly mechanicsRepository: MechanicsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createMechanicDto: CreateMechanicDto): Promise<Mechanic> {
    const existing = await this.mechanicsRepository.findByEmail(createMechanicDto.email);
    if (existing) {
      throw new ConflictException(`Ya existe un mecánico con el correo ${createMechanicDto.email}`);
    }

    let linkedUser = null;
    if (createMechanicDto.userId) {
      linkedUser = await this.usersRepository.findById(createMechanicDto.userId);
      if (!linkedUser) {
        throw new NotFoundException(`Usuario con ID ${createMechanicDto.userId} no encontrado para vincular al mecánico`);
      }
    }

    const mechanic = this.mechanicsRepository.create({
      name: createMechanicDto.name,
      email: createMechanicDto.email,
      specialty: createMechanicDto.specialty,
      isActive: createMechanicDto.isActive !== undefined ? createMechanicDto.isActive : true,
      user: linkedUser,
    });

    return this.mechanicsRepository.save(mechanic);
  }

  async findAll(): Promise<Mechanic[]> {
    return this.mechanicsRepository.findAll();
  }

  async findById(id: number): Promise<Mechanic> {
    const mechanic = await this.mechanicsRepository.findById(id);
    if (!mechanic) {
      throw new NotFoundException(`Mecánico con ID ${id} no encontrado`);
    }
    return mechanic;
  }

  async findByUserId(userId: number): Promise<Mechanic | null> {
    return this.mechanicsRepository.findByUserId(userId);
  }

  async update(id: number, updateMechanicDto: UpdateMechanicDto): Promise<Mechanic> {
    const mechanic = await this.findById(id);

    if (updateMechanicDto.email && updateMechanicDto.email !== mechanic.email) {
      const existing = await this.mechanicsRepository.findByEmail(updateMechanicDto.email);
      if (existing) {
        throw new ConflictException(`El correo ${updateMechanicDto.email} ya está registrado`);
      }
      mechanic.email = updateMechanicDto.email;
    }

    if (updateMechanicDto.userId !== undefined) {
      if (updateMechanicDto.userId === null) {
        mechanic.user = null;
      } else {
        const user = await this.usersRepository.findById(updateMechanicDto.userId);
        if (!user) {
          throw new NotFoundException(`Usuario con ID ${updateMechanicDto.userId} no encontrado`);
        }
        mechanic.user = user;
      }
    }

    if (updateMechanicDto.name) mechanic.name = updateMechanicDto.name;
    if (updateMechanicDto.specialty) mechanic.specialty = updateMechanicDto.specialty;
    if (updateMechanicDto.isActive !== undefined) mechanic.isActive = updateMechanicDto.isActive;

    return this.mechanicsRepository.save(mechanic);
  }

  async toggleActive(id: number, isActive: boolean): Promise<Mechanic> {
    const mechanic = await this.findById(id);
    mechanic.isActive = isActive;
    return this.mechanicsRepository.save(mechanic);
  }
}
