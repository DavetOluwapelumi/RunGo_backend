import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './config/typeorm.config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { Request as ExpressRequestType } from 'express';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'debug', 'error'],
  });

  app.use(compression());
  app.use(helmet());
  app.enableCors({
    origin: 'http://localhost:3000', // <-- your frontend origin
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true, // if you use cookies or need credentials
  });
  app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use('/uploads', (req, res, next) => {
    const allowedOrigin = req.headers.origin || '';
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Serve static files from uploads directory with proper MIME types
  app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'uploads'), {
      setHeaders: (res, path, stat) => {
        const allowedOrigin = res.req.headers.origin || '';
        console.log('Allowed origin:', allowedOrigin);
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        if (res.req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
        // Optionally, set content-type for images
        if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.gif')) {
          res.setHeader('Content-Type', 'image/gif');
        } else if (path.endsWith('.webp')) {
          res.setHeader('Content-Type', 'image/webp');
        }
      },
    })
  );

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  await dataSource.runMigrations({
    transaction: 'all',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
