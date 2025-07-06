import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './config/typeorm.config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'debug', 'error'],
  });

  app.use(compression());
  app.use(helmet());
  app.enableCors({
    origin: true, // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Serve static files from uploads directory with proper MIME types
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads'), {
    setHeaders: (res, path) => {
      // Set proper content type for images
      if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (path.endsWith('.webp')) {
        res.setHeader('Content-Type', 'image/webp');
      }
    }
  }));

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  await dataSource.runMigrations({
    transaction: 'all',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
