import { NextRequest, NextResponse } from 'next/server';
import { securePhoneVerification } from '@/utils/securePhoneVerification';

// Secure phone verification route with rate limiting and security measures
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    // Validate input
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Send OTP using secure verification service
    const result = await securePhoneVerification.sendOTP(phoneNumber);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: result.message,
          cooldownSeconds: result.cooldownSeconds 
        },
        { status: 429 } // Too Many Requests
      );
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      sessionId: result.sessionId,
      otp: result.otp, // Only in development
      method: result.method,
      whatsappLink: result.whatsappLink
    });

  } catch (error) {
    console.error('Secure OTP API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    );
  }
}
