import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, deleteUser, banUser, unbanUser } from '@/lib/userStorage';

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        ...user,
        password: undefined // Don't send passwords
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch users'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Try to delete by userId (which could be email or id)
    const deleted = deleteUser(userId);
    
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'User deleted successfully' : 'User not found'
    }, { status: deleted ? 200 : 404 });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to delete user'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    
    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        message: 'User ID and action are required'
      }, { status: 400 });
    }

    let result = false;
    let message = '';

    switch (action) {
      case 'ban':
        result = banUser(userId);
        message = result ? 'User banned successfully' : 'User not found';
        break;
      case 'unban':
        result = unbanUser(userId);
        message = result ? 'User unbanned successfully' : 'User not found';
        break;
      default:
        return NextResponse.json({
          success: false,
          message: 'Invalid action. Use "ban" or "unban"'
        }, { status: 400 });
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message
      });
    } else {
      return NextResponse.json({
        success: false,
        message
      }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to update user'
    }, { status: 500 });
  }
}
