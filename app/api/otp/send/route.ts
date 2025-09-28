import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/utils/otpService';
import { EmailService } from '@/utils/emailService';

// Simple email OTP service with localStorage persistence
class EmailOTPService {
  private static sessions = new Map<string, {
    email: string;
    otp: string;
    expiresAt: Date;
    attempts: number;
  }>();

  private static STORAGE_KEY = 'email_otp_sessions';

  // Load sessions from localStorage if available
  private static loadSessions() {
    try {
      // Try global storage first (for server-side)
      if (typeof global !== 'undefined' && (global as any).emailOtpSessions) {
        this.sessions = (global as any).emailOtpSessions;
        return;
      }

      // For client-side or when global storage is not available
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const sessionsArray = JSON.parse(stored);
          this.sessions = new Map();
          sessionsArray.forEach(([key, value]: [string, any]) => {
            // Convert date string back to Date object
            value.expiresAt = new Date(value.expiresAt);
            this.sessions.set(key, value);
          });
        }
      }
    } catch (error) {
      console.error('Error loading OTP sessions:', error);
      this.sessions = new Map();
    }
  }

  // Save sessions to both global and localStorage
  private static saveSessions() {
    try {
      // Save to global storage (server-side)
      if (typeof global !== 'undefined') {
        (global as any).emailOtpSessions = this.sessions;
      }

      // Save to localStorage (client-side)
      if (typeof window !== 'undefined') {
        const sessionsArray = Array.from(this.sessions.entries());
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionsArray));
      }
    } catch (error) {
      console.error('Error saving OTP sessions:', error);
    }
  }

  static generateOTP(): string {
    // Use crypto-secure random number generation
    if (typeof window !== 'undefined' && window.crypto) {
      // Browser environment
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const randomNum = array[0] % 900000 + 100000;
      return randomNum.toString();
    } else {
      // Node.js environment
      const crypto = require('crypto');
      const randomBytes = crypto.randomBytes(4);
      const randomNum = randomBytes.readUInt32BE(0) % 900000 + 100000;
      return randomNum.toString();
    }
  }

  static generateSessionId(): string {
    const timestamp = Date.now();
    let randomPart: string;
    
    if (typeof window !== 'undefined' && window.crypto) {
      // Browser environment
      const array = new Uint8Array(8);
      window.crypto.getRandomValues(array);
      randomPart = Array.from(array, byte => byte.toString(36)).join('').substring(0, 9);
    } else {
      // Node.js environment
      const crypto = require('crypto');
      randomPart = crypto.randomBytes(8).toString('hex').substring(0, 9);
    }
    
    return `email_${timestamp}_${randomPart}`;
  }

  static async sendEmailOTP(email: string) {
    this.loadSessions();
    const otp = this.generateOTP();
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store session
    this.sessions.set(sessionId, {
      email,
      otp,
      expiresAt,
      attempts: 0
    });
    this.saveSessions();

    // Send actual email with OTP
    try {
      const emailResult = await EmailService.sendOTPEmail(email, otp);
      // Don't log sensitive OTP data in production
    } catch (error) {
      // Don't log sensitive OTP data in production
    }
    
    return {
      success: true,
      message: `OTP sent to ${email}. Please check your email.`,
      sessionId
    };
  }

  static verifyEmailOTP(sessionId: string, otp: string) {
    this.loadSessions();
    
    // Clean up expired sessions first
    const now = new Date();
    const sessionsToDelete: string[] = [];
    this.sessions.forEach((session, id) => {
      if (now > session.expiresAt) {
        sessionsToDelete.push(id);
      }
    });
    sessionsToDelete.forEach(id => this.sessions.delete(id));
    this.saveSessions();
    
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return { success: false, message: 'Invalid or expired session. Please request a new OTP.' };
    }

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      this.saveSessions();
      return { success: false, message: 'OTP expired. Please request a new one.' };
    }

    if (session.attempts >= 3) {
      this.sessions.delete(sessionId);
      this.saveSessions();
      return { success: false, message: 'Too many attempts. Please request a new OTP.' };
    }

    session.attempts++;
    this.saveSessions();

    if (session.otp === otp) {
      this.sessions.delete(sessionId);
      this.saveSessions();
      return { success: true, message: 'Email verified successfully!' };
    }

    return { success: false, message: `Invalid OTP. ${3 - session.attempts} attempts remaining.` };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, email, type = 'phone' } = await request.json();

    if (type === 'email') {
      // Handle email OTP
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email address is required' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }

      const result = await EmailOTPService.sendEmailOTP(email);
      return NextResponse.json(result);
    } else {
      // Handle phone OTP
      if (!phoneNumber) {
        return NextResponse.json(
          { success: false, message: 'Phone number is required' },
          { status: 400 }
        );
      }

      // Validate phone number format
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      if (cleanedPhone.length < 10) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number format' },
          { status: 400 }
        );
      }

      const result = await otpService.sendPhoneOTP(phoneNumber);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        sessionId: result.sessionId,
        whatsappLink: result.whatsappLink
      });
    }

  } catch (error) {
    console.error('OTP Send API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}

// Export the EmailOTPService for use in verify endpoint
export { EmailOTPService };
