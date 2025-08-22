// OTP Service for handling phone and Aadhaar verification
import { customSmsService } from './customSmsService';

export interface OTPSession {
  id: string;
  phoneNumber?: string;
  aadhaarNumber?: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  type: 'phone' | 'aadhaar';
}

interface OTPResponse {
  success: boolean;
  sessionId?: string;
  message: string;
  whatsappLink?: string;
}

class OTPService {
  private sessions: Map<string, OTPSession> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly OTP_EXPIRY_MINUTES = 5;

  // Generate a random 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate session ID
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Send OTP for phone verification
  async sendPhoneOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      // Clean up expired sessions
      this.cleanupExpiredSessions();

      // Check if there's an existing active session for this phone
      const existingSession = Array.from(this.sessions.values()).find(
        session => session.phoneNumber === phoneNumber && session.expiresAt > new Date()
      );

      if (existingSession) {
        return {
          success: false,
          message: 'OTP already sent. Please wait before requesting a new one.'
        };
      }

      const otp = this.generateOTP();
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      const session: OTPSession = {
        id: sessionId,
        phoneNumber,
        otp,
        expiresAt,
        attempts: 0,
        verified: false,
        type: 'phone'
      };

      this.sessions.set(sessionId, session);

      // Send real SMS using custom SMS service (pass user email if available from session)
      const smsResult = await customSmsService.sendOTP(phoneNumber, otp);
      
      if (!smsResult.success) {
        console.log(`📱 FALLBACK SMS OTP for ${phoneNumber}: ${otp}`);
      }

      return {
        success: true,
        sessionId,
        message: smsResult.message || `OTP sent to ${phoneNumber.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')}`,
        whatsappLink: smsResult.whatsappLink
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Send OTP for Aadhaar verification
  async sendAadhaarOTP(aadhaarNumber: string): Promise<{ success: boolean; sessionId?: string; message: string }> {
    try {
      this.cleanupExpiredSessions();

      const existingSession = Array.from(this.sessions.values()).find(
        session => session.aadhaarNumber === aadhaarNumber && session.expiresAt > new Date()
      );

      if (existingSession) {
        return {
          success: false,
          message: 'OTP already sent. Please wait before requesting a new one.'
        };
      }

      const otp = this.generateOTP();
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      const session: OTPSession = {
        id: sessionId,
        aadhaarNumber,
        otp,
        expiresAt,
        attempts: 0,
        verified: false,
        type: 'aadhaar'
      };

      this.sessions.set(sessionId, session);

      // For Aadhaar, we simulate UIDAI API (would need real integration in production)
      console.log(`🆔 Aadhaar OTP for ${aadhaarNumber}: ${otp}`);
      
      // Simulate UIDAI API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        sessionId,
        message: 'OTP sent to your registered mobile number'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send Aadhaar OTP. Please try again.'
      };
    }
  }

  // Verify OTP
  async verifyOTP(sessionId: string, enteredOTP: string): Promise<{ success: boolean; message: string }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        message: 'Invalid session. Please request a new OTP.'
      };
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    if (session.attempts >= this.MAX_ATTEMPTS) {
      this.sessions.delete(sessionId);
      return {
        success: false,
        message: 'Maximum attempts exceeded. Please request a new OTP.'
      };
    }

    session.attempts++;

    if (session.otp !== enteredOTP) {
      return {
        success: false,
        message: `Invalid OTP. ${this.MAX_ATTEMPTS - session.attempts} attempts remaining.`
      };
    }

    session.verified = true;
    
    return {
      success: true,
      message: 'OTP verified successfully!'
    };
  }

  // Check if session is verified
  isSessionVerified(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return session ? session.verified : false;
  }

  // Get session info
  getSession(sessionId: string): OTPSession | null {
    return this.sessions.get(sessionId) || null;
  }

  // Clean up expired sessions
  private cleanupExpiredSessions(): void {
    const now = new Date();
    const entries = Array.from(this.sessions.entries());
    for (const [sessionId, session] of entries) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // Resend OTP
  async resendOTP(sessionId: string): Promise<{ success: boolean; message: string; newSessionId?: string }> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session not found. Please start verification again.'
      };
    }

    // Delete old session
    this.sessions.delete(sessionId);

    // Send new OTP
    if (session.type === 'phone' && session.phoneNumber) {
      const result = await this.sendPhoneOTP(session.phoneNumber);
      return {
        success: result.success,
        message: result.message,
        newSessionId: result.sessionId
      };
    } else if (session.type === 'aadhaar' && session.aadhaarNumber) {
      const result = await this.sendAadhaarOTP(session.aadhaarNumber);
      return {
        success: result.success,
        message: result.message,
        newSessionId: result.sessionId
      };
    }

    return {
      success: false,
      message: 'Unable to resend OTP. Please start verification again.'
    };
  }
}

// Export singleton instance
export const otpService = new OTPService();

// Export generateOTP function for direct use
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
