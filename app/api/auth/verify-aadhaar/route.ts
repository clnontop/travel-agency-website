import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { aadhaarNumber, aadhaarEmail } = await request.json();

    // Validation
    if (!aadhaarNumber || !aadhaarEmail) {
      return NextResponse.json({
        success: false,
        message: 'Aadhaar number and email are required'
      }, { status: 400 });
    }

    // Validate Aadhaar format
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber.replace(/\s/g, ''))) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid 12-digit Aadhaar number'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(aadhaarEmail)) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email address'
      }, { status: 400 });
    }

    // Check if Aadhaar is already registered
    const existingUser = AuthService.findUserByAadhaar(aadhaarNumber);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'This Aadhaar number is already registered'
      }, { status: 409 });
    }

    // Perform real-time Aadhaar verification
    const isVerified = await AuthService.verifyAadhaar(aadhaarNumber, aadhaarEmail);
    
    if (isVerified) {
      return NextResponse.json({
        success: true,
        message: 'Aadhaar verified successfully',
        verified: true
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Aadhaar verification failed. Please check your details and try again.',
        verified: false
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Aadhaar verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error during verification'
    }, { status: 500 });
  }
}
