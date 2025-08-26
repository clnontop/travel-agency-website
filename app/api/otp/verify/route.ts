import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/utils/otpService';

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
    
    const result = await otpService.verifyOTP(sessionId, otp);
    
    console.log(`✅ Verification result:`, result);

    if (result.success) {
      const session = otpService.getSession(sessionId);
      console.log(`📱 Verification successful for phone: ${session?.phoneNumber}`);
      return NextResponse.json({
        success: true,
        message: result.message,
        verified: true,
        phoneNumber: session?.phoneNumber,
        type: session?.type
      });
    }

    console.log(`❌ Verification failed: ${result.message}`);
    return NextResponse.json({
      success: false,
      message: result.message,
      verified: false
    });

  } catch (error) {
    console.error('OTP Verify API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
