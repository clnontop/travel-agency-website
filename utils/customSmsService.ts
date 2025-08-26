// Custom SMS Service without third-party APIs
// Uses API routes to send SMS via carrier email gateways

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
  { name: 'Vi (Vodafone Idea)', domain: 'vtext.com', country: 'IN' },
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

class CustomSMSService {
  constructor() {
    // Client-side service - uses API routes
  }

  // Detect carrier from phone number patterns
  private detectCarrier(phoneNumber: string): CarrierGateway | null {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Indian number patterns
    if (cleaned.startsWith('91') || (cleaned.length === 10 && cleaned.startsWith('9'))) {
      const number = cleaned.length === 10 ? cleaned : cleaned.substring(2);
      
      // Airtel: 7, 8, 9 series
      if (/^[789]/.test(number)) {
        return CARRIER_GATEWAYS.find(g => g.name === 'Airtel') || null;
      }
      
      // Jio: 6, 7, 8, 9 series
      if (/^[6789]/.test(number)) {
        return CARRIER_GATEWAYS.find(g => g.name === 'Jio') || null;
      }
    }
    
    // Default to most common carrier for the region
    return CARRIER_GATEWAYS.find(g => g.country === 'IN') || CARRIER_GATEWAYS[0];
  }

  // Send SMS via email-to-SMS gateway (uses API route)
  async sendSMSViaEmail(phoneNumber: string, message: string): Promise<{ success: boolean; message: string; method: string }> {
    try {
      // In development, skip actual email gateway and return success
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 DEV MODE - Email Gateway SMS to ${phoneNumber}: ${message}`);
        return {
          success: true,
          message: 'Development mode: SMS logged to console',
          method: 'dev-email-gateway'
        };
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/sms/send-email-gateway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          message: message.substring(0, 160) // SMS character limit
        })
      });

      const result = await response.json();
      
      return {
        success: result.success,
        message: result.message,
        method: 'email-gateway'
      };

    } catch (error) {
      console.error('Email-to-SMS API failed:', error);
      return {
        success: false,
        message: 'Failed to send via email gateway',
        method: 'email-gateway'
      };
    }
  }

  // Send notification via email as fallback (uses API route)
  async sendEmailNotification(phoneNumber: string, otp: string, userEmail?: string): Promise<{ success: boolean; message: string; method: string }> {
    try {
      if (!userEmail) {
        throw new Error('No user email provided');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/email/send-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp,
          userEmail
        })
      });

      const result = await response.json();
      
      return {
        success: result.success,
        message: result.success ? `Phone verification code sent to your email (${userEmail.replace(/(.{2}).*(@.*)/, '$1****$2')})` : result.message,
        method: 'email-fallback'
      };

    } catch (error) {
      console.error('Email notification failed:', error);
      return {
        success: false,
        message: 'Failed to send email notification',
        method: 'email-fallback'
      };
    }
  }

  // WhatsApp Web integration (opens WhatsApp with pre-filled message)
  generateWhatsAppLink(phoneNumber: string, otp: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    
    const message = encodeURIComponent(
      `🔐 TRINK Verification Code: ${otp}\n\nYour phone verification code is ${otp}. Valid for 5 minutes.\n\nDo not share this code with anyone.`
    );
    
    return `https://wa.me/${formattedNumber}?text=${message}`;
  }

  // Main SMS sending method with multiple fallbacks
  async sendOTP(phoneNumber: string, otp: string, userEmail?: string): Promise<{ 
    success: boolean; 
    message: string; 
    method: string;
    whatsappLink?: string;
  }> {
    console.log(`📱 Attempting to send OTP ${otp} to ${phoneNumber}`);

    // Method 1: Try email-to-SMS gateway
    const emailSmsResult = await this.sendSMSViaEmail(phoneNumber, 
      `Your TRINK verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`
    );

    if (emailSmsResult.success) {
      return {
        success: true,
        message: emailSmsResult.message,
        method: emailSmsResult.method
      };
    }

    // Method 2: Send to user's email if available
    if (userEmail) {
      const emailResult = await this.sendEmailNotification(phoneNumber, otp, userEmail);
      if (emailResult.success) {
        return {
          success: true,
          message: emailResult.message,
          method: emailResult.method
        };
      }
    }

    // Method 3: Generate WhatsApp link as final fallback
    const whatsappLink = this.generateWhatsAppLink(phoneNumber, otp);
    
    console.log(`📱 All SMS methods failed. WhatsApp link generated for ${phoneNumber}`);
    
    return {
      success: true,
      message: 'SMS delivery failed. Please use WhatsApp option or check your email.',
      method: 'whatsapp-fallback',
      whatsappLink
    };
  }

  // Get available carriers for a region
  getCarriersForRegion(country: string): CarrierGateway[] {
    return CARRIER_GATEWAYS.filter(carrier => carrier.country === country);
  }

  // Test connectivity (uses API route)
  async testConnectivity(): Promise<{ emailGateway: boolean; emailService: boolean }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/sms/test-connectivity`);
      const result = await response.json();
      
      return {
        emailGateway: result.success,
        emailService: result.success
      };
    } catch (error) {
      return {
        emailGateway: false,
        emailService: false
      };
    }
  }
}

export const customSmsService = new CustomSMSService();
export default customSmsService;
