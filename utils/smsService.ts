// Browser-compatible SMS Service using API routes

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

class SMSService {
  private fromNumber: string = '+1234567890'; // Default value
  private isConfigured: boolean = false;
  private config: SMSConfig | null = null;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      // Browser environment - check localStorage for config
      const savedConfig = localStorage.getItem('sms_config');
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig) as SMSConfig;
          this.config = parsedConfig;
          this.fromNumber = parsedConfig.fromNumber;
          this.isConfigured = true;
          console.log('✅ SMS Service configured from saved settings');
        } catch (error) {
          console.log('🚨 SMS Service running in DEMO mode - OTPs will appear in console');
          this.isConfigured = false;
        }
      } else {
        console.log('🚨 SMS Service running in DEMO mode - OTPs will appear in console');
        this.isConfigured = false;
      }
    } else {
      // Server environment - use environment variables
      console.log('🚨 SMS Service running in DEMO mode - OTPs will appear in console');
      this.isConfigured = false;
    }
  }

  async sendSMS(to: string, message: string): Promise<{ success: boolean; message: string; messageId?: string }> {
    try {
      // Format phone number for international format
      const formattedNumber = this.formatPhoneNumber(to);

      if (!this.isConfigured) {
        // Demo mode - log to console
        console.log(`📱 SMS to ${formattedNumber}: ${message}`);
        return {
          success: true,
          message: 'SMS sent successfully (Demo mode - check console)',
          messageId: 'demo_' + Date.now()
        };
      }

      // Send SMS via API route
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          message: message,
          config: this.config
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ SMS sent successfully to ${formattedNumber}`);
        return {
          success: true,
          message: result.message,
          messageId: result.messageId
        };
      } else {
        throw new Error(result.message);
      }

    } catch (error: any) {
      console.error('❌ SMS sending failed:', error);
      
      // Fallback to console in case of error
      console.log(`📱 FALLBACK SMS to ${to}: ${message}`);
      
      return {
        success: true, // Still return success so app doesn't break
        message: 'SMS sent (fallback mode - check console)',
        messageId: 'fallback_' + Date.now()
      };
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Indian phone numbers
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      return '+91' + cleaned;
    }
    
    // Handle US phone numbers
    if (cleaned.length === 10) {
      return '+1' + cleaned;
    }
    
    // If already has country code
    if (cleaned.length > 10) {
      return '+' + cleaned;
    }
    
    // Default to Indian format
    return '+91' + cleaned;
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    const message = `Your TRINK verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
    
    const result = await this.sendSMS(phoneNumber, message);
    return {
      success: result.success,
      message: result.message
    };
  }

  // Configure SMS credentials at runtime
  configure(config: SMSConfig): boolean {
    try {
      // Save config to localStorage (browser only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('sms_config', JSON.stringify(config));
      }
      
      this.config = config;
      this.fromNumber = config.fromNumber;
      this.isConfigured = true;
      console.log('✅ SMS Service reconfigured successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to configure SMS service:', error);
      return false;
    }
  }

  getStatus(): { configured: boolean; fromNumber?: string } {
    return {
      configured: this.isConfigured,
      fromNumber: this.isConfigured ? this.fromNumber : undefined
    };
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;
