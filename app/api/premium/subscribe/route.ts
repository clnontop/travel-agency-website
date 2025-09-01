import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, planId, paymentMethod } = await request.json();

    // Validate input
    if (!userId || !planId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate plan
    const validPlans = ['premium_3m', 'premium_6m', 'premium_1y'];
    if (!validPlans.includes(planId)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get plan details
    const planPrices = {
      premium_3m: 1500,
      premium_6m: 2500,
      premium_1y: 4000
    };

    const planDurations = {
      premium_3m: 3,
      premium_6m: 6,
      premium_1y: 12
    };

    // Simulate payment processing
    const paymentId = `pay_${Date.now()}_${userId}`;
    
    // In a real app, you would:
    // 1. Process payment with payment gateway
    // 2. Store subscription in database
    // 3. Send confirmation email
    // 4. Update user's premium status

    const subscription = {
      id: `sub_${Date.now()}_${userId}`,
      userId,
      plan: planId,
      startDate: new Date(),
      endDate: new Date(Date.now() + planDurations[planId as keyof typeof planDurations] * 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      paymentId,
      amount: planPrices[planId as keyof typeof planPrices],
      autoRenew: false
    };

    return NextResponse.json({
      success: true,
      subscription,
      message: 'Premium subscription activated successfully!'
    });

  } catch (error) {
    console.error('Premium subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to process premium subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real app, fetch from database
    // For now, return mock data
    const subscription = {
      id: `sub_${userId}`,
      userId,
      plan: 'premium_6m',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-07-01'),
      isActive: true,
      paymentId: `pay_${userId}`,
      amount: 2500
    };

    return NextResponse.json({
      success: true,
      subscription
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
