import { NextRequest, NextResponse } from 'next/server';
import { emailPhoneVerificationService } from '@/utils/emailPhoneVerificationService';

// Phone verification via email API routes
export async function POST(request: NextRequest) {
  try {
    const { action, phoneNumber, userEmail, verificationId, otp } = await request.json();

    switch (action) {
      case 'send':
        return await handleSendVerification(phoneNumber, userEmail);
      
      case 'verify':
        return await handleVerifyOTP(verificationId, otp);
      
      case 'resend':
        return await handleResendVerification(verificationId);
      
      case 'status':
        return await handleGetStatus(verificationId);
      
      case 'verify-phone':
        return await handleVerifyPhoneChallenge(verificationId, request);
      
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action. Use: send, verify, resend, status, or verify-phone' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Phone verification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Phone verification service error' },
      { status: 500 }
    );
  }
}

// Handle sending verification email
async function handleSendVerification(phoneNumber: string, userEmail: string) {
  if (!phoneNumber || !userEmail) {
    return NextResponse.json(
      { success: false, message: 'Phone number and email are required' },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return NextResponse.json(
      { success: false, message: 'Invalid email format' },
      { status: 400 }
    );
  }

  // Validate phone number format
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  if (!phoneRegex.test(cleanPhone) || cleanPhone.length < 10) {
    return NextResponse.json(
      { success: false, message: 'Invalid phone number format' },
      { status: 400 }
    );
  }

  const result = await emailPhoneVerificationService.sendVerificationEmail(phoneNumber, userEmail);
  
  return NextResponse.json(result, { 
    status: result.success ? 200 : 500 
  });
}

// Handle OTP verification
async function handleVerifyOTP(verificationId: string, otp: string) {
  if (!verificationId || !otp) {
    return NextResponse.json(
      { success: false, message: 'Verification ID and OTP are required' },
      { status: 400 }
    );
  }

  // Validate OTP format
  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json(
      { success: false, message: 'OTP must be 6 digits' },
      { status: 400 }
    );
  }

  const result = await emailPhoneVerificationService.verifyOTP(verificationId, otp);
  
  return NextResponse.json(result, { 
    status: result.success ? 200 : 400 
  });
}

// Handle resending verification
async function handleResendVerification(verificationId: string) {
  if (!verificationId) {
    return NextResponse.json(
      { success: false, message: 'Verification ID is required' },
      { status: 400 }
    );
  }

  const result = await emailPhoneVerificationService.resendVerification(verificationId);
  
  return NextResponse.json(result, { 
    status: result.success ? 200 : 400 
  });
}

// Handle phone challenge verification
async function handleVerifyPhoneChallenge(verificationId: string, request: NextRequest) {
  const { challengeResponse } = await request.json();
  
  if (!verificationId || !challengeResponse) {
    return NextResponse.json(
      { success: false, message: 'Verification ID and challenge response are required' },
      { status: 400 }
    );
  }

  const result = await emailPhoneVerificationService.verifyPhoneChallenge(verificationId, challengeResponse);
  
  return NextResponse.json(result, { 
    status: result.success ? 200 : 400 
  });
}

// Handle status check
async function handleGetStatus(verificationId: string) {
  if (!verificationId) {
    return NextResponse.json(
      { success: false, message: 'Verification ID is required' },
      { status: 400 }
    );
  }

  const status = emailPhoneVerificationService.getVerificationStatus(verificationId);
  
  return NextResponse.json({
    success: true,
    message: 'Verification status retrieved',
    ...status
  });
}

// GET method for service health check
export async function GET() {
  try {
    const activeCount = emailPhoneVerificationService.getActiveVerificationsCount();
    
    return NextResponse.json({
      success: true,
      message: 'Email phone verification service is running',
      activeVerifications: activeCount,
      methods: {
        send: 'POST with action: "send", phoneNumber, userEmail',
        verify: 'POST with action: "verify", verificationId, otp',
        resend: 'POST with action: "resend", verificationId',
        status: 'POST with action: "status", verificationId'
      }
    });

  } catch (error) {
    console.error('Service health check error:', error);
    return NextResponse.json(
      { success: false, message: 'Service health check failed' },
      { status: 500 }
    );
  }
}
