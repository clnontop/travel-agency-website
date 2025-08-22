// Email + Phone Validation Service
// Sends OTP to user's email for phone verification when SMS/WhatsApp fails
// Now includes actual phone number validation and verification challenges

import { phoneValidationService } from './phoneValidationService';

interface EmailPhoneVerificationResponse {
  success: boolean;
  message: string;
  method: string;
  verificationId?: string;
  expiresAt?: string;
  phoneChallenge?: {
    type: string;
    instructions: string;
    verificationCode?: string;
  };
}

interface VerificationRecord {
  phoneNumber: string;
  otp: string;
  userEmail: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  phoneValidated: boolean;
  phoneChallenge?: {
    type: string;
    verificationCode: string;
    expectedResponse: string;
    challengeVerified: boolean;
  };
}

class EmailPhoneVerificationService {
  private verificationStore: Map<string, VerificationRecord> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  constructor() {
    // Clean up expired verifications every 10 minutes
    setInterval(() => this.cleanupExpiredVerifications(), 10 * 60 * 1000);
  }

  // Generate secure 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate unique verification ID
  private generateVerificationId(): string {
    return `email_phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Format phone number for display
  private formatPhoneForDisplay(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substr(0, 5)} ${cleaned.substr(5)}`;
    }
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+91 ${cleaned.substr(2, 5)} ${cleaned.substr(7)}`;
    }
    return phoneNumber;
  }

  // Clean up expired verifications
  private cleanupExpiredVerifications(): void {
    const now = new Date();
    const entries = Array.from(this.verificationStore.entries());
    for (const [id, record] of entries) {
      if (record.expiresAt < now) {
        this.verificationStore.delete(id);
      }
    }
  }

  // Send verification email with OTP
  async sendVerificationEmail(phoneNumber: string, userEmail: string): Promise<EmailPhoneVerificationResponse> {
    try {
      const otp = this.generateOTP();
      const verificationId = this.generateVerificationId();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

      // Validate phone number first
      const phoneValidation = await phoneValidationService.validatePhoneNumber(phoneNumber);
      if (!phoneValidation.isValid) {
        return {
          success: false,
          message: `Invalid phone number format for ${phoneValidation.country}`,
          method: 'email-phone-verification'
        };
      }

      // Generate phone verification challenge
      const phoneChallenge = await phoneValidationService.generatePhoneChallenge(phoneNumber);
      
      // Store verification record
      const record: VerificationRecord = {
        phoneNumber: phoneValidation.formatted,
        otp,
        userEmail,
        createdAt: now,
        expiresAt,
        attempts: 0,
        verified: false,
        phoneValidated: phoneValidation.isValid,
        phoneChallenge: phoneChallenge.success ? {
          type: phoneChallenge.challenge!.type,
          verificationCode: phoneChallenge.challenge!.verificationCode || '',
          expectedResponse: phoneChallenge.challenge!.expectedResponse || '',
          challengeVerified: false
        } : undefined
      };

      this.verificationStore.set(verificationId, record);

      // Send email via existing API
      const emailResponse = await fetch('/api/email/send-phone-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: record.phoneNumber,
          otp,
          userEmail,
          verificationId,
          expiresAt: expiresAt.toISOString(),
          phoneChallenge: phoneChallenge.success ? phoneChallenge.challenge : undefined
        })
      });

      const emailResult = await emailResponse.json();

      if (emailResult.success) {
        return {
          success: true,
          message: `Phone verification code sent to ${userEmail.replace(/(.{2}).*(@.*)/, '$1****$2')}`,
          method: 'email-phone-verification',
          verificationId,
          expiresAt: expiresAt.toISOString(),
          phoneChallenge: phoneChallenge.success ? {
            type: phoneChallenge.challenge!.type,
            instructions: phoneChallenge.challenge!.instructions,
            verificationCode: phoneChallenge.challenge!.verificationCode
          } : undefined
        };
      } else {
        this.verificationStore.delete(verificationId);
        return {
          success: false,
          message: 'Failed to send verification email',
          method: 'email-phone-verification'
        };
      }

    } catch (error) {
      console.error('Email phone verification error:', error);
      return {
        success: false,
        message: 'Verification service error',
        method: 'email-phone-verification'
      };
    }
  }

  // Verify phone challenge response
  async verifyPhoneChallenge(verificationId: string, challengeResponse: string): Promise<EmailPhoneVerificationResponse> {
    const record = this.verificationStore.get(verificationId);

    if (!record || !record.phoneChallenge) {
      return {
        success: false,
        message: 'Invalid verification ID or no phone challenge found',
        method: 'email-phone-verification'
      };
    }

    if (record.phoneChallenge.challengeVerified) {
      return {
        success: true,
        message: 'Phone challenge already completed',
        method: 'email-phone-verification'
      };
    }

    // Verify the challenge response
    const challengeResult = await phoneValidationService.verifyPhoneChallenge(
      record.phoneNumber,
      record.phoneChallenge.type,
      record.phoneChallenge.verificationCode,
      challengeResponse
    );

    if (challengeResult.success) {
      record.phoneChallenge.challengeVerified = true;
      return {
        success: true,
        message: challengeResult.message,
        method: 'email-phone-verification',
        verificationId
      };
    } else {
      return {
        success: false,
        message: challengeResult.message,
        method: 'email-phone-verification'
      };
    }
  }

  // Verify OTP entered by user
  async verifyOTP(verificationId: string, enteredOTP: string): Promise<EmailPhoneVerificationResponse> {
    const record = this.verificationStore.get(verificationId);

    if (!record) {
      return {
        success: false,
        message: 'Invalid or expired verification ID',
        method: 'email-phone-verification'
      };
    }

    const now = new Date();

    // Check if expired
    if (record.expiresAt < now) {
      this.verificationStore.delete(verificationId);
      return {
        success: false,
        message: 'Verification code has expired',
        method: 'email-phone-verification'
      };
    }

    // Check if already verified
    if (record.verified) {
      return {
        success: false,
        message: 'This verification code has already been used',
        method: 'email-phone-verification'
      };
    }

    // Increment attempts
    record.attempts++;

    // Check max attempts
    if (record.attempts > this.MAX_ATTEMPTS) {
      this.verificationStore.delete(verificationId);
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new code.',
        method: 'email-phone-verification'
      };
    }

    // Verify OTP
    if (record.otp === enteredOTP) {
      // Check if phone challenge is also required and completed
      if (record.phoneChallenge && !record.phoneChallenge.challengeVerified) {
        return {
          success: false,
          message: 'OTP verified, but phone challenge still pending. Complete the phone verification challenge sent in your email.',
          method: 'email-phone-verification'
        };
      }

      record.verified = true;
      return {
        success: true,
        message: `Phone number ${this.formatPhoneForDisplay(record.phoneNumber)} fully verified successfully`,
        method: 'email-phone-verification',
        verificationId
      };
    } else {
      const remainingAttempts = this.MAX_ATTEMPTS - record.attempts;
      return {
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
        method: 'email-phone-verification'
      };
    }
  }

  // Resend verification code
  async resendVerification(verificationId: string): Promise<EmailPhoneVerificationResponse> {
    const record = this.verificationStore.get(verificationId);

    if (!record) {
      return {
        success: false,
        message: 'Invalid verification ID',
        method: 'email-phone-verification'
      };
    }

    if (record.verified) {
      return {
        success: false,
        message: 'Phone number already verified',
        method: 'email-phone-verification'
      };
    }

    // Generate new OTP and extend expiry
    const newOTP = this.generateOTP();
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    record.otp = newOTP;
    record.expiresAt = newExpiresAt;
    record.attempts = 0; // Reset attempts

    // Send new email
    const emailResponse = await fetch('/api/email/send-phone-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: record.phoneNumber,
        otp: newOTP,
        userEmail: record.userEmail,
        verificationId,
        expiresAt: newExpiresAt.toISOString(),
        isResend: true
      })
    });

    const emailResult = await emailResponse.json();

    if (emailResult.success) {
      return {
        success: true,
        message: `New verification code sent to ${record.userEmail.replace(/(.{2}).*(@.*)/, '$1****$2')}`,
        method: 'email-phone-verification',
        verificationId,
        expiresAt: newExpiresAt.toISOString()
      };
    } else {
      return {
        success: false,
        message: 'Failed to resend verification code',
        method: 'email-phone-verification'
      };
    }
  }

  // Get verification status
  getVerificationStatus(verificationId: string): {
    exists: boolean;
    verified: boolean;
    expired: boolean;
    phoneNumber?: string;
    attemptsRemaining?: number;
  } {
    const record = this.verificationStore.get(verificationId);

    if (!record) {
      return { exists: false, verified: false, expired: false };
    }

    const now = new Date();
    const expired = record.expiresAt < now;

    return {
      exists: true,
      verified: record.verified,
      expired,
      phoneNumber: record.phoneNumber,
      attemptsRemaining: Math.max(0, this.MAX_ATTEMPTS - record.attempts)
    };
  }

  // Get active verifications count (for monitoring)
  getActiveVerificationsCount(): number {
    const now = new Date();
    let count = 0;
    const records = Array.from(this.verificationStore.values());
    for (const record of records) {
      if (record.expiresAt > now && !record.verified) {
        count++;
      }
    }
    return count;
  }
}

export const emailPhoneVerificationService = new EmailPhoneVerificationService();
export default emailPhoneVerificationService;
