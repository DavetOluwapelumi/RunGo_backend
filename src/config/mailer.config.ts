import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { config } from 'dotenv';
import * as path from 'path';

config();

const smtpConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // Use TLS instead of SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
};

const templateDir = path.join(__dirname, '../../template');

console.log('==== [Mailer Config Debug] ====');
console.log('SMTP_HOST:', smtpConfig.host);
console.log('SMTP_PORT:', smtpConfig.port);
console.log('SMTP_USER:', smtpConfig.auth.user);
console.log('SMTP_PASSWORD:', smtpConfig.auth.pass ? '***SET***' : 'NOT SET');
console.log('Template dir:', templateDir);
console.log('Template dir exists:', require('fs').existsSync(templateDir));
console.log('===============================');

export const mailerConfig: MailerOptions = {
  transport: smtpConfig,
  defaults: {
    from: `"Run.go" <${process.env.SMTP_USER || 'admin@run.go'}>`,
  },
  template: {
    dir: templateDir,
    adapter: new EjsAdapter(),
    options: {
      strict: false, // Changed from true to false to be more lenient
    },
  },
};
