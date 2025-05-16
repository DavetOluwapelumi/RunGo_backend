import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from './config/typeorm.config';
import { ValidationPipe, VersioningType } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'debug', 'error'],
  });

  app.use(compression());
  app.use(helmet());
  app.enableCors();
  app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  await dataSource.runMigrations({
    transaction: 'all',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
