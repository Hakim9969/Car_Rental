import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule], // ensures environment config is accessible
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
