import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/userStorage';

// Store password reset tokens (in production, use Redis or database)
const resetTokens = new Map<string, { userId: string; email: string; expiresAt: Date }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email is required'
      }, { status: 400 });
    }

    // Find user by email
    const user = findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token
    resetTokens.set(resetToken, {
      userId: user.id,
      email: user.email,
      expiresAt
    });

    // In a real app, send email here
    console.log(`🔐 Password reset token for ${email}: ${resetToken}`);
    console.log(`🔗 Reset link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`);

    // Simulate email sending
    const emailContent = {
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    // Log email content for demo
    console.log('📧 Email would be sent:', emailContent);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
      // Include token in response for demo purposes (remove in production)
      resetToken: resetToken
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Reset token is required'
      }, { status: 400 });
    }

    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired reset token'
      }, { status: 400 });
    }

    if (new Date() > tokenData.expiresAt) {
      resetTokens.delete(token);
      return NextResponse.json({
        success: false,
        message: 'Reset token has expired'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      email: tokenData.email
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
