import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { User } from '@/types/auth';

// Mock jobs data (replace with actual database in production)
const driverJobs = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    const driverId = params.driverId;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token || !driverId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing authentication or driver ID' 
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

    // Get active jobs for driver
    const jobs = driverJobs.get(driverId) || [];
    
    // Filter only active jobs
    const activeJobs = jobs.filter((job: any) => 
      job.status === 'assigned' || job.status === 'in_progress'
    );

    return NextResponse.json({
      success: true,
      jobs: activeJobs,
      count: activeJobs.length
    });

  } catch (error) {
    console.error('Driver jobs retrieval error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Assign job to driver (called when customer hires driver)
export async function POST(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    const driverId = params.driverId;
    const { jobId, customerId, customerName, pickup, delivery, amount } = await request.json();

    if (!jobId || !customerId || !pickup || !delivery) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required job details' 
      }, { status: 400 });
    }

    // Create job assignment
    const job = {
      id: jobId,
      customerId,
      customerName,
      pickup,
      delivery,
      amount,
      status: 'assigned',
      assignedAt: new Date(),
      driverId
    };

    // Store job
    if (!driverJobs.has(driverId)) {
      driverJobs.set(driverId, []);
    }
    driverJobs.get(driverId).push(job);

    console.log(`🚛 Job assigned to driver ${driverId}:`, {
      jobId,
      route: `${pickup} → ${delivery}`,
      customer: customerName,
      amount
    });

    return NextResponse.json({
      success: true,
      message: 'Job assigned successfully',
      job
    });

  } catch (error) {
    console.error('Job assignment error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
