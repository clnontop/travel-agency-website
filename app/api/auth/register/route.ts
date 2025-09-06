import { NextRequest, NextResponse } from 'next/server';
import { userStorage, findUserByEmail, createUser, getUserCount, User } from '@/lib/userStorage';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, userId, type } = await request.json();

    // Validation
    if (!email || !password || !name || !userId || !type) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 });
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    // Create user
    const newUser: User = {
      id: userId,
      name,
      email,
      password,
      type: type as 'customer' | 'driver',
      createdAt: new Date()
    };

    // Store user
    createUser(newUser);

    console.log(`✅ User registered successfully: ${name} (${email}) as ${type}`);
    console.log(`👤 Total users: ${getUserCount()}`);
    console.log(`📧 Registered users:`, Array.from(userStorage.values()).map(u => `${u.name} (${u.email})`));

    // Return success without password
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'Registration successful! You can now sign in.',
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
