import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// Import all entities explicitly
import User from '../entities/users.entity';
import { TempUserRegistration } from '../entities/tempUserRegistration.entity';
import { EmailVerification } from '../entities/emailVerification.entity';
import { PasswordResetOtpEntity } from '../entities/passwordResetOtp.entity';
import Driver from '../entities/driver.entity';
import { RideRequest } from '../entities/rideRequest.entity';
import Booking from '../entities/booking.entity';
import Payment from '../entities/payment.entity';
import Car from '../entities/car.entity';
import { OtpEntity } from '../entities/otp.entity';
import { Admin } from '../entities/admin.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletTransaction } from '../entities/walletTransaction.entity';
import { Location } from '../entities/location.entity';
import { LocationPricing } from '../entities/locationPricing.entity';
import { TempDriverRegistration } from '../entities/tempDriverRegistration.entity';

dotenvConfig({ path: '.env' });

// Debug: Log the BACKEND_URL to see if it's being read correctly
console.log('DEBUG - BACKEND_URL from env:', process.env.BACKEND_URL);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: `${process.env.DATABASE_HOST}`,
  port: Number(process.env.DATABASE_PORT),
  url: `${process.env.DATABASE_URL}`,
  username: `${process.env.DATABASE_USERNAME}`,
  password: `${process.env.DATABASE_PASSWORD}`,
  database: `${process.env.DATABASE_NAME}`,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    TempUserRegistration,
    EmailVerification,
    PasswordResetOtpEntity,
    Driver,
    RideRequest,
    Booking,
    Payment,
    Car,
    OtpEntity,
    Admin,
    Wallet,
    WalletTransaction,
    Location,
    LocationPricing,
    TempDriverRegistration,
  ],
  migrations: ['dist/migrations/*{.ts,.js}'],
  logging: true,
  synchronize: false,
};

export default registerAs('typeorm', () => dataSourceOptions);
export const connectionSource = new DataSource(dataSourceOptions);
