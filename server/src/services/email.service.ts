import nodemailer from "nodemailer";

import { env } from "../config/env.js";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(email: string, name: string, verificationUrl: string): Promise<void> {
    const template = this.getEmailVerificationTemplate(name, verificationUrl);

    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, name: string, resetUrl: string): Promise<void> {
    const template = this.getPasswordResetTemplate(name, resetUrl);

    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const template = this.getWelcomeTemplate(name);

    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send password change notification
   */
  async sendPasswordChangeNotification(email: string, name: string): Promise<void> {
    const template = this.getPasswordChangeTemplate(name);

    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send generic email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: options.from || `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.warn("Email sent successfully:", result.messageId);
    } catch (error) {
      console.error("Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  /**
   * Verify email service connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.warn("Email service connection verified");
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }

  /**
   * Get email verification template
   */
  private getEmailVerificationTemplate(name: string, verificationUrl: string): EmailTemplate {
    const subject = "Verify Your Email - Quiz Platform";

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Quiz Platform!</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Thank you for signing up for Quiz Platform. To complete your registration and start practicing with our interview questions, please verify your email address.</p>
          
          <p>Click the button below to verify your email:</p>
          
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${verificationUrl}</p>
          
          <p><strong>This link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with Quiz Platform, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 Quiz Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Quiz Platform!
      
      Hi ${name},
      
      Thank you for signing up for Quiz Platform. To complete your registration and start practicing with our interview questions, please verify your email address.
      
      Click the link below to verify your email:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with Quiz Platform, you can safely ignore this email.
      
      © 2024 Quiz Platform. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Get password reset template
   */
  private getPasswordResetTemplate(name: string, resetUrl: string): EmailTemplate {
    const subject = "Reset Your Password - Quiz Platform";

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password for your Quiz Platform account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
          
          <p><strong>This link will expire in 1 hour.</strong></p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© 2024 Quiz Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request
      
      Hi ${name},
      
      We received a request to reset your password for your Quiz Platform account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      
      © 2024 Quiz Platform. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Get welcome template
   */
  private getWelcomeTemplate(name: string): EmailTemplate {
    const subject = "Welcome to Quiz Platform!";

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Quiz Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Quiz Platform!</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Congratulations! Your email has been verified and your Quiz Platform account is now active.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Practice with our comprehensive interview questions</li>
            <li>Track your progress and improve your skills</li>
            <li>Access questions for Angular, React, Next.js, and Redux</li>
            <li>Compete with other developers</li>
          </ul>
          
          <a href="${env.CLIENT_URL}" class="button">Start Practicing</a>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
        </div>
        <div class="footer">
          <p>© 2024 Quiz Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Quiz Platform!
      
      Hi ${name},
      
      Congratulations! Your email has been verified and your Quiz Platform account is now active.
      
      You can now:
      - Practice with our comprehensive interview questions
      - Track your progress and improve your skills
      - Access questions for Angular, React, Next.js, and Redux
      - Compete with other developers
      
      Visit ${env.CLIENT_URL} to start practicing.
      
      If you have any questions or need help getting started, don't hesitate to reach out to our support team.
      
      © 2024 Quiz Platform. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Get password change notification template
   */
  private getPasswordChangeTemplate(name: string): EmailTemplate {
    const subject = "Password Changed - Quiz Platform";

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Changed</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>Your Quiz Platform account password has been successfully changed.</p>
          
          <p><strong>Security Information:</strong></p>
          <ul>
            <li>Date: ${new Date().toLocaleDateString()}</li>
            <li>Time: ${new Date().toLocaleTimeString()}</li>
          </ul>
          
          <p>If you made this change, no further action is required.</p>
          
          <p>If you did not change your password, please contact our support team immediately as your account may have been compromised.</p>
        </div>
        <div class="footer">
          <p>© 2024 Quiz Platform. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Changed
      
      Hi ${name},
      
      Your Quiz Platform account password has been successfully changed.
      
      Security Information:
      - Date: ${new Date().toLocaleDateString()}
      - Time: ${new Date().toLocaleTimeString()}
      
      If you made this change, no further action is required.
      
      If you did not change your password, please contact our support team immediately as your account may have been compromised.
      
      © 2024 Quiz Platform. All rights reserved.
    `;

    return { subject, html, text };
  }
}

// Export singleton instance
export const emailService = new EmailService();
