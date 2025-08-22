// India-specific OTP service using multiple free methods
// Since Textbelt blocks Indian numbers, we use alternative approaches

interface IndiaOTPResult {
  success: boolean;
  message: string;
  method: string;
  whatsappLink?: string;
}

class IndiaOTPService {
  
  /**
   * Generate WhatsApp link for manual OTP delivery
   */
  generateWhatsAppLink(phoneNumber: string, otp: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    
    const message = encodeURIComponent(
      `🔐 TRINK Verification Code: ${otp}\n\nYour phone verification code is ${otp}. Valid for 5 minutes.\n\nDo not share this code with anyone.`
    );
    
    return `https://wa.me/${formattedNumber}?text=${message}`;
  }

  /**
   * Send OTP via console log for development
   */
  async sendDevelopmentOTP(phoneNumber: string, otp: string): Promise<IndiaOTPResult> {
    console.log(`📱 DEVELOPMENT OTP for ${phoneNumber}: ${otp}`);
    
    return {
      success: true,
      message: `Development mode: OTP ${otp} logged to console for ${phoneNumber}`,
      method: 'development-console'
    };
  }

  /**
   * Send OTP using WhatsApp Web link
   */
  async sendWhatsAppOTP(phoneNumber: string, otp: string): Promise<IndiaOTPResult> {
    const whatsappLink = this.generateWhatsAppLink(phoneNumber, otp);
    
    return {
      success: true,
      message: 'Click the WhatsApp link to send OTP manually',
      method: 'whatsapp-manual',
      whatsappLink
    };
  }

  /**
   * Try Fast2SMS (requires API key but has free tier)
   */
  async sendFast2SMS(phoneNumber: string, otp: string): Promise<IndiaOTPResult> {
    const apiKey = process.env.FAST2SMS_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        message: 'Fast2SMS API key not configured',
        method: 'fast2sms'
      };
    }

    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'v3',
          sender_id: 'TXTIND',
          message: `Your TRINK verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
          language: 'english',
          flash: 0,
          numbers: phoneNumber.replace(/\D/g, '').replace(/^91/, ''),
        }),
      });

      const result = await response.json();
      
      if (result.return === true) {
        return {
          success: true,
          message: 'OTP sent via Fast2SMS',
          method: 'fast2sms'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Fast2SMS failed',
          method: 'fast2sms'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Fast2SMS network error',
        method: 'fast2sms'
      };
    }
  }

  /**
   * Main method to send OTP for Indian numbers
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<IndiaOTPResult> {
    // In development, always show in console
    if (process.env.NODE_ENV === 'development') {
      const devResult = await this.sendDevelopmentOTP(phoneNumber, otp);
      const whatsappResult = await this.sendWhatsAppOTP(phoneNumber, otp);
      
      return {
        success: true,
        message: `${devResult.message}. WhatsApp option also available.`,
        method: 'development-with-whatsapp',
        whatsappLink: whatsappResult.whatsappLink
      };
    }

    // Try Fast2SMS first if API key is available
    const fast2smsResult = await this.sendFast2SMS(phoneNumber, otp);
    if (fast2smsResult.success) {
      return fast2smsResult;
    }

    // Fallback to WhatsApp method
    return this.sendWhatsAppOTP(phoneNumber, otp);
  }
}

export const indiaOtpService = new IndiaOTPService();
export default indiaOtpService;
