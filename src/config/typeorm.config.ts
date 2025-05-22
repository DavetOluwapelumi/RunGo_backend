import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';


dotenvConfig({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: `${process.env.DATABASE_HOST}`,
  port: Number(process.env.DATABASE_PORT),
  url: `${process.env.DATABASE_URL}`,
  username: `${process.env.DATABASE_USERNAME}`,
  password: `${process.env.DATABASE_PASSWORD}`,
  database: `${process.env.DATABASE_NAME}`,
  ssl: process.env.DATABASE_SSL === 'true',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  logging: true,
  synchronize: true,
};

export default registerAs('typeorm', () => dataSourceOptions);
export const connectionSource = new DataSource(dataSourceOptions);
