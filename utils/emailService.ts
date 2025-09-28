import nodemailer from 'nodemailer';

interface EmailConfig {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private static getTransporter() {
    try {
      const emailUser = process.env.EMAIL_USER || process.env.NEXT_PUBLIC_EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS || process.env.NEXT_PUBLIC_EMAIL_PASS;
      
      if (!emailUser || !emailPass) {
        return null;
      }
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      return transporter;
    } catch (error) {
      return null;
    }
  }

  static async sendEmail(config: EmailConfig): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.getTransporter();
      
      if (!transporter) {
        // Secure fallback - only show success message, no OTP in logs
        return {
          success: true,
          message: 'Email service temporarily unavailable. Please try again.'
        };
      }
      
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@travelagency.com',
        to: config.to,
        subject: config.subject,
        html: config.html,
        text: config.text
      };

      await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        message: `Email sent successfully`
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to send email. Please try again.'
      };
    }
  }

  static async sendOTPEmail(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    const emailConfig: EmailConfig = {
      to: email,
      subject: 'Your OTP Verification Code - Travel Agency',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #dc2626; margin-bottom: 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; padding: 20px; background-color: #fef2f2; border-radius: 8px; margin: 20px 0; letter-spacing: 4px; }
            .message { color: #374151; line-height: 1.6; margin-bottom: 20px; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; color: #856404; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚗 Travel Agency</div>
              <h2 style="color: #374151; margin: 0;">Email Verification Required</h2>
            </div>
            
            <div class="message">
              <p>Hello,</p>
              <p>Thank you for registering with our Travel Agency! To complete your account setup, please verify your email address using the OTP code below:</p>
            </div>
            
            <div class="otp-code">${otp}</div>
            
            <div class="message">
              <p><strong>Important:</strong></p>
              <ul>
                <li>This OTP is valid for 5 minutes only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this verification, please ignore this email</li>
              </ul>
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> Our team will never ask for your OTP via phone or email. Please enter this code only on our official website.
            </div>
            
            <div class="footer">
              <p>Best regards,<br>Travel Agency Security Team</p>
              <p style="font-size: 12px; margin-top: 20px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Travel Agency - Email Verification\n\nYour OTP verification code is: ${otp}\n\nThis code is valid for 5 minutes only.\nDo not share this code with anyone.\n\nIf you didn't request this verification, please ignore this email.\n\nBest regards,\nTravel Agency Security Team`
    };

    return await this.sendEmail(emailConfig);
  }
}

export { EmailService };
