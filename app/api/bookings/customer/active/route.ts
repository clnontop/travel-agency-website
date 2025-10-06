import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock active booking for testing location tracking
    const mockBooking = {
      id: 'booking-123',
      driverId: 'driver-456',
      driverName: 'Rajesh Kumar',
      driverPhone: '+91 9876543210',
      vehicleType: 'Tata Ace',
      vehicleNumber: 'DL-01-AB-1234',
      pickup: 'Delhi Railway Station',
      destination: 'Gurgaon Cyber City',
      fare: 1500,
      status: 'ACCEPTED',
      estimatedTime: '45 mins',
      createdAt: new Date()
    };

    return NextResponse.json({
      success: true,
      booking: mockBooking
    });

  } catch (error) {
    console.error('Error fetching customer active booking:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
