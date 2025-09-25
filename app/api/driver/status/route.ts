import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/userStorage';

// In-memory storage for driver status (replace with database in production)
const driverStatus = new Map();

export async function POST(request: NextRequest) {
  try {
    const { driverId, isOnline, location } = await request.json();

    if (!driverId || typeof isOnline !== 'boolean') {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Verify driver exists
    const driver = getUserById(driverId);
    if (!driver || driver.type !== 'driver') {
      return NextResponse.json({
        success: false,
        message: 'Driver not found'
      }, { status: 404 });
    }

    // Update driver status
    const statusData = {
      driverId,
      isOnline,
      location: location || null,
      lastStatusChange: new Date(),
      lastSeen: new Date()
    };

    driverStatus.set(driverId, statusData);

    // Update user storage
    updateUser(driverId, {
      isActive: isOnline,
      lastLogin: new Date(),
      currentLocation: location
    });

    console.log(`🚛 Driver ${driver.name} is now ${isOnline ? 'ONLINE' : 'OFFLINE'}`);

    return NextResponse.json({
      success: true,
      message: `Status updated to ${isOnline ? 'online' : 'offline'}`,
      status: {
        isOnline,
        lastUpdated: statusData.lastStatusChange
      }
    });

  } catch (error) {
    console.error('Driver status update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json({
        success: false,
        message: 'Driver ID is required'
      }, { status: 400 });
    }

    const status = driverStatus.get(driverId);
    if (!status) {
      return NextResponse.json({
        success: false,
        message: 'Driver status not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: {
        isOnline: status.isOnline,
        location: status.location,
        lastStatusChange: status.lastStatusChange,
        lastSeen: status.lastSeen
      }
    });

  } catch (error) {
    console.error('Driver status retrieval error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
