import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // 1. Enable Global Prefix (/api)
  app.setGlobalPrefix('api');

  // 2. Enable automatic DTO validation & strip unknown fields
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 3. Enable CORS for Vercel and local frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4200', /\.vercel\.app$/],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Core API is running on: http://localhost:${port}/api`);
}

bootstrap();