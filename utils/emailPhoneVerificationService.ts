// Simplified Email Phone Verification Service
// Basic email backup for phone verification when SMS fails

interface EmailPhoneVerificationResponse {
  success: boolean;
  message: string;
  method: string;
  verificationId?: string;
  expiresAt?: string;
}

class EmailPhoneVerificationService {
  
  // Simple email backup verification
  async sendVerificationEmail(phoneNumber: string, userEmail: string): Promise<EmailPhoneVerificationResponse> {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Direct email sending using nodemailer (server-side safe)
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || process.env.GMAIL_USER || 'trinck.official@gmail.com',
          pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'qovj wpmz kbeo tdzq',
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: `"TRINK SMS Service" <${process.env.SMTP_USER || 'trinck.official@gmail.com'}>`,
        to: userEmail,
        subject: 'TRINK - Phone Verification Code (Email Backup)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">📱 Phone Verification Backup</h1>
              <p style="color: white; margin: 10px 0 0 0;">TRINK Transport Platform</p>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; text-align: center;">Phone Verification Code (Email Backup)</h2>
              <p style="color: #666; font-size: 16px;">SMS delivery to <strong>${phoneNumber}</strong> failed. Here's your verification code via email backup:</p>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 25px; margin: 30px 0; border-radius: 12px; letter-spacing: 8px;">
                ${otp}
              </div>
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;"><strong>⏰ Important:</strong> This code expires in 5 minutes.</p>
              </div>
              <p style="color: #666; font-size: 14px;">Enter this code in the phone verification field to complete your registration.</p>
            </div>
            <div style="background: #333; color: #ccc; text-align: center; padding: 20px; font-size: 12px;">
              <p style="margin: 0;">© 2024 TRINK Transport. All rights reserved.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        message: 'Phone verification code sent to email',
        method: 'email-phone-verification',
        verificationId: 'email_' + Date.now(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('Email phone verification failed:', error);
      return {
        success: false,
        message: 'Email service error',
        method: 'email-phone-verification'
      };
    }
  }

  // Placeholder methods for API compatibility
  async verifyOTP(verificationId: string, otp: string): Promise<EmailPhoneVerificationResponse> {
    return {
      success: false,
      message: 'OTP verification not implemented in simplified service. Use existing OTP API endpoints.',
      method: 'email-phone-verification'
    };
  }

  async resendVerification(verificationId: string): Promise<EmailPhoneVerificationResponse> {
    return {
      success: false,
      message: 'Resend not implemented in simplified service. Use existing resend API endpoints.',
      method: 'email-phone-verification'
    };
  }

  async verifyPhoneChallenge(verificationId: string, challengeResponse: string): Promise<EmailPhoneVerificationResponse> {
    return {
      success: false,
      message: 'Phone challenge not implemented in simplified service.',
      method: 'email-phone-verification'
    };
  }

  getVerificationStatus(verificationId: string): {
    exists: boolean;
    verified: boolean;
    expired: boolean;
    phoneNumber?: string;
    attemptsRemaining?: number;
  } {
    return {
      exists: false,
      verified: false,
      expired: true
    };
  }

  getActiveVerificationsCount(): number {
    return 0;
  }
}

export const emailPhoneVerificationService = new EmailPhoneVerificationService();
export default emailPhoneVerificationService;
