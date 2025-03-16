import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';
import { join } from 'node:path';

export interface EmailOptions {
  recipient: {
    name: string;
    emailAddress: string;
  };
  subject: string;
  template: EmailTemplate;
  data: any;
}

export enum EmailTemplate {
  Signup = 'signup',
  Welcome = 'welcome',
  Forgottenpassword = 'password',
}

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethyl.berge35@ethereal.email',
      pass: 'qjY5jCu1ABmXnNZwzC',
    },
  });

  private ejs = ejs;
  private readonly TEMPLATES_BASE_DIR = join(__dirname, '../templates');

  public async sendEmail(options: EmailOptions) {
    const content = await this.renderTemplate(options.template, options.data);
    const info = await this.transporter.sendMail({
      from: '"Rungo" <admin@rungo.app>',
      to: `${options.recipient.emailAddress}`,
      subject: options.subject,
      html: content,
    });

    //TODO: use logger
    console.log('Message sent: %s', info.messageId);
  }

  private async renderTemplate(template: EmailTemplate, data: any) {
    try {
      const filePath = `${this.TEMPLATES_BASE_DIR}/${template}.ejs`;
      const htmlOutput = await ejs.renderFile(filePath, { ...data }, null);
      return htmlOutput;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
