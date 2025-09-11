import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Cross-device session management API
export async function POST(request: NextRequest) {
  try {
    const { action, token, email, password, userType, deviceInfo } = await request.json();
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    switch (action) {
      case 'login':
        // Authenticate user
        const user = AuthService.findUserByEmail(email);
        if (!user || !(await AuthService.verifyPassword(password, user.password))) {
          return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        // Create new session
        const session = AuthService.createSession(user.id, deviceInfo, clientIP);
        
        // Return user data and session token
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({
          success: true,
          user: userWithoutPassword,
          token: session.token,
          sessionId: session.id
        });

      case 'validate':
        // Validate existing session token
        const validUser = AuthService.validateSession(token);
        if (!validUser) {
          return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
        }

        const { password: __, ...validUserWithoutPassword } = validUser;
        return NextResponse.json({
          success: true,
          user: validUserWithoutPassword,
          valid: true
        });

      case 'logout':
        // Invalidate session
        const logoutSuccess = AuthService.logout(token);
        return NextResponse.json({ success: logoutSuccess });

      case 'refresh':
        // Refresh session (extend expiry)
        const currentUser = AuthService.validateSession(token);
        if (!currentUser) {
          return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
        }

        // Create new session and invalidate old one
        AuthService.logout(token);
        const newSession = AuthService.createSession(currentUser.id, deviceInfo, clientIP);
        
        const { password: ___, ...refreshedUser } = currentUser;
        return NextResponse.json({
          success: true,
          user: refreshedUser,
          token: newSession.token,
          sessionId: newSession.id
        });

      default:
        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    const user = AuthService.validateSession(token);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      valid: true
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
