import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity';
import { WorkshopsRepository } from './repositories/workshops.repository';
import { WorkshopsService } from './services/workshops.service';
import { WorkshopsController } from './workshops.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop])],
  controllers: [WorkshopsController],
  providers: [WorkshopsRepository, WorkshopsService],
  exports: [WorkshopsRepository, WorkshopsService, TypeOrmModule],
})
export class WorkshopsModule {}
