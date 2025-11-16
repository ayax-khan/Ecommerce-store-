import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    this.from = process.env.SMTP_FROM || 'Buy2Enjoy <no-reply@buy2enjoy.local>';

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
    }
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      // Fallback: log to console in dev
      // eslint-disable-next-line no-console
      console.log(`EMAIL (dev fallback) to=${to} subject=${subject}\n${html}`);
      return;
    }
    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/verify-email?token=${token}`;
    const html = `<p>Hi,</p><p>Please verify your Buy2Enjoy account by clicking the link below:</p><p><a href="${url}">${url}</a></p><p>If you did not sign up, you can ignore this email.</p>`;
    await this.send(email, 'Verify your Buy2Enjoy account', html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `http://localhost:3000/reset-password?token=${token}`;
    const html = `<p>Hi,</p><p>You requested to reset your Buy2Enjoy password. Click the link below to reset it:</p><p><a href="${url}">${url}</a></p><p>If you did not request this, you can ignore this email.</p>`;
    await this.send(email, 'Reset your Buy2Enjoy password', html);
  }
}