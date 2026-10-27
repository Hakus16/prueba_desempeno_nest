import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

/**
 * Capa de Acceso a Datos (Repositorio) para la entidad User.
 * Encapsula todas las operaciones de persistencia y consultas a PostgreSQL.
 */
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const qb = this.repository.createQueryBuilder('user').where('user.email = :email', { email });
    if (includePassword) {
      qb.addSelect('user.password');
    }
    return qb.getOne();
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['mechanic'],
    });
  }

  create(userData: Partial<User>): User {
    return this.repository.create(userData);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
