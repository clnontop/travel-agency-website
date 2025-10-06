import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Get all users with wallet balances
export async function GET(request: NextRequest) {
  try {
    // Verify admin token (simplified for now)
    const token = request.headers.get('authorization');
    if (!token || !token.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        customerProfile: true,
        driverProfile: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const walletsData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      balance: user.role === 'CUSTOMER' 
        ? Number(user.customerProfile?.walletBalance || 0)
        : user.role === 'DRIVER'
        ? Number(user.driverProfile?.walletBalance || 0)
        : 0,
      isActive: user.isActive,
      createdAt: user.createdAt
    }));

    return NextResponse.json({
      success: true,
      wallets: walletsData
    });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add/Deduct money from wallet
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.headers.get('authorization');
    if (!token || !token.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, amount, type, description } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get user and their current balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        driverProfile: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let currentBalance = 0;
    let updatedBalance = 0;

    // Update balance based on user role
    if (user.role === 'CUSTOMER' && user.customerProfile) {
      currentBalance = Number(user.customerProfile.walletBalance);
      updatedBalance = type === 'credit' 
        ? currentBalance + amount 
        : Math.max(0, currentBalance - amount);

      await prisma.customer.update({
        where: { id: user.customerProfile.id },
        data: { walletBalance: updatedBalance }
      });
    } else if (user.role === 'DRIVER' && user.driverProfile) {
      currentBalance = Number(user.driverProfile.walletBalance);
      updatedBalance = type === 'credit' 
        ? currentBalance + amount 
        : Math.max(0, currentBalance - amount);

      await prisma.driver.update({
        where: { id: user.driverProfile.id },
        data: { walletBalance: updatedBalance }
      });
    }

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: userId,
        type: type === 'credit' ? 'CREDIT' : 'DEBIT',
        amount: amount,
        balance: updatedBalance,
        description: description || `Admin ${type} - ${new Date().toLocaleDateString()}`,
        reference: `ADMIN_${type.toUpperCase()}_${Date.now()}`
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: userId,
        title: type === 'credit' ? 'Money Added to Wallet' : 'Money Deducted from Wallet',
        message: `₹${amount} has been ${type === 'credit' ? 'added to' : 'deducted from'} your wallet by admin. ${description || ''}`,
        type: 'PAYMENT'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${type === 'credit' ? 'added' : 'deducted'} ₹${amount}`,
      previousBalance: currentBalance,
      newBalance: updatedBalance
    });

  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
