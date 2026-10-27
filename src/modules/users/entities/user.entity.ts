import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../common/constants/roles.enum';
import { Mechanic } from '../../mechanics/entities/mechanic.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.TECHNICIAN,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Mechanic, (mechanic) => mechanic.user, { nullable: true })
  mechanic: Mechanic;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
