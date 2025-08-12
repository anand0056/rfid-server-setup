import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  console.log({
    DB_HOST: configService.get<string>('DB_HOST') || 'localhost',
    DB_USER: configService.get<string>('DB_USER') || 'root',
    DB_PASSWORD: configService.get<string>('DB_PASSWORD') || '',
    DB_NAME: configService.get<string>('DB_NAME') || 'rfid_db',
  });

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://frontend:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 5000;
  await app.listen(port);
  console.log(`🚀 Backend API running on port ${port}`);
}
void bootstrap();
