import { NextRequest, NextResponse } from 'next/server';
import { customSmsService } from '@/utils/customSmsService';

// Custom SMS API route using our own email-to-SMS gateway
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, userEmail } = await request.json();

    // Validate input
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Send OTP using our custom SMS service
    const result = await customSmsService.sendOTP(phoneNumber, otp, userEmail);

    console.log(`📱 Custom SMS result for ${phoneNumber}:`, result);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      method: result.method,
      whatsappLink: result.whatsappLink
    });

  } catch (error) {
    console.error('Custom SMS API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send SMS. Please try again.' },
      { status: 500 }
    );
  }
}

// Test connectivity endpoint
export async function GET() {
  try {
    const connectivity = await customSmsService.testConnectivity();
    
    return NextResponse.json({
      success: true,
      connectivity,
      message: 'SMS service status checked'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to check connectivity' },
      { status: 500 }
    );
  }
}
