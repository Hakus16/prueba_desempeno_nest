import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mechanic } from './entities/mechanic.entity';
import { MechanicsService } from './mechanics.service';
import { MechanicsController } from './mechanics.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mechanic]), UsersModule],
  controllers: [MechanicsController],
  providers: [MechanicsService],
  exports: [MechanicsService, TypeOrmModule],
})
export class MechanicsModule {}
