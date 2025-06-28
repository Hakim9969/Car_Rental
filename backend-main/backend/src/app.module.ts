import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { BookingModule } from './booking/booking.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule, UserModule, VehicleModule, BookingModule, ConfigModule.forRoot({ isGlobal: true }), ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
