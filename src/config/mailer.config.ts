import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { registerAs } from '@nestjs/config';

export const mailerConfig: MailerOptions = {
  transport: process.env.SMTP_TRANSPORT,
  defaults: {
    from: '"Run.go" <admin@run.go>',
  },
  template: {
    dir: __dirname + '/templates',
    // adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};

export default registerAs('mailer', () => mailerConfig);
