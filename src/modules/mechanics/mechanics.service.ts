import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mechanic } from './entities/mechanic.entity';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(Mechanic)
    private readonly mechanicRepository: Repository<Mechanic>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createMechanicDto: CreateMechanicDto): Promise<Mechanic> {
    const existing = await this.mechanicRepository.findOne({
      where: { email: createMechanicDto.email },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un mecánico con el correo ${createMechanicDto.email}`);
    }

    let linkedUser: User | null = null;
    if (createMechanicDto.userId) {
      linkedUser = await this.userRepository.findOne({ where: { id: createMechanicDto.userId } });
      if (!linkedUser) {
        throw new NotFoundException(`Usuario con ID ${createMechanicDto.userId} no encontrado para vincular al mecánico`);
      }
    }

    const mechanic = this.mechanicRepository.create({
      name: createMechanicDto.name,
      email: createMechanicDto.email,
      specialty: createMechanicDto.specialty,
      isActive: createMechanicDto.isActive !== undefined ? createMechanicDto.isActive : true,
      user: linkedUser,
    });

    return this.mechanicRepository.save(mechanic);
  }

  async findAll(): Promise<Mechanic[]> {
    return this.mechanicRepository.find({
      relations: ['user'],
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Mechanic> {
    const mechanic = await this.mechanicRepository.findOne({
      where: { id },
      relations: ['user', 'maintenances'],
    });
    if (!mechanic) {
      throw new NotFoundException(`Mecánico con ID ${id} no encontrado`);
    }
    return mechanic;
  }

  async findByUserId(userId: number): Promise<Mechanic | null> {
    return this.mechanicRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async update(id: number, updateMechanicDto: UpdateMechanicDto): Promise<Mechanic> {
    const mechanic = await this.findById(id);

    if (updateMechanicDto.email && updateMechanicDto.email !== mechanic.email) {
      const existing = await this.mechanicRepository.findOne({
        where: { email: updateMechanicDto.email },
      });
      if (existing) {
        throw new ConflictException(`El correo ${updateMechanicDto.email} ya está registrado`);
      }
      mechanic.email = updateMechanicDto.email;
    }

    if (updateMechanicDto.userId !== undefined) {
      if (updateMechanicDto.userId === null) {
        mechanic.user = null;
      } else {
        const user = await this.userRepository.findOne({ where: { id: updateMechanicDto.userId } });
        if (!user) {
          throw new NotFoundException(`Usuario con ID ${updateMechanicDto.userId} no encontrado`);
        }
        mechanic.user = user;
      }
    }

    if (updateMechanicDto.name) mechanic.name = updateMechanicDto.name;
    if (updateMechanicDto.specialty) mechanic.specialty = updateMechanicDto.specialty;
    if (updateMechanicDto.isActive !== undefined) mechanic.isActive = updateMechanicDto.isActive;

    return this.mechanicRepository.save(mechanic);
  }

  async toggleActive(id: number, isActive: boolean): Promise<Mechanic> {
    const mechanic = await this.findById(id);
    mechanic.isActive = isActive;
    return this.mechanicRepository.save(mechanic);
  }
}
