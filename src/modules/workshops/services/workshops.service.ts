import { Injectable, NotFoundException } from '@nestjs/common';
import { Workshop } from '../entities/workshop.entity';
import { CreateWorkshopDto } from '../dto/create-workshop.dto';
import { UpdateWorkshopDto } from '../dto/update-workshop.dto';
import { WorkshopsRepository } from '../repositories/workshops.repository';

/**
 * Capa de Lógica de Negocio / Servicio para Talleres.
 * Aplica las reglas del módulo de talleres y delega la persistencia.
 */
@Injectable()
export class WorkshopsService {
  constructor(private readonly workshopsRepository: WorkshopsRepository) {}

  async create(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    const workshop = this.workshopsRepository.create({
      ...createWorkshopDto,
      isActive: createWorkshopDto.isActive !== undefined ? createWorkshopDto.isActive : true,
    });
    return this.workshopsRepository.save(workshop);
  }

  async findAll(): Promise<Workshop[]> {
    return this.workshopsRepository.findAll();
  }

  async findActive(): Promise<Workshop[]> {
    return this.workshopsRepository.findActive();
  }

  async findById(id: number): Promise<Workshop> {
    const workshop = await this.workshopsRepository.findById(id);
    if (!workshop) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }
    return workshop;
  }

  async update(id: number, updateWorkshopDto: UpdateWorkshopDto): Promise<Workshop> {
    const workshop = await this.findById(id);
    Object.assign(workshop, updateWorkshopDto);
    return this.workshopsRepository.save(workshop);
  }

  async toggleActive(id: number, isActive: boolean): Promise<Workshop> {
    const workshop = await this.findById(id);
    workshop.isActive = isActive;
    return this.workshopsRepository.save(workshop);
  }
}
