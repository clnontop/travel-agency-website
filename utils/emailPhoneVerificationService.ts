// Simplified Email Phone Verification Service
// Basic email backup for phone verification when SMS fails

interface EmailPhoneVerificationResponse {
  success: boolean;
  message: string;
  method: string;
  verificationId?: string;
  expiresAt?: string;
}

class EmailPhoneVerificationService {
  
  // Simple email backup verification
  async sendVerificationEmail(phoneNumber: string, userEmail: string): Promise<EmailPhoneVerificationResponse> {
    try {
      // Call the existing email API endpoint
      const response = await fetch('/api/email/send-phone-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otp: Math.floor(100000 + Math.random() * 900000).toString(),
          userEmail
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          message: 'Phone verification code sent to email',
          method: 'email-phone-verification',
          verificationId: 'email_' + Date.now(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to send verification email',
          method: 'email-phone-verification'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Email service error',
        method: 'email-phone-verification'
      };
    }
  }
}

export const emailPhoneVerificationService = new EmailPhoneVerificationService();
export default emailPhoneVerificationService;
