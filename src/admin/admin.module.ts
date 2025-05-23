import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonAuthService } from 'src/auth/auth.service.common';
import { Admin } from '../entities/admin.entity';
import { AdminAuthController } from './controllers/admin.auth.controller';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AdminAuthService } from './services/admin.auth.service';
import { AdminProfileService } from './services/admin.profile.service';
import { AdminProfileController } from './controllers/admin.profile.controller';
import { AdminDriverService } from './services/adminDriver.service';
import { AdminDriverController } from './controllers/adminDriver.controller';
import Driver from 'src/entities/driver.entity';
import { DriversModule } from 'src/drivers/drivers.module';
import { AdminUserService } from './services/adminUser.service';
import { UserService } from '../users/services/users.service';
import User from '../entities/users.entity';
import { UserAdminController } from './controllers/adminUser.controller';
import { BookingModule } from '../booking/booking.module';
import { UsersModule } from '../users/users.module';
import Booking from 'src/entities/booking.entity';
import { CarModule } from 'src/car/car.module';
import { AdminCarService } from './services/adminCar.service';
import Car from 'src/entities/car.entity';
import { AdminCarController } from './controllers/adminCar.controller';

@Module({
  providers: [
    AdminService,
    CommonAuthService,
    AdminAuthService,
    AdminProfileService,
    AdminDriverService,
    UserService,
    AdminUserService,
    AdminCarService,
  ],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, Admin, Driver, Booking, Car]),
    BookingModule,
    DriversModule,
    CarModule,
  ],
  controllers: [
    AdminController,
    AdminAuthController,
    AdminProfileController,
    AdminDriverController,
    UserAdminController,
    AdminCarController,
  ],
  exports: [AdminUserService, UserService],
})
export class AdminModule { }
