import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/utils/otpService';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, type = 'phone' } = await request.json();

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

  } catch (error) {
    console.error('OTP Send API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
