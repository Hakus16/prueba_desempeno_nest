import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Prefijo global de rutas (opcional, pero limpio)
  app.setGlobalPrefix('api');

  // Habilitar validaciones automáticas con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('FleetCore API - Gestión de Mantenimiento de Flota')
    .setDescription(
      'Documentación interactiva de la API REST para el control de mantenimientos, vehículos, mecánicos y talleres.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu JWT token',
        in: 'header',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key para integraciones externas',
      },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Habilitar CORS
  app.enableCors();

  await app.listen(port);
  logger.log(` Servidor FleetCore escuchando en: http://localhost:${port}/api`);
  logger.log(` Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
