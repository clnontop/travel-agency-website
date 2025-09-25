import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/userStorage';

// Mock customer verification data (replace with database in production)
const verificationCodes = new Map();
const verificationHistory = new Map();

export async function POST(request: NextRequest) {
  try {
    const { customerId, customerName, phone, driverId } = await request.json();

    if (!customerId || !customerName || !phone || !driverId) {
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

    // Verify customer exists
    const customer = getUserById(customerId);
    if (!customer || customer.type !== 'customer') {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 });
    }

    // Validate customer details match
    if (customer.name !== customerName || customer.phone !== phone) {
      console.log(`🚫 Customer verification failed for ${customerName}`);
      console.log(`   Expected: ${customer.name} | ${customer.phone}`);
      console.log(`   Provided: ${customerName} | ${phone}`);
      
      return NextResponse.json({
        success: false,
        message: 'Customer details do not match our records'
      }, { status: 400 });
    }

    // Record verification
    const verificationRecord = {
      customerId,
      customerName,
      phone,
      driverId,
      driverName: driver.name,
      timestamp: new Date(),
      verified: true
    };

    // Store verification history
    if (!verificationHistory.has(driverId)) {
      verificationHistory.set(driverId, []);
    }
    verificationHistory.get(driverId).push(verificationRecord);

    console.log(`✅ Customer ${customerName} verified by driver ${driver.name}`);

    return NextResponse.json({
      success: true,
      message: 'Customer identity verified successfully',
      verification: {
        customerId,
        customerName,
        verified: true,
        timestamp: verificationRecord.timestamp
      }
    });

  } catch (error) {
    console.error('Customer verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Get verification history for a driver
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

    const history = verificationHistory.get(driverId) || [];

    return NextResponse.json({
      success: true,
      verifications: history.slice(-10) // Last 10 verifications
    });

  } catch (error) {
    console.error('Verification history error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
