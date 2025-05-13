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

@Module({
  providers: [
    AdminService,
    CommonAuthService,
    AdminAuthService,
    AdminProfileService,
    AdminDriverService, UserService, AdminUserService
  ],
  imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Admin]), TypeOrmModule.forFeature([Driver]), BookingModule, DriversModule],
  controllers: [AdminController, AdminAuthController, AdminProfileController, AdminDriverController, UserAdminController],
  exports: [AdminUserService, UserService],
})

export class AdminModule { }
