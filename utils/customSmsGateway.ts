// Custom SMS Gateway Client - connects to our own SMS server
interface CustomSMSResult {
  success: boolean;
  message: string;
  carrier?: string;
}

class CustomSMSGateway {
  private readonly gatewayUrl = 'http://localhost:9095';
  
  async sendOTP(phoneNumber: string, otp: string): Promise<CustomSMSResult> {
    try {
      const message = `Your TRINK verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
      
      console.log(`🚀 CUSTOM SMS GATEWAY: Sending OTP ${otp} to ${phoneNumber}`);
      
      const response = await fetch(`${this.gatewayUrl}/send-guaranteed-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          message
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ SUCCESS! SMS sent via custom gateway (${data.carrier})`);
        return {
          success: true,
          message: `SMS sent successfully via ${data.carrier}`,
          carrier: data.carrier
        };
      } else {
        console.log(`❌ Custom SMS Gateway failed:`, data.error);
        return {
          success: false,
          message: data.error || 'Custom SMS gateway failed'
        };
      }
      
    } catch (error: any) {
      console.log('❌ Custom SMS Gateway error:', error.message);
      return {
        success: false,
        message: `Gateway error: ${error.message}`
      };
    }
  }
  
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.gatewayUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const customSmsGateway = new CustomSMSGateway();
export default customSmsGateway;
