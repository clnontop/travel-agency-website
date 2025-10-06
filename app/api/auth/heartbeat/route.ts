import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Heartbeat endpoint for session keep-alive
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const deviceId = request.headers.get('x-device-id');
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'No token provided' 
      }, { status: 401 });
    }

    // Validate session
    const user = AuthService.validateSession(token);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid session' 
      }, { status: 401 });
    }

    // Update session last activity
    const updated = AuthService.updateSessionActivity(token, deviceId || undefined);
    
    return NextResponse.json({
      success: true,
      message: 'Heartbeat received',
      timestamp: new Date().toISOString(),
      sessionActive: updated
    });

  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
