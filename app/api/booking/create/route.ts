import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'
import { sendSMS, smsTemplates } from '@/lib/twilio'
import { triggerEvent, CHANNELS, EVENTS } from '@/lib/pusher'
import { createPaymentIntent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    const user = session?.user as { id?: string; email?: string; name?: string } | undefined
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      pickupAddress,
      pickupLat,
      pickupLng,
      dropAddress,
      dropLat,
      dropLng,
      cargoType,
      cargoWeight,
      cargoDescription,
      scheduledAt,
      paymentMethod
    } = body

    // Validate required fields
    if (!pickupAddress || !dropAddress || !cargoType || !cargoWeight) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get customer profile
    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
      include: { user: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Calculate pricing (simplified)
    const distance = calculateDistance(
      { lat: pickupLat, lng: pickupLng },
      { lat: dropLat, lng: dropLng }
    )
    const duration = Math.round(distance * 2) // Rough estimate: 2 min per km
    
    const basePrice = 500 // Base price in INR
    const distancePrice = distance * 10 // 10 INR per km
    const weightPrice = cargoWeight * 100 // 100 INR per ton
    const totalPrice = basePrice + distancePrice + weightPrice

    // Check wallet balance if payment method is wallet
    if (paymentMethod === 'WALLET') {
      const walletBalance = Number(customer.walletBalance)
      if (walletBalance < totalPrice) {
        return NextResponse.json(
          { error: 'Insufficient wallet balance' },
          { status: 400 }
        )
      }
    }

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        pickupAddress,
        pickupLat,
        pickupLng,
        dropAddress,
        dropLat,
        dropLng,
        distance,
        duration,
        cargoType,
        cargoWeight,
        cargoDescription,
        basePrice,
        distancePrice,
        weightPrice,
        totalPrice,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'PENDING'
      },
      include: {
        customer: {
          include: { user: true }
        }
      }
    })

    // Create payment intent if card payment
    let paymentIntentId = null
    if (paymentMethod === 'CARD') {
      const paymentIntent = await createPaymentIntent({
        amount: Math.round(totalPrice * 100), // Convert to cents
        currency: 'inr',
        metadata: {
          bookingId: booking.id,
          customerId: customer.id
        },
        description: `Booking #${booking.bookingNumber}`
      })
      paymentIntentId = paymentIntent.paymentIntentId
    }

    // Send confirmation email
    if (customer.user.email) {
      await sendEmail({
        to: customer.user.email,
        ...emailTemplates.bookingConfirmation({
          bookingNumber: booking.bookingNumber,
          pickupAddress,
          dropAddress,
          scheduledAt: scheduledAt || 'Immediate',
          totalPrice,
          id: booking.id
        })
      })
    }

    // Send SMS notification
    if (customer.user.phone) {
      await sendSMS({
        to: customer.user.phone,
        body: smsTemplates.bookingConfirmed(booking.bookingNumber)
      })
    }

    // Trigger real-time event for drivers
    await triggerEvent(
      CHANNELS.GLOBAL,
      EVENTS.BOOKING_CREATED,
      {
        bookingId: booking.id,
        pickupAddress,
        dropAddress,
        cargoType,
        cargoWeight,
        totalPrice,
        scheduledAt
      }
    )

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Booking Confirmed',
        message: `Your booking #${booking.bookingNumber} has been created successfully`,
        type: 'BOOKING',
        data: { bookingId: booking.id }
      }
    })

    // Find and notify nearby drivers
    const nearbyDrivers = await prisma.driver.findMany({
      where: {
        isOnline: true,
        isAvailable: true,
        currentLat: {
          gte: pickupLat - 0.5, // ~50km radius
          lte: pickupLat + 0.5
        },
        currentLng: {
          gte: pickupLng - 0.5,
          lte: pickupLng + 0.5
        }
      },
      include: { user: true },
      take: 10
    })

    // Notify nearby drivers
    for (const driver of nearbyDrivers) {
      // Create notification
      await prisma.notification.create({
        data: {
          userId: driver.userId,
          title: 'New Booking Available',
          message: `New ${cargoType} shipment from ${pickupAddress} to ${dropAddress}`,
          type: 'BOOKING',
          data: { bookingId: booking.id }
        }
      })

      // Send push notification via Pusher
      await triggerEvent(
        CHANNELS.DRIVER(driver.id),
        EVENTS.BOOKING_CREATED,
        {
          bookingId: booking.id,
          pickupAddress,
          dropAddress,
          cargoType,
          totalPrice
        }
      )

      // Send SMS if enabled
      if (driver.user.phone) {
        await sendSMS({
          to: driver.user.phone,
          body: `New booking: ${cargoType} from ${pickupAddress}. Check app for details.`
        }).catch(console.error) // Don't fail if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        totalPrice,
        paymentIntentId
      },
      message: 'Booking created successfully',
      driversNotified: nearbyDrivers.length
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// Helper function to calculate distance between two points
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
  return Math.round(R * c)
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
