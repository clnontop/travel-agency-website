import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser, getUserCount, getAllUsers } from '@/lib/userStorage';
import { User } from '@/types/auth';
import { AuthTokenUtils } from '@/utils/authUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, type } = await request.json();

    // Validation
    if (!email || !password || !firstName || !lastName || !type) {
      return NextResponse.json({
        success: false,
        message: 'Email, password, first name, last name, and type are required'
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

    // Hash password securely
    const hashedPassword = AuthTokenUtils.hashPassword(password);
    
    // Create user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`, // For compatibility
      email,
      password: hashedPassword, // Now properly hashed
      phone: phone || '',
      aadhaarNumber: '', // Can be added later
      aadhaarEmail: '', // Can be added later
      type: type as string,
      isEmailVerified: false,
      isAadhaarVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store user
    createUser(newUser);

    // User registered successfully - don't log sensitive data

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
