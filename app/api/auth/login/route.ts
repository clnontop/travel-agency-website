import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateUser } from '@/lib/userStorage';
import { AuthTokenUtils } from '@/utils/authUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, type } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Find user by email
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      }, { status: 403 });
    }

    // Verify password with both new secure hash and legacy plaintext support
    const isPasswordValid = AuthTokenUtils.verifyPassword(password, user.password) || user.password === password;
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }
    
    // Migrate plaintext password to secure hash if needed
    if (user.password === password && !AuthTokenUtils.verifyPassword(password, user.password)) {
      const hashedPassword = AuthTokenUtils.hashPassword(password);
      updateUser(user.email, { password: hashedPassword });
      user.password = hashedPassword; // Update local copy
    }

    // Check user type if provided
    if (type && user.type !== type) {
      return NextResponse.json({
        success: false,
        message: `This account is registered as a ${user.type}, not a ${type}`
      }, { status: 401 });
    }

    // Update last login
    user.lastLogin = new Date();
    user.isActive = true;

    // Generate simple token
    const token = `token_${user.id}_${Date.now()}`;

    // Return success without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
