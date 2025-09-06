import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { AuthResponse } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'Verification token is required'
      }, { status: 400 });
    }

    // Verify email token
    const verification = AuthService.verifyEmailToken(token);
    if (!verification) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'Invalid or expired verification token'
      }, { status: 400 });
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    }, { status: 200 });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json<AuthResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'Email is required'
      }, { status: 400 });
    }

    const user = AuthService.findUserByEmail(email);
    if (!user) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'Email is already verified'
      }, { status: 400 });
    }

    // Create new email verification
    const emailVerification = AuthService.createEmailVerification(user.id, user.email);
    console.log(`Email verification link: /verify-email?token=${emailVerification.token}`);

    return NextResponse.json<AuthResponse>({
      success: true,
      message: 'Verification email sent successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json<AuthResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
