import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { config } from 'dotenv';

export const mailerConfig: MailerOptions = {
  transport: "smtp://'':''@mailtutan",
  defaults: {
    from: '"Run.go" <admin@run.go>',
    host: process.env.SMTP_HOST,
    port: 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  template: {
    dir: __dirname + '/templates',
    adapter: new EjsAdapter(),
    options: {
      strict: true,
    },
  },
};
config();
