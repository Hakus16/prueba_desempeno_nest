import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Mechanic } from '../modules/mechanics/entities/mechanic.entity';
import { Workshop } from '../modules/workshops/entities/workshop.entity';
import { Maintenance } from '../modules/maintenances/entities/maintenance.entity';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_NAME', 'fleetcore'),
  entities: [User, Vehicle, Mechanic, Workshop, Maintenance],
  synchronize: true, // Para el entorno de evaluación y pruebas
  logging: false,
});
