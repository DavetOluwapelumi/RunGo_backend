import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonAuthService } from 'src/auth/auth.service.common';
import { DriverAuthController } from './controllers/driver.auth.controller';
import { DriverAuthService } from './services/driver.auth.service';
import { DriverProfileController } from './controllers/driver.profile.controller';
import { DriverService } from './services/drivers.service';
import Driver from 'src/entities/driver.entity';
import { DriversController } from './controllers/drivers.controller';
import { DriverProfileService } from './services/driver.profile.service';
@Module({
  providers: [
    DriverService,
    CommonAuthService,
    DriverAuthService,
    DriverProfileService,
  ],
  imports: [TypeOrmModule.forFeature([Driver])],
  controllers: [
    DriversController,
    DriverAuthController,
    DriverProfileController,
  ],
})
export class DriversModule {}
