// Email OTP service for instant delivery when SMS fails
import nodemailer from 'nodemailer';

interface EmailOTPResult {
  success: boolean;
  message: string;
}

class EmailOTPService {
  
  async sendOTPViaEmail(phoneNumber: string, otp: string): Promise<EmailOTPResult> {
    try {
      // Create transporter using Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      // Try to guess email from phone number or use a fallback
      const emailGuess = `${phoneNumber.replace(/[^0-9]/g, '')}@gmail.com`;
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: emailGuess,
        subject: 'TRINK Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your TRINK Verification Code</h2>
            <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; text-align: center;">
              <h1 style="color: #007bff; font-size: 48px; margin: 0;">${otp}</h1>
            </div>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 5 minutes.</p>
            <p>Phone: ${phoneNumber}</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 OTP email sent to ${emailGuess}`);
      
      return {
        success: true,
        message: `OTP sent via email to ${emailGuess}`
      };
      
    } catch (error: any) {
      console.log('❌ Email OTP failed:', error.message);
      return {
        success: false,
        message: `Email delivery failed: ${error.message}`
      };
    }
  }
}

export const emailOtpService = new EmailOTPService();
export default emailOtpService;
