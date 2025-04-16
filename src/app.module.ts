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
import typeorm from './config/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.getOrThrow('typeorm')
        console.log('config', config)
        return config

      }
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
