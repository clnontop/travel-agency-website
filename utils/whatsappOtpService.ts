// WhatsApp OTP Service
// Provides WhatsApp-based OTP delivery using WhatsApp Business API or Web links

interface WhatsAppOTPResponse {
  success: boolean;
  message: string;
  method: string;
  whatsappLink?: string;
  messageId?: string;
}

interface WhatsAppBusinessConfig {
  accessToken?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
}

class WhatsAppOTPService {
  private config: WhatsAppBusinessConfig;

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    };
  }

  // Format phone number for WhatsApp (international format)
  private formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10 && !cleaned.startsWith('91')) {
      return `91${cleaned}`; // Default to India
    }
    
    if (cleaned.startsWith('91')) {
      return cleaned;
    }
    
    // For other countries, assume already formatted
    return cleaned;
  }

  // Generate WhatsApp Web link with pre-filled OTP message
  generateWhatsAppWebLink(phoneNumber: string, otp: string): string {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    
    const message = encodeURIComponent(
      `🔐 *TRINK Verification Code*\n\n` +
      `Your verification code is: *${otp}*\n\n` +
      `⏰ This code expires in 5 minutes\n` +
      `🔒 Do not share this code with anyone\n\n` +
      `Use this code to complete your phone verification on TRINK.`
    );
    
    return `https://wa.me/${formattedNumber}?text=${message}`;
  }

  // Send OTP via WhatsApp Business API (if configured)
  async sendViaBusinessAPI(phoneNumber: string, otp: string): Promise<WhatsAppOTPResponse> {
    if (!this.config.accessToken || !this.config.phoneNumberId) {
      return {
        success: false,
        message: 'WhatsApp Business API not configured',
        method: 'business-api'
      };
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedNumber,
          type: 'template',
          template: {
            name: 'otp_verification', // You need to create this template in WhatsApp Business
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: otp
                  }
                ]
              }
            ]
          }
        })
      });

      const result = await response.json();

      if (response.ok && result.messages) {
        return {
          success: true,
          message: 'OTP sent via WhatsApp Business API',
          method: 'business-api',
          messageId: result.messages[0].id
        };
      } else {
        throw new Error(result.error?.message || 'Business API failed');
      }

    } catch (error) {
      console.error('WhatsApp Business API error:', error);
      return {
        success: false,
        message: `Business API failed: ${error}`,
        method: 'business-api'
      };
    }
  }

  // Send OTP via WhatsApp Web link (fallback method)
  async sendViaWebLink(phoneNumber: string, otp: string): Promise<WhatsAppOTPResponse> {
    try {
      const whatsappLink = this.generateWhatsAppWebLink(phoneNumber, otp);
      
      return {
        success: true,
        message: 'WhatsApp link generated. Click to send OTP via WhatsApp.',
        method: 'web-link',
        whatsappLink
      };

    } catch (error) {
      console.error('WhatsApp Web link generation error:', error);
      return {
        success: false,
        message: 'Failed to generate WhatsApp link',
        method: 'web-link'
      };
    }
  }

  // Main method to send OTP via WhatsApp
  async sendOTP(phoneNumber: string, otp: string): Promise<WhatsAppOTPResponse> {
    console.log(`📱 Sending WhatsApp OTP ${otp} to ${phoneNumber}`);

    // Try Business API first if configured
    if (this.config.accessToken && this.config.phoneNumberId) {
      const businessResult = await this.sendViaBusinessAPI(phoneNumber, otp);
      if (businessResult.success) {
        return businessResult;
      }
      console.log('Business API failed, falling back to Web link');
    }

    // Fallback to WhatsApp Web link
    return await this.sendViaWebLink(phoneNumber, otp);
  }

  // Send custom message via WhatsApp
  async sendMessage(phoneNumber: string, message: string): Promise<WhatsAppOTPResponse> {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    const encodedMessage = encodeURIComponent(message);
    
    return {
      success: true,
      message: 'WhatsApp link generated for custom message',
      method: 'web-link',
      whatsappLink: `https://wa.me/${formattedNumber}?text=${encodedMessage}`
    };
  }

  // Check if Business API is configured
  isBusinessAPIConfigured(): boolean {
    return !!(this.config.accessToken && this.config.phoneNumberId);
  }

  // Get configuration status
  getConfigStatus(): {
    businessAPI: boolean;
    webLink: boolean;
    accessToken: boolean;
    phoneNumberId: boolean;
  } {
    return {
      businessAPI: this.isBusinessAPIConfigured(),
      webLink: true, // Always available
      accessToken: !!this.config.accessToken,
      phoneNumberId: !!this.config.phoneNumberId
    };
  }
}

export const whatsappOtpService = new WhatsAppOTPService();
export default whatsappOtpService;
