import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// QR Code generation for driver app authentication
export async function POST(request: NextRequest) {
  try {
    const { driverId } = await request.json();

    if (!driverId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Driver ID is required' 
      }, { status: 400 });
    }

    // Find driver
    const driver = AuthService.findUserById(driverId);
    if (!driver || driver.type !== 'driver') {
      return NextResponse.json({ 
        success: false, 
        message: 'Driver not found' 
      }, { status: 404 });
    }

    // Create session for driver app
    const session = AuthService.createSession(
      driverId, 
      'Driver Mobile App', 
      'QR Code Auth'
    );

    // Generate QR code data
    const qrData = {
      type: 'trinck_driver_auth',
      driverId: driverId,
      token: session.token,
      driverName: driver.name,
      expiresAt: session.expiresAt,
      generatedAt: new Date()
    };

    console.log(`📱 QR Code generated for driver:`, {
      driverId,
      driverName: driver.name,
      sessionId: session.id
    });

    return NextResponse.json({
      success: true,
      qrData: JSON.stringify(qrData),
      driver: {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        vehicleType: driver.vehicleType
      },
      expiresAt: session.expiresAt
    });

  } catch (error) {
    console.error('QR Code generation error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
