import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { triggerEvent, CHANNELS, EVENTS } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { bookingId, lat, lng, speed, heading } = body

    // Validate required fields
    if (!bookingId || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      )
    }

    // Verify driver is assigned to this booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        driverId: driver.id,
        status: 'IN_TRANSIT'
      },
      include: {
        customer: { include: { user: true } }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found or not in transit' },
        { status: 404 }
      )
    }

    // Update driver's current location
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationUpdate: new Date()
      }
    })

    // Create tracking record
    const tracking = await prisma.tracking.create({
      data: {
        bookingId,
        lat,
        lng,
        speed,
        heading
      }
    })

    // Calculate ETA based on remaining distance
    const remainingDistance = calculateDistance(
      { lat, lng },
      { lat: booking.dropLat, lng: booking.dropLng }
    )
    const eta = speed > 0 ? Math.round((remainingDistance / speed) * 60) : null // minutes

    // Trigger real-time event for customer
    await triggerEvent(
      CHANNELS.TRACKING(bookingId),
      EVENTS.DRIVER_LOCATION_UPDATE,
      {
        lat,
        lng,
        speed,
        heading,
        eta,
        remainingDistance,
        timestamp: tracking.createdAt
      }
    )

    // Also send to customer's private channel
    await triggerEvent(
      CHANNELS.CUSTOMER(booking.customerId),
      EVENTS.DRIVER_LOCATION_UPDATE,
      {
        bookingId,
        lat,
        lng,
        eta,
        remainingDistance
      }
    )

    // Check if driver has reached destination (within 100 meters)
    const distanceToDestination = calculateDistance(
      { lat, lng },
      { lat: booking.dropLat, lng: booking.dropLng }
    )

    if (distanceToDestination < 0.1) {
      // Mark booking as completed
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      // Create driver earning
      const totalPriceNum = Number(booking.totalPrice) // Convert Decimal to number
      const commission = totalPriceNum * 0.15 // 15% commission
      const netAmount = totalPriceNum - commission

      await prisma.driverEarning.create({
        data: {
          driverId: driver.id,
          bookingId,
          amount: booking.totalPrice,
          commission,
          netAmount,
          status: 'PENDING'
        }
      })

      // Update driver stats
      await prisma.driver.update({
        where: { id: driver.id },
        data: {
          totalTrips: { increment: 1 },
          totalEarnings: { increment: netAmount },
          walletBalance: { increment: netAmount },
          isAvailable: true // Make driver available again
        }
      })

      // Send completion notifications
      if (booking.customer.user.email) {
        // Email notification would be sent here
      }

      if (booking.customer.user.phone) {
        // SMS notification would be sent here
      }

      // Create notifications
      await prisma.notification.createMany({
        data: [
          {
            userId: booking.customer.userId,
            title: 'Delivery Completed',
            message: `Your shipment #${booking.bookingNumber} has been delivered successfully`,
            type: 'BOOKING',
            data: { bookingId }
          },
          {
            userId: driver.userId,
            title: 'Trip Completed',
            message: `You've completed booking #${booking.bookingNumber}. Earnings: ₹${netAmount}`,
            type: 'BOOKING',
            data: { bookingId, earnings: netAmount }
          }
        ]
      })

      // Trigger completion events
      await triggerEvent(
        CHANNELS.BOOKING(bookingId),
        EVENTS.BOOKING_COMPLETED,
        {
          bookingId,
          completedAt: new Date()
        }
      )
    }

    return NextResponse.json({
      success: true,
      tracking: {
        id: tracking.id,
        lat,
        lng,
        speed,
        heading,
        eta,
        remainingDistance,
        nearDestination: distanceToDestination < 0.5
      }
    })

  } catch (error) {
    console.error('Error updating tracking:', error)
    return NextResponse.json(
      { error: 'Failed to update tracking' },
      { status: 500 }
    )
  }
}

// Helper function to calculate distance
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat)
  const dLng = toRad(point2.lng - point1.lng)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
    Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
