import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';

/**
 * Capa de Acceso a Datos (Repositorio) para Talleres.
 * Encapsula la interacción con la base de datos para la entidad Workshop.
 */
@Injectable()
export class WorkshopsRepository {
  constructor(
    @InjectRepository(Workshop)
    private readonly repository: Repository<Workshop>,
  ) {}

  create(workshopData: Partial<Workshop>): Workshop {
    return this.repository.create(workshopData);
  }

  async save(workshop: Workshop): Promise<Workshop> {
    return this.repository.save(workshop);
  }

  async findAll(): Promise<Workshop[]> {
    return this.repository.find({
      order: { id: 'ASC' },
    });
  }

  async findActive(): Promise<Workshop[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Workshop | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['maintenances'],
    });
  }
}
