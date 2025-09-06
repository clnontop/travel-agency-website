import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/userStorage';

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
    console.log(`🔍 Login attempt for: ${email}`);
    console.log(`👤 User found:`, user ? `${user.name} (${user.type})` : 'Not found');
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Verify password (in production, use proper password hashing)
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check user type if provided
    if (type && user.type !== type) {
      return NextResponse.json({
        success: false,
        message: `This account is registered as a ${user.type}, not a ${type}`
      }, { status: 401 });
    }

    console.log(`✅ Login successful: ${user.name} (${user.email}) as ${user.type}`);

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
