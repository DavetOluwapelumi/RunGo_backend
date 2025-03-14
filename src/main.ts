import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';

import { DataSource } from 'typeorm';
import { dataSourceOptions } from './config/typeorm';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'debug', 'error'],
  });

  app.use(compression());
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
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
