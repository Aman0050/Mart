import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend | null = null;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const resendKey = this.configService.get<string>('RESEND_API_KEY') || process.env.RESEND_API_KEY;
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'no-reply@nexmarto.com';

    if (resendKey && resendKey !== 'placeholder_key') {
      this.resend = new Resend(resendKey);
      this.logger.log('Resend initialized.');
    } else {
      this.logger.warn('RESEND_API_KEY is not set or is placeholder. Emails will be logged to console instead of sent.');
    }
  }

  // --- Phase 3: Robust Retry Logic ---
  private async withRetry<T>(operation: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
    let lastError: any;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Email send attempt ${attempt} failed: ${error.message}`);
        // If it's a 4xx error (except 429), don't retry.
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
    this.logger.error('All email retry attempts failed.');
    throw new InternalServerErrorException('Failed to deliver email after retries', lastError?.message);
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    const finalHtml = this.wrapInBaseTemplate(subject, htmlContent);

    if (!this.resend) {
      this.logger.debug(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { id: 'mock-id-' + Date.now() };
    }

    return this.withRetry(async () => {
      const data = await this.resend.emails.send({
        from: `Nexmarto <${this.fromEmail}>`,
        to,
        subject,
        html: finalHtml,
        headers: {
          'X-Entity-Ref': 'NexmartoEnterprise',
        }
      });
      return data;
    });
  }

  // --- Phase 6: Template Design & Branding Audit ---
  private wrapInBaseTemplate(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: 'Inter', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #2563eb; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Nexmarto</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 32px 24px; color: #1f2937; line-height: 1.6; font-size: 16px;">
                    ${content}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      &copy; ${new Date().getFullYear()} Nexmarto. All rights reserved.<br/>
                      This email was sent to you because of your activity on Nexmarto.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // --- Phase 2: Missing Templates & Audited Exising ---

  async sendWelcomeEmail(to: string, fullName: string) {
    const html = `
      <h2 style="color: #111827; margin-top: 0;">Welcome, ${fullName}!</h2>
      <p>We're thrilled to have you join India's Premium B2B Marketplace.</p>
      <p>Start exploring verified suppliers, or set up your own company profile to start selling.</p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="https://nexmarto.com/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Go to Dashboard</a>
      </div>
    `;
    return this.sendEmail(to, 'Welcome to Nexmarto!', html);
  }

  async sendVerificationEmail(to: string, token: string) {
    const url = `https://nexmarto.com/verify-email?token=${token}`;
    const html = `
      <h2 style="color: #111827; margin-top: 0;">Verify your Email Address</h2>
      <p>Please click the button below to verify your email address and activate your Nexmarto account.</p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; word-break: break-all;">Or copy this link: <br> <a href="${url}" style="color: #2563eb;">${url}</a></p>
    `;
    return this.sendEmail(to, 'Verify your Nexmarto Account', html);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `https://nexmarto.com/reset-password?token=${token}`;
    const html = `
      <h2 style="color: #111827; margin-top: 0;">Reset Your Password</h2>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="${url}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
    `;
    return this.sendEmail(to, 'Password Reset Request', html);
  }

  async sendLeadNotification(to: string, buyerName: string, productName: string) {
    const html = `
      <h2 style="color: #111827; margin-top: 0;">New Lead Received!</h2>
      <p><strong>${buyerName}</strong> has sent you an enquiry regarding your product: <strong>${productName}</strong>.</p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="https://nexmarto.com/dashboard/leads" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Lead Details</a>
      </div>
    `;
    return this.sendEmail(to, 'You have a new Lead on Nexmarto!', html);
  }

  async sendRfqNotification(to: string, title: string, budget: string) {
    const html = `
      <h2 style="color: #111827; margin-top: 0;">New Relevant RFQ Available</h2>
      <p>A buyer is looking for products matching your business profile.</p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0;"><strong>RFQ:</strong> ${title}</p>
        <p style="margin: 0;"><strong>Budget:</strong> ₹${budget}</p>
      </div>
      <div style="margin: 32px 0; text-align: center;">
        <a href="https://nexmarto.com/dashboard/rfqs" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View & Quote</a>
      </div>
    `;
    return this.sendEmail(to, 'New RFQ Matching Your Profile', html);
  }

  async sendApprovalEmail(to: string, companyName: string) {
    const html = `
      <h2 style="color: #111827; margin-top: 0;">Profile Approved!</h2>
      <p>Great news! The business profile and documents for <strong>${companyName}</strong> have been verified and approved.</p>
      <p>Your products are now visible to thousands of buyers on the platform.</p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="https://nexmarto.com/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Go to Dashboard</a>
      </div>
    `;
    return this.sendEmail(to, 'Your Nexmarto Profile is Approved', html);
  }

  async sendSubscriptionEmail(to: string, planName: string, invoiceUrl?: string) {
    const html = `
      <h2 style="color: #111827; margin-top: 0;">Subscription Activated</h2>
      <p>Thank you for subscribing to the <strong>${planName}</strong> plan.</p>
      <p>Your premium features are now active. Enjoy priority support, increased visibility, and exclusive access to the RFQ board.</p>
      ${invoiceUrl ? `
      <div style="margin: 32px 0; text-align: center;">
        <a href="${invoiceUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Download Invoice</a>
      </div>
      ` : ''}
    `;
    return this.sendEmail(to, 'Subscription Activation Receipt', html);
  }
}
