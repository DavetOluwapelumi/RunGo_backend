import { Module } from '@nestjs/common';
import { UserService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UserAuthController} from './controllers/user.auth.controller';
import { UserAuthService } from './services/user.auth.service';
import User from '../entities/users.entity';
import { AuthModule } from '../auth/auth.module';
@Module({
  providers: [UserService, UserAuthService],
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UsersController, UserAuthController],
})
export class UsersModule {}
