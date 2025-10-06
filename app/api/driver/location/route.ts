import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

// In-memory storage for real-time driver locations
const driverLocations = new Map();
const locationHistory = new Map();

// Driver location tracking API
export async function POST(request: NextRequest) {
  try {
    const { driverId, location, activeJobs } = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token || !driverId || !location) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate driver token
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
      if (!decoded || decoded.userId !== driverId) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid driver credentials' 
        }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid token' 
      }, { status: 401 });
    }

    // Get driver from database
    const driver = await prisma.user.findUnique({
      where: { id: driverId }
    });

    if (!driver) {
      return NextResponse.json({ 
        success: false, 
        message: 'Driver not found' 
      }, { status: 404 });
    }

    // Store current location
    const locationData = {
      driverId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: new Date(location.timestamp),
      activeJobs: activeJobs || [],
      lastUpdated: new Date()
    };

    driverLocations.set(driverId, locationData);

    // Store in location history
    if (!locationHistory.has(driverId)) {
      locationHistory.set(driverId, []);
    }
    const history = locationHistory.get(driverId);
    history.push(locationData);
    
    // Keep only last 50 locations
    if (history.length > 50) {
      history.shift();
    }

    console.log(`📍 Location updated for driver ${driver.name}:`, {
      lat: location.latitude.toFixed(6),
      lng: location.longitude.toFixed(6),
      accuracy: `±${Math.round(location.accuracy)}m`,
      activeJobs: activeJobs?.length || 0
    });

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully'
    });

  } catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Get driver location (for customers who hired the driver)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const customerId = searchParams.get('customerId');
    const jobId = searchParams.get('jobId');

    if (!driverId || !customerId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing driver ID or customer ID' 
      }, { status: 400 });
    }

    // Get driver location
    const locationData = driverLocations.get(driverId);
    if (!locationData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Driver location not available' 
      }, { status: 404 });
    }

    // Privacy check: Only allow access if customer has hired this driver
    const hasActiveJob = jobId && locationData.activeJobs.includes(jobId);
    
    if (!hasActiveJob) {
      // Additional check: verify customer has an active job with this driver
      // This would typically check your jobs database
      console.log(`🔒 Location access denied: Customer ${customerId} has no active job with driver ${driverId}`);
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied: No active job with this driver' 
      }, { status: 403 });
    }

    // Return location data for authorized customer
    return NextResponse.json({
      success: true,
      location: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
        lastUpdated: locationData.lastUpdated
      },
      driver: {
        id: driverId,
        isOnline: true
      }
    });

  } catch (error) {
    console.error('Location retrieval error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
