import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { handleStripeWebhook } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { sendEmail, emailTemplates } from '@/lib/email'
import { sendSMS, smsTemplates } from '@/lib/twilio'
import { triggerEvent, CHANNELS, EVENTS } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    // Verify webhook signature and get event
    const event = await handleStripeWebhook(body, signature)

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any
        const { bookingId, customerId } = paymentIntent.metadata

        // Update payment record
        const payment = await prisma.payment.create({
          data: {
            bookingId,
            customerId,
            amount: paymentIntent.amount / 100, // Convert from cents
            method: 'CARD',
            status: 'SUCCESS',
            gatewayId: paymentIntent.id,
            gatewayResponse: paymentIntent,
            paidAt: new Date()
          }
        })

        // Update booking status
        const booking = await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'ACCEPTED' },
          include: {
            customer: { include: { user: true } },
            driver: { include: { user: true } }
          }
        })

        // Create transaction record
        await prisma.transaction.create({
          data: {
            userId: booking.customer.userId,
            type: 'DEBIT',
            amount: payment.amount,
            balance: Number(booking.customer.walletBalance),
            description: `Payment for booking #${booking.bookingNumber}`,
            reference: bookingId
          }
        })

        // Send confirmation email
        if (booking.customer.user.email) {
          await sendEmail({
            to: booking.customer.user.email,
            ...emailTemplates.paymentReceipt({
              amount: payment.amount,
              transactionId: payment.paymentNumber,
              paidAt: payment.paidAt,
              method: 'Card',
              bookingNumber: booking.bookingNumber
            })
          })
        }

        // Send SMS confirmation
        if (booking.customer.user.phone) {
          await sendSMS({
            to: booking.customer.user.phone,
            body: smsTemplates.paymentReceived(
              payment.amount,
              payment.paymentNumber
            )
          })
        }

        // Trigger real-time event
        await triggerEvent(
          CHANNELS.CUSTOMER(customerId),
          EVENTS.PAYMENT_RECEIVED,
          {
            paymentId: payment.id,
            amount: payment.amount,
            bookingId
          }
        )

        // Create notification
        await prisma.notification.create({
          data: {
            userId: booking.customer.userId,
            title: 'Payment Successful',
            message: `Payment of ₹${payment.amount} received for booking #${booking.bookingNumber}`,
            type: 'PAYMENT',
            data: { paymentId: payment.id, bookingId }
          }
        })

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        const { bookingId, customerId } = paymentIntent.metadata

        // Update payment record
        await prisma.payment.create({
          data: {
            bookingId,
            customerId,
            amount: paymentIntent.amount / 100,
            method: 'CARD',
            status: 'FAILED',
            gatewayId: paymentIntent.id,
            gatewayResponse: paymentIntent,
            failedAt: new Date()
          }
        })

        // Trigger real-time event
        await triggerEvent(
          CHANNELS.CUSTOMER(customerId),
          EVENTS.PAYMENT_FAILED,
          {
            bookingId,
            error: paymentIntent.last_payment_error?.message
          }
        )

        // Create notification
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { customer: true }
        })

        if (booking) {
          await prisma.notification.create({
            data: {
              userId: booking.customer.userId,
              title: 'Payment Failed',
              message: `Payment failed for booking #${booking.bookingNumber}. Please try again.`,
              type: 'PAYMENT',
              data: { bookingId }
            }
          })
        }

        break
      }

      case 'checkout.session.completed': {
        // Handle subscription payments
        const session = event.data.object as any
        const { userId, planType } = session.metadata

        // Create or update subscription
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            status: 'ACTIVE',
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          },
          create: {
            userId,
            planType: planType || 'BASIC',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            amount: session.amount_total / 100,
            paymentId: session.payment_intent,
            freeDeliveries: planType === 'PREMIUM' ? 5 : 0,
            discountPercent: planType === 'PREMIUM' ? 10 : 0
          }
        })

        break
      }

      case 'customer.subscription.deleted': {
        // Handle subscription cancellation
        const subscription = event.data.object as any
        
        await prisma.subscription.updateMany({
          where: { paymentId: subscription.id },
          data: { status: 'CANCELLED' }
        })

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
