// Real SMS Service using multiple providers for actual SMS delivery
import { textbeltService } from './textbeltService';

interface SMSResult {
  success: boolean;
  message: string;
  method?: string;
  messageId?: string;
}

class RealSMSService {
  
  /**
   * Send SMS using Twilio (disabled to avoid bundling issues)
   */
  async sendViaTwilio(phoneNumber: string, message: string): Promise<SMSResult> {
    return {
      success: false,
      message: 'Twilio disabled to avoid bundling issues. Use API route instead.'
    };
  }

  /**
   * Send SMS using Fast2SMS (Indian SMS service)
   */
  async sendViaFast2SMS(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      const apiKey = process.env.FAST2SMS_API_KEY;
      
      if (!apiKey) {
        return {
          success: false,
          message: 'Fast2SMS API key not configured'
        };
      }

      const cleaned = phoneNumber.replace(/\D/g, '');
      const indianNumber = cleaned.startsWith('91') ? cleaned.substring(2) : cleaned;

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'v3',
          sender_id: 'TXTIND',
          message: message,
          language: 'english',
          flash: 0,
          numbers: indianNumber,
        }),
      });

      const result = await response.json();
      
      if (result.return === true) {
        return {
          success: true,
          message: 'SMS sent via Fast2SMS',
          method: 'fast2sms',
          messageId: result.job_id
        };
      } else {
        return {
          success: false,
          message: result.message || 'Fast2SMS failed'
        };
      }
    } catch (error: any) {
      console.error('Fast2SMS failed:', error.message);
      return {
        success: false,
        message: `Fast2SMS failed: ${error.message}`
      };
    }
  }

  /**
   * Send SMS using MSG91 (Indian SMS service)
   */
  async sendViaMSG91(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      const apiKey = process.env.MSG91_API_KEY;
      const senderId = process.env.MSG91_SENDER_ID || 'MSGIND';
      
      if (!apiKey) {
        return {
          success: false,
          message: 'MSG91 API key not configured'
        };
      }

      const cleaned = phoneNumber.replace(/\D/g, '');
      const indianNumber = cleaned.startsWith('91') ? cleaned.substring(2) : cleaned;

      const response = await fetch(`https://api.msg91.com/api/sendhttp.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          authkey: apiKey,
          mobiles: indianNumber,
          message: message,
          sender: senderId,
          route: '4'
        })
      });

      const result = await response.text();
      
      if (result.includes('success')) {
        return {
          success: true,
          message: 'SMS sent via MSG91',
          method: 'msg91'
        };
      } else {
        return {
          success: false,
          message: `MSG91 failed: ${result}`
        };
      }
    } catch (error: any) {
      console.error('MSG91 failed:', error.message);
      return {
        success: false,
        message: `MSG91 failed: ${error.message}`
      };
    }
  }

  /**
   * Main method to send OTP with multiple fallbacks
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
    const message = `Your verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    
    console.log(`📱 Attempting to send real SMS to ${phoneNumber}: ${otp}`);

    // Method 1: Try Twilio first (most reliable)
    const twilioResult = await this.sendViaTwilio(phoneNumber, message);
    if (twilioResult.success) {
      console.log(`✅ SMS sent successfully via Twilio`);
      return twilioResult;
    }

    // Method 2: Try Fast2SMS for Indian numbers
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.startsWith('91') || (cleaned.length === 10 && cleaned.startsWith('9'))) {
      const fast2smsResult = await this.sendViaFast2SMS(phoneNumber, message);
      if (fast2smsResult.success) {
        console.log(`✅ SMS sent successfully via Fast2SMS`);
        return fast2smsResult;
      }

      // Method 3: Try MSG91 for Indian numbers
      const msg91Result = await this.sendViaMSG91(phoneNumber, message);
      if (msg91Result.success) {
        console.log(`✅ SMS sent successfully via MSG91`);
        return msg91Result;
      }
    }

    // Method 4: Try Textbelt as final fallback
    const textbeltResult = await textbeltService.sendFormattedOTP(phoneNumber, otp);
    if (textbeltResult.success) {
      console.log(`✅ SMS sent successfully via Textbelt`);
      return {
        success: true,
        message: 'SMS sent via Textbelt',
        method: 'textbelt',
        messageId: textbeltResult.messageId
      };
    }

    // All methods failed
    console.log(`❌ All SMS methods failed for ${phoneNumber}`);
    return {
      success: false,
      message: 'All SMS services failed. Please try again or use a different number.'
    };
  }
}

export const realSmsService = new RealSMSService();
export default realSmsService;
