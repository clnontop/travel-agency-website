import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export interface CreatePaymentIntentParams {
  amount: number // in cents
  currency?: string
  customerId?: string
  metadata?: Record<string, string>
  description?: string
}

export async function createPaymentIntent({
  amount,
  currency = 'inr',
  customerId,
  metadata,
  description
}: CreatePaymentIntentParams) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata
}: {
  customerId?: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    })

    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    throw error
  }
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // Optional: partial refund
    })
    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw error
  }
}

export async function createTransfer({
  amount,
  destination,
  description,
  metadata
}: {
  amount: number
  destination: string // Connected account ID
  description?: string
  metadata?: Record<string, string>
}) {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'inr',
      destination,
      description,
      metadata,
    })
    return transfer
  } catch (error) {
    console.error('Error creating transfer:', error)
    throw error
  }
}

// Webhook handler
export async function handleStripeWebhook(
  body: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    return event
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw error
  }
}
