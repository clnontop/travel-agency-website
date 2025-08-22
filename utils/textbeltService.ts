// Textbelt SMS Service for phone verification
// Using free open source endpoint - no API key required
// https://textbelt.com/

interface TextbeltResponse {
  success: boolean;
  textId?: string;
  quotaRemaining?: number;
  error?: string;
}

interface SMSResult {
  success: boolean;
  message: string;
  messageId?: string;
  quotaRemaining?: number;
}

class TextbeltService {
  private readonly freeApiUrl = 'https://textbelt.com/text';

  constructor() {
    // Using free open source endpoint - no API key needed
  }

  /**
   * Send SMS using Textbelt free API (with country restrictions handling)
   */
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      // Check if it's an Indian number
      const cleaned = phoneNumber.replace(/\D/g, '');
      const isIndianNumber = cleaned.startsWith('91') || (cleaned.length === 10 && cleaned.startsWith('9'));
      
      if (isIndianNumber) {
        return {
          success: false,
          message: 'Textbelt free tier not available for Indian numbers. Using fallback method.',
        };
      }

      const response = await fetch(this.freeApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: message,
          key: 'textbelt', // Free tier key
        }),
      });

      const result: TextbeltResponse = await response.json();

      if (result.success) {
        return {
          success: true,
          message: 'SMS sent successfully',
          messageId: result.textId,
          quotaRemaining: result.quotaRemaining,
        };
      } else {
        console.error('Textbelt API Error:', result.error);
        return {
          success: false,
          message: result.error || 'Failed to send SMS',
        };
      }
    } catch (error) {
      console.error('Textbelt Service Error:', error);
      return {
        success: false,
        message: 'Network error occurred while sending SMS',
      };
    }
  }

  /**
   * Send OTP via SMS
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
    const message = `Your TRINK verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
    return this.sendSMS(phoneNumber, message);
  }

  /**
   * Format phone number for international use
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.length === 10 && !cleaned.startsWith('91')) {
      return `+91${cleaned}`;
    } else if (cleaned.startsWith('91')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('1') && cleaned.length === 11) {
      return `+${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  /**
   * Send OTP with formatted phone number
   */
  async sendFormattedOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    return this.sendOTP(formattedNumber, otp);
  }

  /**
   * Check quota remaining (free tier only)
   */
  async checkQuota(): Promise<{ quotaRemaining?: number; error?: string }> {
    try {
      const response = await fetch('https://textbelt.com/quota/textbelt');
      const result = await response.json();
      return result;
    } catch (error) {
      return { error: 'Failed to check quota' };
    }
  }
}

export const textbeltService = new TextbeltService();
export default textbeltService;
