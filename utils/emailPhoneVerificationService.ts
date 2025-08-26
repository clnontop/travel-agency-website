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

  // Placeholder methods for API compatibility
  async verifyOTP(verificationId: string, otp: string): Promise<EmailPhoneVerificationResponse> {
    return {
      success: false,
      message: 'OTP verification not implemented in simplified service. Use existing OTP API endpoints.',
      method: 'email-phone-verification'
    };
  }

  async resendVerification(verificationId: string): Promise<EmailPhoneVerificationResponse> {
    return {
      success: false,
      message: 'Resend not implemented in simplified service. Use existing resend API endpoints.',
      method: 'email-phone-verification'
    };
  }

  async verifyPhoneChallenge(verificationId: string, challengeResponse: string): Promise<EmailPhoneVerificationResponse> {
    return {
      success: false,
      message: 'Phone challenge not implemented in simplified service.',
      method: 'email-phone-verification'
    };
  }

  getVerificationStatus(verificationId: string): {
    exists: boolean;
    verified: boolean;
    expired: boolean;
    phoneNumber?: string;
    attemptsRemaining?: number;
  } {
    return {
      exists: false,
      verified: false,
      expired: true
    };
  }

  getActiveVerificationsCount(): number {
    return 0;
  }
}

export const emailPhoneVerificationService = new EmailPhoneVerificationService();
export default emailPhoneVerificationService;
