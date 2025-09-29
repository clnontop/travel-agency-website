import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { findUserByEmail, createUser } from '@/lib/userStorage';
import { AuthTokenUtils } from '@/utils/authUtils';
import { User } from '@/types/auth';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: NextRequest) {
  try {
    const { credential, userType } = await request.json();

    if (!credential) {
      return NextResponse.json({
        success: false,
        message: 'Google credential is required'
      }, { status: 400 });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({
        success: false,
        message: 'Invalid Google token'
      }, { status: 401 });
    }

    const {
      sub: googleId,
      email,
      name,
      given_name: firstName,
      family_name: lastName,
      picture: profilePicture,
      email_verified: emailVerified
    } = payload;

    if (!email || !emailVerified) {
      return NextResponse.json({
        success: false,
        message: 'Email verification required'
      }, { status: 401 });
    }

    // Check if user already exists
    let user = findUserByEmail(email);

    if (user) {
      // Update existing user with Google info
      user.googleId = googleId;
      user.profilePicture = profilePicture;
      user.isEmailVerified = true;
      user.lastLogin = new Date();
      user.isActive = true;

      // If user type doesn't match, update it
      if (userType && user.type !== userType) {
        user.type = userType;
      }
    } else {
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        googleId,
        firstName: firstName || name?.split(' ')[0] || 'User',
        lastName: lastName || name?.split(' ').slice(1).join(' ') || '',
        name: name || `${firstName} ${lastName}`,
        email,
        password: AuthTokenUtils.hashPassword(`google_${googleId}_${Date.now()}`), // Generate secure password
        phone: '',
        aadhaarNumber: '',
        aadhaarEmail: '',
        type: userType || 'customer',
        isEmailVerified: true,
        isAadhaarVerified: false,
        profilePicture,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      };

      createUser(newUser);
      user = newUser;
    }

    // Generate token
    const token = AuthTokenUtils.generateUserToken(user.id, user.email);

    // Return success without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Google sign-in successful',
      user: userWithoutPassword,
      token,
      isNewUser: !findUserByEmail(email)
    }, { status: 200 });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json({
      success: false,
      message: 'Google sign-in failed. Please try again.'
    }, { status: 500 });
  }
}

// Handle Google OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({
        success: false,
        message: 'Authorization code is required'
      }, { status: 400 });
    }

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info
    const userInfoResponse = await client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });

    const userInfo = userInfoResponse.data as any;

    // Process user info similar to POST method
    const userType = state || 'customer'; // Use state parameter for user type

    let user = findUserByEmail(userInfo.email);

    if (!user) {
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        googleId: userInfo.id,
        firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || 'User',
        lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
        name: userInfo.name || `${userInfo.given_name} ${userInfo.family_name}`,
        email: userInfo.email,
        password: AuthTokenUtils.hashPassword(`google_${userInfo.id}_${Date.now()}`),
        phone: '',
        aadhaarNumber: '',
        aadhaarEmail: '',
        type: userType,
        isEmailVerified: true,
        isAadhaarVerified: false,
        profilePicture: userInfo.picture,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      };

      createUser(newUser);
      user = newUser;
    }

    // Redirect to appropriate dashboard
    const redirectUrl = user.type === 'driver' ? '/driver' : '/customer';
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=google_auth_failed', request.url));
  }
}
