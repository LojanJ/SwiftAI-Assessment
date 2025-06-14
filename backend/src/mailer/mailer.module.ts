/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { AppMailerService } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
        defaults: {
          from: '"BuddyBase" <no-reply@buddybase.com>',
        },
      }),
    }),
  ],
  providers: [AppMailerService],
  exports: [MailerModule, AppMailerService],
})
export class AppMailerModule {}
