import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { User } from '@/types/auth';

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

    // Validate driver session
    const user = AuthService.validateSession(token);
    if (!user || user.id !== driverId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid driver credentials' 
      }, { status: 401 });
    }

    // Log device connection
    console.log(`📱 Driver app connected:`, {
      driverId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      deviceInfo,
      timestamp: new Date().toISOString()
    });

    // Return driver validation success
    return NextResponse.json({
      success: true,
      message: 'Driver validated successfully',
      driver: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        vehicleType: 'Truck',
        licenseNumber: 'DL123456789',
        isAvailable: true
      }
    });

  } catch (error) {
    console.error('Driver validation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
