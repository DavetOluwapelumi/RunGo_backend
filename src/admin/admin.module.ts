import { Module } from '@nestjs/common';
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

@Module({
  providers: [
    AdminService,
    CommonAuthService,
    AdminAuthService,
    AdminProfileService,
    AdminDriverService,

  ],
  imports: [TypeOrmModule.forFeature([Admin]), TypeOrmModule.forFeature([Driver]), DriversModule],
  controllers: [AdminController, AdminAuthController, AdminProfileController, AdminDriverController],
})
export class AdminModule { }
