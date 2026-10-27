import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mechanic } from './entities/mechanic.entity';
import { MechanicsRepository } from './repositories/mechanics.repository';
import { MechanicsService } from './services/mechanics.service';
import { MechanicsController } from './mechanics.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mechanic]), UsersModule],
  controllers: [MechanicsController],
  providers: [MechanicsRepository, MechanicsService],
  exports: [MechanicsRepository, MechanicsService, TypeOrmModule],
})
export class MechanicsModule {}
