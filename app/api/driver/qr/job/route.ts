import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/userStorage';

// Mock job data (replace with database in production)
const jobData = new Map([
  ['JOB001', {
    id: 'JOB001',
    pickup: 'Mumbai Central',
    delivery: 'Pune Station',
    status: 'assigned',
    driverId: 'driver1',
    customerId: 'customer1',
    customerName: 'Rajesh Kumar',
    payment: 2500,
    pickupTime: '2024-01-15 10:00 AM',
    deliveryTime: '2024-01-15 2:00 PM'
  }],
  ['JOB002', {
    id: 'JOB002',
    pickup: 'Delhi Airport',
    delivery: 'Gurgaon Cyber City',
    status: 'in_progress',
    driverId: 'driver2',
    customerId: 'customer2',
    customerName: 'Priya Sharma',
    payment: 800,
    pickupTime: '2024-01-15 3:00 PM',
    deliveryTime: '2024-01-15 5:00 PM'
  }]
]);

export async function POST(request: NextRequest) {
  try {
    const { jobId, action, driverId, timestamp } = await request.json();

    if (!jobId || !action || !driverId) {
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

    // Get job data
    const job = jobData.get(jobId);
    if (!job) {
      return NextResponse.json({
        success: false,
        message: 'Job not found'
      }, { status: 404 });
    }

    // Verify driver is assigned to this job
    if (job.driverId !== driverId) {
      return NextResponse.json({
        success: false,
        message: 'Driver not assigned to this job'
      }, { status: 403 });
    }

    let message = '';
    let newStatus = job.status;

    switch (action) {
      case 'pickup_start':
        if (job.status !== 'assigned') {
          return NextResponse.json({
            success: false,
            message: 'Job must be in assigned status for pickup'
          }, { status: 400 });
        }
        newStatus = 'pickup_in_progress';
        message = 'Pickup started successfully';
        break;

      case 'pickup_complete':
        if (job.status !== 'pickup_in_progress') {
          return NextResponse.json({
            success: false,
            message: 'Job must be in pickup progress for completion'
          }, { status: 400 });
        }
        newStatus = 'in_transit';
        message = 'Pickup completed, cargo in transit';
        break;

      case 'delivery_start':
        if (job.status !== 'in_transit') {
          return NextResponse.json({
            success: false,
            message: 'Job must be in transit for delivery'
          }, { status: 400 });
        }
        newStatus = 'delivery_in_progress';
        message = 'Delivery started';
        break;

      case 'delivery_complete':
        if (job.status !== 'delivery_in_progress') {
          return NextResponse.json({
            success: false,
            message: 'Job must be in delivery progress for completion'
          }, { status: 400 });
        }
        newStatus = 'completed';
        message = 'Job completed successfully';
        break;

      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action'
        }, { status: 400 });
    }

    // Update job status
    job.status = newStatus;
    job.lastUpdated = new Date(timestamp || Date.now());
    jobData.set(jobId, job);

    console.log(`📋 Job ${jobId} - ${action} by driver ${driver.name}`);
    console.log(`   Status: ${job.status} | Customer: ${job.customerName}`);

    return NextResponse.json({
      success: true,
      message,
      job: {
        id: job.id,
        status: job.status,
        pickup: job.pickup,
        delivery: job.delivery,
        customerName: job.customerName,
        lastUpdated: job.lastUpdated
      }
    });

  } catch (error) {
    console.error('Job QR processing error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
