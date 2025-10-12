/**
 * Email Logger Service for Development
 * Stores emails in memory for inspection during development
 */

import { randomBytes } from "crypto";

interface LoggedEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  sentAt: Date;
}

class EmailLoggerService {
  private emails: LoggedEmail[] = [];
  private maxEmails = 50; // Keep last 50 emails

  /**
   * Log an email (development only)
   */
  logEmail(to: string, subject: string, html: string, text: string): string {
    const id = `${Date.now()}-${randomBytes(6).toString("base64url")}`;

    const loggedEmail: LoggedEmail = {
      id,
      to,
      subject,
      html,
      text,
      sentAt: new Date(),
    };

    this.emails.unshift(loggedEmail);

    // Keep only last maxEmails
    if (this.emails.length > this.maxEmails) {
      this.emails = this.emails.slice(0, this.maxEmails);
    }

    return id;
  }

  /**
   * Get all logged emails
   */
  getAllEmails(): LoggedEmail[] {
    return this.emails;
  }

  /**
   * Get email by ID
   */
  getEmailById(id: string): LoggedEmail | undefined {
    return this.emails.find((email) => email.id === id);
  }

  /**
   * Clear all logged emails
   */
  clearAll(): void {
    this.emails = [];
  }

  /**
   * Get emails count
   */
  getCount(): number {
    return this.emails.length;
  }
}

export const emailLoggerService = new EmailLoggerService();
