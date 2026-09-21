/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so your Vercel frontend can call this backend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4200',
      /\.vercel\.app$/, // Allows all your Vercel preview & production deployments
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
