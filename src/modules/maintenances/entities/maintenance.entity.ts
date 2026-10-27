import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaintenanceStatus } from '../../../common/constants/maintenance-status.enum';
import { MaintenanceType } from '../../../common/constants/maintenance-type.enum';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Mechanic } from '../../mechanics/entities/mechanic.entity';
import { Workshop } from '../../workshops/entities/workshop.entity';

@Entity('maintenances')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @Column()
  description: string;

  @Column({ type: 'int' })
  initialMileage: number;

  @Column({ type: 'timestamp with time zone' })
  scheduledDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  estimatedEndDate: Date | null;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.maintenances, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @ManyToOne(() => Mechanic, (mechanic) => mechanic.maintenances, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'mechanic_id' })
  mechanic: Mechanic;

  @ManyToOne(() => Workshop, (workshop) => workshop.maintenances, { eager: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'workshop_id' })
  workshop: Workshop;

  // Campos de cierre (Requeridos para estado COMPLETED)
  @Column({ type: 'text', nullable: true })
  workDone: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  finalCost: number | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  finalMileage: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
