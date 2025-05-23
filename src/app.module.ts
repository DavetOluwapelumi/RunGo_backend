import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DriversModule } from './drivers/drivers.module';
import { AdminModule } from './admin/admin.module';
import { PaymentModule } from './payment/payment.module';
import { BookingModule } from './booking/booking.module';
import { CarModule } from './car/car.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { StatsModule } from './stats/stats.module';
import { OtpModule } from './otp/otp.module';
import { DriverGatewayGateway } from './driver_gateway/driver_gateway.gateway';
import { DriverGatewayModule } from './driver_gateway/driver_gateway.module';
import typeorm from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.getOrThrow('typeorm');
        return config;
      },
    }),
    MailerModule.forRoot({
      transport: "smtp://'':''@mailtutan",
      defaults: {
        from: '"Run.go" <admin@run.go>',
        host: 'mailtutan',
        port: 1025,
        auth: {
          user: '',
          pass: '',
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    UsersModule,
    DriversModule,
    AdminModule,
    PaymentModule,
    BookingModule,
    CarModule,
    StatsModule,
    OtpModule,
    DriverGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService, DriverGatewayGateway],
})
export class AppModule { }
