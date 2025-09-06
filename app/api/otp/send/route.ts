import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/utils/otpService';
import { EmailService } from '@/utils/emailService';

// Simple email OTP service with persistent storage
class EmailOTPService {
  private static sessions = new Map<string, {
    email: string;
    otp: string;
    expiresAt: Date;
    attempts: number;
  }>();

  // Load sessions from global storage if available
  private static loadSessions() {
    if (typeof global !== 'undefined' && (global as any).emailOtpSessions) {
      this.sessions = (global as any).emailOtpSessions;
    }
  }

  // Save sessions to global storage
  private static saveSessions() {
    if (typeof global !== 'undefined') {
      (global as any).emailOtpSessions = this.sessions;
    }
  }

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateSessionId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
      console.log(`✅ Email OTP sent to ${email}: ${otp} (Session: ${sessionId})`);
    } catch (error) {
      console.log(`⚠️ Email sending failed, but OTP generated: ${otp} for ${email} (Session: ${sessionId})`);
    }
    
    // Always return success for demo purposes - OTP is logged to console
    console.log(`🔑 OTP for ${email}: ${otp}`);
    console.log(`📋 Session ID: ${sessionId}`);
    
    return {
      success: true,
      message: `OTP sent to ${email}. Check console for OTP code.`,
      sessionId
    };
  }

  static verifyEmailOTP(sessionId: string, otp: string) {
    this.loadSessions();
    const session = this.sessions.get(sessionId);
    
    console.log(`🔍 Looking for session: ${sessionId}`);
    console.log(`📋 Available sessions:`, Array.from(this.sessions.keys()));
    console.log(`🎯 Session found:`, session ? 'YES' : 'NO');
    
    if (!session) {
      return { success: false, message: 'Invalid session' };
    }

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return { success: false, message: 'OTP expired' };
    }

    if (session.attempts >= 3) {
      this.sessions.delete(sessionId);
      this.saveSessions();
      return { success: false, message: 'Too many attempts' };
    }

    session.attempts++;
    this.saveSessions();

    if (session.otp === otp) {
      this.sessions.delete(sessionId);
      this.saveSessions();
      return { success: true, message: 'OTP verified successfully' };
    }

    return { success: false, message: 'Invalid OTP' };
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
