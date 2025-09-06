import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/utils/otpService';
import { EmailOTPService } from '../send/route';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, otp } = await request.json();

    if (!sessionId || !otp) {
      return NextResponse.json(
        { success: false, message: 'Session ID and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    console.log(`🔍 Verifying OTP: ${otp} for session: ${sessionId}`);
    
    // Check if it's an email session (starts with 'email_')
    if (sessionId.startsWith('email_')) {
      const result = EmailOTPService.verifyEmailOTP(sessionId, otp);
      console.log(`📧 Email OTP verification result:`, result);
      
      return NextResponse.json({
        success: result.success,
        message: result.message,
        verified: result.success,
        type: 'email'
      });
    } else {
      // Handle phone OTP verification
      const result = await otpService.verifyOTP(sessionId, otp);
      console.log(`📱 Phone OTP verification result:`, result);

      if (result.success) {
        const session = otpService.getSession(sessionId);
        console.log(`📱 Verification successful for phone: ${session?.phoneNumber}`);
        return NextResponse.json({
          success: true,
          message: result.message,
          verified: true,
          phoneNumber: session?.phoneNumber,
          type: 'phone'
        });
      }

      return NextResponse.json({
        success: false,
        message: result.message,
        verified: false
      });
    }

  } catch (error) {
    console.error('OTP Verify API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
