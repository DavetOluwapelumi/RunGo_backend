import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { config } from 'dotenv';

export const mailerConfig: MailerOptions = {
  transport: "smtp://'':''@mailtutan",
  defaults: {
    from: '"Run.go" <admin@run.go>',
    host: 'http://smtp.gmail.com',
    port: 465,
    auth: {
      user: '',
      pass: '',
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
