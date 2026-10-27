import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedService } from './seed.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.runSeed();
    console.log('Seed ejecutado satisfactoriamente');
  } catch (error) {
    console.error('Error al ejecutar seed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

run();
