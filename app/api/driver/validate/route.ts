import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { User } from '@/store/useAuth';

// Driver validation API for mobile app authentication
export async function POST(request: NextRequest) {
  try {
    const { driverId, deviceInfo } = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token || !driverId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing token or driver ID' 
      }, { status: 400 });
    }

    // Validate session token
    const user = AuthService.validateSession(token) as User | null;
    if (!user || user.id !== driverId || user.type !== 'driver') {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid driver credentials' 
      }, { status: 401 });
    }

    // Log device connection
    console.log(`📱 Driver app connected:`, {
      driverId: user.id,
      name: user.name,
      deviceInfo,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      driver: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vehicleType: user.vehicleType,
        licenseNumber: user.licenseNumber,
        isAvailable: user.isAvailable
      },
      message: 'Driver validated successfully'
    });

  } catch (error) {
    console.error('Driver validation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
