import { NextRequest, NextResponse } from 'next/server';
import { whatsappOtpService } from '@/utils/whatsappOtpService';

// WhatsApp OTP API route
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

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    // Send OTP via WhatsApp
    const result = await whatsappOtpService.sendOTP(phoneNumber, otp);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        method: result.method,
        whatsappLink: result.whatsappLink,
        messageId: result.messageId,
        configStatus: whatsappOtpService.getConfigStatus()
      });
    } else {
      // If WhatsApp fails, we can fallback to email notification
      if (userEmail) {
        try {
          const emailResponse = await fetch(`${request.nextUrl.origin}/api/email/send-phone-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber,
              otp,
              userEmail
            })
          });

          const emailResult = await emailResponse.json();
          
          if (emailResult.success) {
            return NextResponse.json({
              success: true,
              message: `WhatsApp failed. ${emailResult.message}`,
              method: 'email-fallback',
              fallbackUsed: true
            });
          }
        } catch (emailError) {
          console.error('Email fallback failed:', emailError);
        }
      }

      return NextResponse.json(
        { 
          success: false, 
          message: result.message,
          method: result.method
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('WhatsApp OTP API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send WhatsApp OTP. Please try again.' },
      { status: 500 }
    );
  }
}

// GET method to check WhatsApp service status
export async function GET() {
  try {
    const configStatus = whatsappOtpService.getConfigStatus();
    
    return NextResponse.json({
      success: true,
      message: 'WhatsApp OTP service status',
      configStatus,
      available: configStatus.webLink, // Always true since web link is always available
      businessApiAvailable: configStatus.businessAPI
    });

  } catch (error) {
    console.error('WhatsApp status check error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check WhatsApp service status' },
      { status: 500 }
    );
  }
}
