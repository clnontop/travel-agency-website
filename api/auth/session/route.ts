import { NextRequest, NextResponse } from 'next/server';
import { AuthTokenUtils } from '@/utils/authUtils';

// In-memory session store (in production, use Redis or database)
const activeSessions = new Map<string, {
  userId: string;
  email: string;
  userType: string;
  deviceInfo: string;
  lastActivity: Date;
  createdAt: Date;
}>();

// Session cleanup interval (remove expired sessions)
setInterval(() => {
  const now = new Date();
  const expiredSessions: string[] = [];
  
  activeSessions.forEach((session, token) => {
    const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
    const maxInactivity = 24 * 60 * 60 * 1000; // 24 hours
    
    if (timeSinceActivity > maxInactivity) {
      expiredSessions.push(token);
    }
  });
  
  expiredSessions.forEach(token => {
    activeSessions.delete(token);
    console.log(`🧹 Cleaned up expired session: ${token.substring(0, 10)}...`);
  });
}, 60 * 60 * 1000); // Run every hour

// Load users from localStorage simulation (in production, use database)
function loadUsersFromStorage() {
  // For now, return empty array since we're using client-side auth
  // In production, this would query your actual database
  return [];
}

// Simulate user validation (replace with actual database lookup)
function validateUser(email: string, password: string, userType: string) {
  // For demo purposes, accept these test credentials
  const testUsers = [
    { email: 'customer@trinck.com', password: 'demo123', type: 'customer', id: 'customer_1', name: 'Demo Customer' },
    { email: 'driver@trinck.com', password: 'demo123', type: 'driver', id: 'driver_1', name: 'Demo Driver' },
  ];
  
  const user = testUsers.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password && 
    u.type === userType
  );
  
  return user || null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const session = activeSessions.get(token);

    if (!session) {
      return NextResponse.json({ success: false, message: 'Invalid or expired session' });
    }

    // Update last activity
    session.lastActivity = new Date();
    activeSessions.set(token, session);

    // In production, fetch user from database
    // For now, simulate user data
    const user = {
      id: session.userId,
      email: session.email,
      type: session.userType,
      lastActivity: session.lastActivity
    };

    return NextResponse.json({
      success: true,
      user,
      sessionInfo: {
        deviceInfo: session.deviceInfo,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({ success: false, message: 'Session validation failed' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, userType, deviceInfo, token } = body;

    switch (action) {
      case 'login':
        return handleLogin(email, password, userType, deviceInfo);
      
      case 'logout':
        return handleLogout(token);
      
      case 'refresh':
        return handleRefresh(token, deviceInfo);
      
      default:
        return NextResponse.json({ success: false, message: 'Invalid action' });
    }

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' });
  }
}

async function handleLogin(email: string, password: string, userType: string, deviceInfo: string) {
  try {
    // Validate user credentials
    const validUser = validateUser(email, password, userType);
    
    if (!validUser) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate session token
    const sessionToken = AuthTokenUtils.generateSessionToken();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Use validated user data
    const user = {
      id: validUser.id,
      name: validUser.name,
      email: validUser.email.toLowerCase(),
      type: validUser.type,
      lastLogin: new Date()
    };

    // Store active session
    activeSessions.set(sessionToken, {
      userId: user.id,
      email: user.email,
      userType: user.type,
      deviceInfo: deviceInfo || 'Unknown Device',
      lastActivity: new Date(),
      createdAt: new Date()
    });

    console.log(`✅ New session created:`, {
      sessionId,
      userId: user.id,
      email: user.email,
      deviceInfo,
      totalActiveSessions: activeSessions.size
    });

    return NextResponse.json({
      success: true,
      user,
      token: sessionToken,
      sessionId,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Login failed' });
  }
}

async function handleLogout(token: string) {
  try {
    if (token && activeSessions.has(token)) {
      const session = activeSessions.get(token);
      activeSessions.delete(token);
      
      console.log(`🔓 Session terminated:`, {
        userId: session?.userId,
        deviceInfo: session?.deviceInfo,
        remainingActiveSessions: activeSessions.size
      });
    }

    return NextResponse.json({ success: true, message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, message: 'Logout failed' });
  }
}

async function handleRefresh(token: string, deviceInfo: string) {
  try {
    const session = activeSessions.get(token);
    
    if (!session) {
      return NextResponse.json({ success: false, message: 'Invalid session' });
    }

    // Generate new token
    const newToken = AuthTokenUtils.generateSessionToken();
    
    // Update session with new token
    activeSessions.delete(token);
    activeSessions.set(newToken, {
      ...session,
      deviceInfo: deviceInfo || session.deviceInfo,
      lastActivity: new Date()
    });

    // Create user object
    const user = {
      id: session.userId,
      email: session.email,
      type: session.userType,
      lastActivity: new Date()
    };

    console.log(`🔄 Session refreshed:`, {
      userId: session.userId,
      oldToken: token.substring(0, 10) + '...',
      newToken: newToken.substring(0, 10) + '...',
      deviceInfo
    });

    return NextResponse.json({
      success: true,
      user,
      token: newToken,
      message: 'Session refreshed'
    });

  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json({ success: false, message: 'Session refresh failed' });
  }
}
