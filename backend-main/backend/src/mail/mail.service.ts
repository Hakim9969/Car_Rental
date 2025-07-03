import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import * as fs from 'fs';

export interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private templatesPath: string;

  constructor(private readonly configService: ConfigService) {
    this.templatesPath = path.join(process.cwd(), 'src/mail/templates/email');
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get<string>('MAIL_PORT', '587')),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    this.transporter = nodemailer.createTransport(smtpConfig, {
  logger: true,
  debug: true,
});

    this.logger.log('Mailer transporter initialized');
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;

      if (options.template && options.context) {
        html = await this.renderTemplate(options.template, options.context);
      }

      const mailOptions = {
        from: this.configService.get<string>('MAIL_FROM'),
        to: options.to,
        subject: options.subject,
        html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${options.to}: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
    }
  }

  private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template "${templateName}" not found at ${templatePath}`);
    }

    return ejs.renderFile(templatePath, context, { async: true });
  }

  async sendWelcomeEmailToUser({ name, email }: { name: string; email: string }) {
  await this.sendEmail({
    to: email,
    subject: 'Welcome to Our Car Rental Platform!',
    template: 'welcome-user', // e.g. views/welcome-user.hbs or .ejs
    context: {
      name,
    },
  });
}

  async sendAdminOnUserRegister(user: {
  name: string;
  email: string;
  role: string;
  phone?: string;
}) {
  const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
  if (!adminEmail) {
    this.logger.warn('Admin email not configured');
    return;
  }

  await this.sendEmail({
    to: adminEmail,
    subject: 'New User Registration',
    template: 'admin-user-registered',
    context: {
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || 'N/A',
    },
  });
}

}
