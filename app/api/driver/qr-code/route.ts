import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { User } from '@/types/auth';

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

    // Validate driver exists
    const driver = AuthService.findUserById(driverId);
    if (!driver) {
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

    // Generate QR code data with location and job info
    const qrData = {
      type: 'driver_auth',
      driverId: driver.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
      sessionToken: session.token,
      timestamp: Date.now(),
      appUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/driver-app`,
      location: {
        enabled: true,
        trackingId: `TRACK_${driver.id}_${Date.now()}`,
        shareWithCustomers: true
      },
      jobActions: {
        pickup: true,
        delivery: true,
        locationCheckin: true,
        customerVerification: true
      },
      instructions: {
        step1: `Scan this QR code with ${driver.firstName}'s mobile device`,
        step2: 'Open the driver app and allow location permissions',
        step3: 'Start sharing live location with customers',
        step4: 'Use QR scanner for job actions'
      },
      driverInfo: {
        id: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        email: driver.email,
        vehicleType: 'Truck',
        status: 'available',
        currentLocation: null
      },
      expiresAt: session.expiresAt
    };

    console.log(`📱 QR Code generated for driver:`, {
      driverId,
      driverName: `${driver.firstName} ${driver.lastName}`,
      sessionId: session.id
    });

    return NextResponse.json({
      success: true,
      qrData: JSON.stringify(qrData),
      driver: {
        id: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        email: driver.email,
        vehicleType: 'Truck'
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
