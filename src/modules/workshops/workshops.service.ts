import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from './entities/workshop.entity';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}

  async create(createWorkshopDto: CreateWorkshopDto): Promise<Workshop> {
    const workshop = this.workshopRepository.create({
      ...createWorkshopDto,
      isActive: createWorkshopDto.isActive !== undefined ? createWorkshopDto.isActive : true,
    });
    return this.workshopRepository.save(workshop);
  }

  async findAll(): Promise<Workshop[]> {
    return this.workshopRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findActive(): Promise<Workshop[]> {
    return this.workshopRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  async findById(id: number): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({
      where: { id },
      relations: ['maintenances'],
    });
    if (!workshop) {
      throw new NotFoundException(`Taller con ID ${id} no encontrado`);
    }
    return workshop;
  }

  async update(id: number, updateWorkshopDto: UpdateWorkshopDto): Promise<Workshop> {
    const workshop = await this.findById(id);
    Object.assign(workshop, updateWorkshopDto);
    return this.workshopRepository.save(workshop);
  }

  async toggleActive(id: number, isActive: boolean): Promise<Workshop> {
    const workshop = await this.findById(id);
    workshop.isActive = isActive;
    return this.workshopRepository.save(workshop);
  }
}
