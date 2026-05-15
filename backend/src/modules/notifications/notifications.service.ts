import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { generateVerificationEmail } from './templates/verification.template';
import { generateOrderConfirmationEmail } from './templates/order-confirmation.template';
import { generateRefundEmail } from './templates/refund.template';
import { generateEventReminderEmail } from './templates/event-reminder.template';
import { generatePasswordResetEmail } from './templates/password-reset.template';
import { generateFavoriteAlertEmail } from './templates/favorite-alert.template';
import { generateTransferInviteEmail } from './templates/transfer-invite.template';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.fromEmail = this.config.get<string>('EMAIL_FROM') ?? '';
    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${this.config.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Verify your VeriTix account',
        html: generateVerificationEmail(name, verificationUrl),
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendOrderConfirmation(
    to: string,
    name: string,
    orderId: string,
    eventName: string,
    totalAmount: number,
    ticketCount: number,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Order confirmed — ${eventName}`,
        html: generateOrderConfirmationEmail(name, orderId, eventName, totalAmount, ticketCount),
      });
    } catch (error) {
      this.logger.error(`Failed to send order confirmation to ${to} for order ${orderId}`, error);
    }
  }

  async sendRefundNotification(
    to: string,
    name: string,
    orderId: string,
    eventName: string,
    amount: number,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Refund processed — ${eventName}`,
        html: generateRefundEmail(name, orderId, eventName, amount),
      });
    } catch (error) {
      this.logger.error(`Failed to send refund notification to ${to} for order ${orderId}`, error);
    }
  }

  async sendEventReminder(
    to: string,
    name: string,
    eventName: string,
    eventDate: Date,
    venueName: string,
    daysLeft: number,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Reminder: ${eventName} is coming up!`,
        html: generateEventReminderEmail(name, eventName, eventDate, venueName, daysLeft),
      });
    } catch (error) {
      this.logger.error(`Failed to send event reminder to ${to} for event "${eventName}"`, error);
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const resetUrl = `${this.config.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Reset your VeriTix password',
        html: generatePasswordResetEmail(name, resetUrl),
      });
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }

  async sendFavoriteAlert(params: {
    to: string;
    userName: string;
    eventName: string;
    alertType: 'SELLING_OUT' | 'NEW_TICKET_TYPE';
    eventUrl: string;
  }): Promise<void> {
    const { to, userName, eventName, alertType, eventUrl } = params;
    const subject =
      alertType === 'SELLING_OUT'
        ? `${eventName} is almost sold out — act fast!`
        : `New ticket type available for ${eventName}`;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html: generateFavoriteAlertEmail({ userName, eventName, alertType, eventUrl }),
      });
    } catch (error) {
      this.logger.error(`Failed to send favorite alert to ${to} for event "${eventName}"`, error);
    }
  }

  async sendTransferInvite(params: {
    to: string;
    senderName: string;
    eventName: string;
    eventDate: string;
    acceptUrl: string;
    isNewUser: boolean;
  }): Promise<void> {
    const { to, senderName, eventName, eventDate, acceptUrl, isNewUser } = params;
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `${senderName} sent you a ticket for ${eventName}`,
        html: generateTransferInviteEmail({ senderName, eventName, eventDate, acceptUrl, isNewUser }),
      });
    } catch (error) {
      this.logger.error(`Failed to send transfer invite to ${to} for event "${eventName}"`, error);
    }
  }
}
