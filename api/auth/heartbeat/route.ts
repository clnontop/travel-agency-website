import { NextRequest, NextResponse } from 'next/server';

// Simple heartbeat tracking (in production, use Redis or database)
const activeHeartbeats = new Map<string, {
  deviceId: string;
  lastHeartbeat: Date;
  sessionToken: string;
}>();

// Cleanup old heartbeats every 5 minutes
setInterval(() => {
  const now = new Date();
  const expiredHeartbeats: string[] = [];
  
  activeHeartbeats.forEach((heartbeat, key) => {
    const timeSinceHeartbeat = now.getTime() - heartbeat.lastHeartbeat.getTime();
    const maxInactivity = 5 * 60 * 1000; // 5 minutes
    
    if (timeSinceHeartbeat > maxInactivity) {
      expiredHeartbeats.push(key);
    }
  });
  
  expiredHeartbeats.forEach(key => {
    activeHeartbeats.delete(key);
  });
  
  if (expiredHeartbeats.length > 0) {
    console.log(`💓 Cleaned up ${expiredHeartbeats.length} expired heartbeats`);
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const deviceId = request.headers.get('x-device-id');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const body = await request.json();
    
    // Store heartbeat
    const heartbeatKey = `${deviceId}_${token.substring(0, 10)}`;
    activeHeartbeats.set(heartbeatKey, {
      deviceId: deviceId || 'unknown',
      lastHeartbeat: new Date(),
      sessionToken: token
    });

    console.log(`💓 Heartbeat received from device: ${deviceId?.substring(0, 12)}...`);

    return NextResponse.json({
      success: true,
      message: 'Heartbeat recorded',
      activeDevices: activeHeartbeats.size,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ success: false, message: 'Heartbeat failed' });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Find heartbeats for this session
    const sessionHeartbeats = Array.from(activeHeartbeats.entries())
      .filter(([key, heartbeat]) => heartbeat.sessionToken === token)
      .map(([key, heartbeat]) => ({
        deviceId: heartbeat.deviceId,
        lastHeartbeat: heartbeat.lastHeartbeat,
        isActive: (Date.now() - heartbeat.lastHeartbeat.getTime()) < 60000 // Active if heartbeat within 1 minute
      }));

    return NextResponse.json({
      success: true,
      devices: sessionHeartbeats,
      totalActiveDevices: activeHeartbeats.size
    });

  } catch (error) {
    console.error('Heartbeat status error:', error);
    return NextResponse.json({ success: false, message: 'Failed to get heartbeat status' });
  }
}
