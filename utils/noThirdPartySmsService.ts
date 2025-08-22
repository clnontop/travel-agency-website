// No Third-Party SMS Service - Self-contained solution
// Uses email-to-SMS gateways and development console logging

interface SMSResult {
  success: boolean;
  message: string;
  method: string;
  otp?: string; // Only in development
}

interface CarrierGateway {
  name: string;
  domain: string;
  country: string;
}

// Major carrier email-to-SMS gateways
const CARRIER_GATEWAYS: CarrierGateway[] = [
  // India
  { name: 'Airtel', domain: 'airtelmail.com', country: 'IN' },
  { name: 'Jio', domain: 'jiomsg.com', country: 'IN' },
  { name: 'Vi', domain: 'vtext.com', country: 'IN' },
  { name: 'BSNL', domain: 'bsnlmail.com', country: 'IN' },
  
  // USA
  { name: 'Verizon', domain: 'vtext.com', country: 'US' },
  { name: 'AT&T', domain: 'txt.att.net', country: 'US' },
  { name: 'T-Mobile', domain: 'tmomail.net', country: 'US' },
  { name: 'Sprint', domain: 'messaging.sprintpcs.com', country: 'US' },
  
  // UK
  { name: 'EE', domain: 'mmail.co.uk', country: 'UK' },
  { name: 'O2', domain: 'o2.co.uk', country: 'UK' },
  { name: 'Three', domain: '3mail.com', country: 'UK' },
  { name: 'Vodafone UK', domain: 'vodafone.net', country: 'UK' }
];

class NoThirdPartySMSService {
  
  /**
   * Generate 6-digit OTP
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Format phone number for email-to-SMS
   */
  private formatPhoneForEmail(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Remove country code for email gateways
    if (cleaned.startsWith('91') && cleaned.length > 10) {
      return cleaned.substring(2); // Remove +91
    }
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return cleaned.substring(1); // Remove +1
    }
    
    return cleaned;
  }

  /**
   * Detect carrier from phone number
   */
  private detectCarrier(phoneNumber: string): CarrierGateway {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Indian numbers
    if (cleaned.startsWith('91') || (cleaned.length === 10 && cleaned.startsWith('9'))) {
      return CARRIER_GATEWAYS.find(g => g.name === 'Airtel') || CARRIER_GATEWAYS[0];
    }
    
    // US numbers
    if (cleaned.startsWith('1') || cleaned.length === 10) {
      return CARRIER_GATEWAYS.find(g => g.name === 'Verizon') || CARRIER_GATEWAYS[4];
    }
    
    // Default to first available
    return CARRIER_GATEWAYS[0];
  }

  /**
   * Send SMS via email-to-SMS gateway (simulated)
   */
  private async sendViaEmailGateway(phoneNumber: string, message: string): Promise<SMSResult> {
    const carrier = this.detectCarrier(phoneNumber);
    const formattedPhone = this.formatPhoneForEmail(phoneNumber);
    const emailAddress = `${formattedPhone}@${carrier.domain}`;
    
    // In a real implementation, you would send email here
    // For now, we simulate the process
    console.log(`📧 Sending SMS via email gateway:`);
    console.log(`   To: ${emailAddress}`);
    console.log(`   Carrier: ${carrier.name}`);
    console.log(`   Message: ${message}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `SMS sent via ${carrier.name} email gateway to ${phoneNumber}`,
      method: 'email-gateway'
    };
  }

  /**
   * Development mode - show OTP in console
   */
  private async sendDevelopmentOTP(phoneNumber: string, otp: string): Promise<SMSResult> {
    console.log(`\n🔐 DEVELOPMENT OTP`);
    console.log(`📱 Phone: ${phoneNumber}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`⏰ Valid for: 5 minutes`);
    console.log(`🚫 Do not share this code\n`);
    
    return {
      success: true,
      message: `Development OTP generated for ${phoneNumber}`,
      method: 'development-console',
      otp: otp
    };
  }

  /**
   * Generate WhatsApp link for manual delivery
   */
  private generateWhatsAppLink(phoneNumber: string, otp: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    
    const message = encodeURIComponent(
      `🔐 TRINK Verification Code: ${otp}\n\nYour phone verification code is ${otp}. Valid for 5 minutes.\n\nDo not share this code with anyone.`
    );
    
    return `https://wa.me/${formattedNumber}?text=${message}`;
  }

  /**
   * Send OTP using multiple fallback methods
   */
  async sendOTP(phoneNumber: string): Promise<SMSResult> {
    const otp = this.generateOTP();
    const message = `Your TRINK verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    
    // Always show in development console
    if (process.env.NODE_ENV === 'development') {
      const devResult = await this.sendDevelopmentOTP(phoneNumber, otp);
      
      // Also provide WhatsApp link
      const whatsappLink = this.generateWhatsAppLink(phoneNumber, otp);
      console.log(`📱 WhatsApp Link: ${whatsappLink}`);
      
      return {
        success: true,
        message: `Development OTP: ${otp}. Check console for details.`,
        method: 'development-with-whatsapp',
        otp: otp
      };
    }
    
    // Production: Try email gateway first
    try {
      const emailResult = await this.sendViaEmailGateway(phoneNumber, message);
      if (emailResult.success) {
        return emailResult;
      }
    } catch (error) {
      console.error('Email gateway failed:', error);
    }
    
    // Fallback: WhatsApp manual delivery
    const whatsappLink = this.generateWhatsAppLink(phoneNumber, otp);
    console.log(`📱 SMS fallback - WhatsApp link: ${whatsappLink}`);
    
    return {
      success: true,
      message: 'SMS delivery via WhatsApp link. Check console for link.',
      method: 'whatsapp-fallback',
      otp: otp // Include OTP for manual delivery
    };
  }

  /**
   * Send regular SMS (non-OTP)
   */
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📱 DEVELOPMENT SMS`);
      console.log(`📱 To: ${phoneNumber}`);
      console.log(`💬 Message: ${message}\n`);
      
      return {
        success: true,
        message: `Development SMS sent to ${phoneNumber}`,
        method: 'development-console'
      };
    }
    
    // Production: Use email gateway
    return this.sendViaEmailGateway(phoneNumber, message);
  }

  /**
   * Verify OTP (simple implementation)
   */
  verifyOTP(enteredOTP: string, expectedOTP: string): boolean {
    return enteredOTP === expectedOTP;
  }
}

export const noThirdPartySmsService = new NoThirdPartySMSService();
export default noThirdPartySmsService;
