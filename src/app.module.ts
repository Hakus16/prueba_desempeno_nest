import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { getTypeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { MechanicsModule } from './modules/mechanics/mechanics.module';
import { WorkshopsModule } from './modules/workshops/workshops.module';
import { MaintenancesModule } from './modules/maintenances/maintenances.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SeedService } from './database/seeds/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    MechanicsModule,
    WorkshopsModule,
    MaintenancesModule,
    IntegrationsModule,
  ],
  providers: [
    SeedService,
    // Protección global JWT por defecto (excepto endpoints marcados con @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Validación global de roles mediante @Roles(...)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Formato estándar uniforme de respuestas exitosas
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Formato estándar uniforme de excepciones y captura de errores DB
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
