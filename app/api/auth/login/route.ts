import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

    // Find user by email in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        customerProfile: true,
        driverProfile: true,
        adminProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check user type if provided
    const userType = user.role.toLowerCase();
    if (type && userType !== type) {
      return NextResponse.json({
        success: false,
        message: `This account is registered as a ${userType}, not a ${type}`
      }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Get wallet balance based on user type
    let walletBalance = 0;
    if (user.customerProfile) {
      walletBalance = Number(user.customerProfile.walletBalance);
    } else if (user.driverProfile) {
      walletBalance = Number(user.driverProfile.walletBalance);
    }

    // Return success with user data
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: userType,
        role: user.role,
        isEmailVerified: !!user.emailVerified,
        isPhoneVerified: !!user.phoneVerified,
        profilePicture: user.image,
        wallet: {
          balance: walletBalance,
          currency: 'INR',
          pending: 0,
          totalSpent: 0,
          totalEarned: 0
        },
        createdAt: user.createdAt,
        lastLogin: new Date()
      },
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
