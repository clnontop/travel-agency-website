import { NextRequest, NextResponse } from 'next/server';
import { findUserById, userStorage } from '@/lib/userStorage';

// Import reset tokens from forgot-password (in production, use shared storage)
const resetTokens = new Map<string, { userId: string; email: string; expiresAt: Date }>();

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({
        success: false,
        message: 'Reset token and new password are required'
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 6 characters long'
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

    // Find and update user password
    const user = findUserById(tokenData.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Update password (in production, hash the password)
    user.password = newPassword;
    userStorage.set(user.id, user);

    // Remove used token
    resetTokens.delete(token);

    console.log(`🔐 Password reset successful for: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
