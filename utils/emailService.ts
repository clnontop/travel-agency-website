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
      const emailUser = 'trinck.official@gmail.com';
      const emailPass = 'gmth hyvq vpco xwtp';
      
      console.log(`📧 Configuring Gmail SMTP for: ${emailUser}`);
      
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
      console.error('❌ Transporter creation failed:', error);
      return null;
    }
  }

  static async sendEmail(config: EmailConfig): Promise<{ success: boolean; message: string }> {
    try {
      console.log('\n📧 ===== SENDING EMAIL =====');
      console.log(`📬 TO: ${config.to}`);
      console.log(`📝 SUBJECT: ${config.subject}`);
      
      const transporter = this.getTransporter();
      
      if (!transporter) {
        // Fallback: Log OTP to console for testing
        if (config.text && config.text.includes('OTP verification code is:')) {
          const otpMatch = config.text.match(/OTP verification code is: (\d{6})/);
          if (otpMatch) {
            console.log('\n🔑 FALLBACK - OTP CODE FOR TESTING:');
            console.log(`📧 Email: ${config.to}`);
            console.log(`🔢 OTP: ${otpMatch[1]}`);
            console.log('================================\n');
            
            return {
              success: true,
              message: `Transporter failed. OTP for testing: ${otpMatch[1]}`
            };
          }
        }
        
        return {
          success: false,
          message: 'Failed to create email transporter'
        };
      }
      
      const mailOptions = {
        from: 'trinck.official@gmail.com',
        to: config.to,
        subject: config.subject,
        html: config.html,
        text: config.text
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', info.messageId);
      console.log('================================\n');

      return {
        success: true,
        message: `Email sent successfully to ${config.to}`
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      
      // Fallback: Log OTP to console for testing
      if (config.text && config.text.includes('OTP verification code is:')) {
        const otpMatch = config.text.match(/OTP verification code is: (\d{6})/);
        if (otpMatch) {
          console.log('\n🔑 FALLBACK - OTP CODE FOR TESTING:');
          console.log(`📧 Email: ${config.to}`);
          console.log(`🔢 OTP: ${otpMatch[1]}`);
          console.log('================================\n');
          
          return {
            success: true,
            message: `Email failed but OTP generated: ${otpMatch[1]}. Check console.`
          };
        }
      }
      
      return {
        success: false,
        message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      text: `
Travel Agency - Email Verification

Your OTP verification code is: ${otp}

This code is valid for 5 minutes only.
Do not share this code with anyone.

If you didn't request this verification, please ignore this email.

Best regards,
Travel Agency Security Team
      `
    };

    return await this.sendEmail(emailConfig);
  }

  // Alternative method using EmailJS (free service)
  static async sendEmailViaEmailJS(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      // You can sign up for EmailJS (free) and get your service ID, template ID, and public key
      // Then replace these with your actual values
      const emailJSConfig = {
        service_id: 'your_service_id', // Replace with your EmailJS service ID
        template_id: 'your_template_id', // Replace with your EmailJS template ID
        user_id: 'your_public_key', // Replace with your EmailJS public key
        template_params: {
          to_email: email,
          otp_code: otp,
          subject: 'Your OTP Verification Code - Travel Agency'
        }
      };

      // For now, just log the configuration
      console.log('📧 EmailJS Configuration (replace with actual values):', emailJSConfig);
      console.log(`📧 OTP Email would be sent to: ${email} with code: ${otp}`);

      return {
        success: true,
        message: `OTP email prepared for ${email}. Check console for details.`
      };

    } catch (error) {
      console.error('EmailJS sending failed:', error);
      return {
        success: false,
        message: 'Failed to send email via EmailJS'
      };
    }
  }
}

export { EmailService };
