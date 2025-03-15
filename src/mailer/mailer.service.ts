import { Injectable } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

export interface EmailOptions {
  recipient: {
    name: string;
    emailAddress: string;
  };
  subject: string;
  template: EmailTemplate;
}

export enum EmailTemplate {
  Signup = 'jy7zpl9wk5p45vx6',
  Welcome = 'v',
  Forgottenpassword = ' vv',
}

@Injectable()
export class MailerService {
  private mailerSend = new MailerSend({
    apiKey: process.env.MAILER_SEND_API_TOKEN,
  });

  public async sendEmail(options: EmailOptions) {
    const recipients = [
      new Recipient(options.recipient.emailAddress, options.recipient.name),
    ];
    const replyTo = new Recipient(process.env.REPLAY_TO_EMAIL_ADDRESS, 'Admin');
    const sender = new Sender('admin@rungo.com', 'Run go');
    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo(recipients)
      .setReplyTo(replyTo)
      .setSubject(options.subject)
      //   .setTemplateId(options.template);
      .setHtml(
        'Greetings from the team, you got this message through MailerSend.',
      )
      .setText(
        'Greetings from the team, you got this message through MailerSend.',
      );

    await this.mailerSend.email.send(emailParams);
  }
}
