import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonAuthService } from 'src/auth/auth.service.common';
import { Driver } from '../entities/driver.entity';
import { DriverAuthController } from './controllers/driver.auth.controller';
import { DriverController } from './controllers/driver.controller';
import { DriverService } from './services/driver.service';
import { DriverAuthService } from './services/driver.auth.service';
import { DriverProfileService } from './services/driver.profile.service';
import { DriverProfileController } from './controllers/driver.profile.controller';

@Module({
  providers: [
    DriverService,
    CommonAuthService,
    DriverAuthService,
    DriverProfileService,
  ],
  imports: [TypeOrmModule.forFeature([Driver])],
  controllers: [DriverController, DriverAuthController, DriverProfileController],
})
export class DriversModule {}
