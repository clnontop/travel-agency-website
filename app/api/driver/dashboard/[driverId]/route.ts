import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/userStorage';

// Mock dashboard data (replace with database in production)
const driverStats = new Map();
const driverJobs = new Map();

// Initialize some demo data
const initializeDemoData = () => {
  const demoStats = {
    today: {
      jobs: 3,
      earnings: 2800,
      distance: 245,
      hours: 8
    },
    thisWeek: {
      jobs: 18,
      earnings: 15600,
      distance: 1850,
      hours: 45
    },
    thisMonth: {
      jobs: 72,
      earnings: 68400,
      distance: 7200,
      hours: 180
    }
  };

  const demoJobs = [
    {
      id: 'JOB001',
      pickup: 'Mumbai Central',
      delivery: 'Pune Station',
      earning: 2500,
      status: 'completed',
      date: '2024-01-15',
      customerName: 'Rajesh Kumar'
    },
    {
      id: 'JOB002',
      pickup: 'Delhi Airport',
      delivery: 'Gurgaon Cyber City',
      earning: 800,
      status: 'completed',
      date: '2024-01-14',
      customerName: 'Priya Sharma'
    },
    {
      id: 'JOB003',
      pickup: 'Bangalore Tech Park',
      delivery: 'Chennai Port',
      earning: 4200,
      status: 'in_progress',
      date: '2024-01-16',
      customerName: 'Amit Patel'
    }
  ];

  // Set demo data for all drivers
  ['driver1', 'driver2', 'driver3'].forEach(driverId => {
    driverStats.set(driverId, demoStats);
    driverJobs.set(driverId, demoJobs);
  });
};

// Initialize demo data
initializeDemoData();

export async function GET(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    const { driverId } = params;

    if (!driverId) {
      return NextResponse.json({
        success: false,
        message: 'Driver ID is required'
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

    // Get or create stats for this driver
    let stats = driverStats.get(driverId);
    if (!stats) {
      stats = {
        today: { jobs: 0, earnings: 0, distance: 0, hours: 0 },
        thisWeek: { jobs: 0, earnings: 0, distance: 0, hours: 0 },
        thisMonth: { jobs: 0, earnings: 0, distance: 0, hours: 0 }
      };
      driverStats.set(driverId, stats);
    }

    // Get recent jobs for this driver
    let recentJobs = driverJobs.get(driverId) || [];

    // Calculate performance metrics
    const performanceMetrics = {
      rating: driver.rating || 4.5,
      totalRides: driver.totalRides || 0,
      completionRate: 98.5,
      onTimeDelivery: 96.2,
      customerSatisfaction: 4.7
    };

    // Get current status
    const currentStatus = {
      isOnline: driver.isActive || false,
      currentLocation: driver.currentLocation || null,
      activeJobs: recentJobs.filter((job: any) => job.status === 'in_progress').length
    };

    console.log(`📊 Dashboard data requested for driver: ${driver.name}`);

    return NextResponse.json({
      success: true,
      driver: {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicle: driver.vehicle,
        license: driver.license,
        rating: driver.rating,
        totalRides: driver.totalRides
      },
      stats: stats.today, // Return today's stats for mobile dashboard
      weeklyStats: stats.thisWeek,
      monthlyStats: stats.thisMonth,
      recentJobs: recentJobs.slice(0, 5), // Last 5 jobs
      performanceMetrics,
      currentStatus
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Update driver stats (called when jobs are completed)
export async function POST(
  request: NextRequest,
  { params }: { params: { driverId: string } }
) {
  try {
    const { driverId } = params;
    const { jobCompleted, earnings, distance, duration } = await request.json();

    if (!driverId || !jobCompleted) {
      return NextResponse.json({
        success: false,
        message: 'Missing required data'
      }, { status: 400 });
    }

    // Get current stats
    let stats = driverStats.get(driverId);
    if (!stats) {
      stats = {
        today: { jobs: 0, earnings: 0, distance: 0, hours: 0 },
        thisWeek: { jobs: 0, earnings: 0, distance: 0, hours: 0 },
        thisMonth: { jobs: 0, earnings: 0, distance: 0, hours: 0 }
      };
    }

    // Update today's stats
    stats.today.jobs += 1;
    stats.today.earnings += earnings || 0;
    stats.today.distance += distance || 0;
    stats.today.hours += duration || 0;

    // Update weekly and monthly stats (simplified)
    stats.thisWeek.jobs += 1;
    stats.thisWeek.earnings += earnings || 0;
    stats.thisWeek.distance += distance || 0;
    stats.thisWeek.hours += duration || 0;

    stats.thisMonth.jobs += 1;
    stats.thisMonth.earnings += earnings || 0;
    stats.thisMonth.distance += distance || 0;
    stats.thisMonth.hours += duration || 0;

    driverStats.set(driverId, stats);

    console.log(`📈 Stats updated for driver ${driverId}:`, {
      job: jobCompleted.id,
      earnings,
      distance,
      duration
    });

    return NextResponse.json({
      success: true,
      message: 'Stats updated successfully',
      updatedStats: stats.today
    });

  } catch (error) {
    console.error('Stats update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
