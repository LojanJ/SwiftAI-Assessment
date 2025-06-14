import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AppMailerService {
  constructor(private readonly mailerService: MailerService) {}

  async sendContactCreated(
    email: string,
    subject: string,
    text: string,
    html: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      html: `<p>${text}</p>\n` + html,
    });
  }
}
