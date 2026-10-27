import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mechanic } from '../entities/mechanic.entity';

/**
 * Capa de Acceso a Datos (Repositorio) para Mecánicos.
 * Encapsula la interacción con la base de datos para la entidad Mechanic.
 */
@Injectable()
export class MechanicsRepository {
  constructor(
    @InjectRepository(Mechanic)
    private readonly repository: Repository<Mechanic>,
  ) {}

  create(mechanicData: Partial<Mechanic>): Mechanic {
    return this.repository.create(mechanicData);
  }

  async save(mechanic: Mechanic): Promise<Mechanic> {
    return this.repository.save(mechanic);
  }

  async findAll(): Promise<Mechanic[]> {
    return this.repository.find({
      relations: ['user'],
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Mechanic | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'maintenances'],
    });
  }

  async findByEmail(email: string): Promise<Mechanic | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  async findByUserId(userId: number): Promise<Mechanic | null> {
    return this.repository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }
}
