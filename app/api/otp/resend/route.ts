import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/utils/otpService';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const result = await otpService.resendOTP(sessionId);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      sessionId: result.newSessionId
    });

  } catch (error) {
    console.error('OTP Resend API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to resend OTP. Please try again.' },
      { status: 500 }
    );
  }
}
