import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.RESEND_FROM_EMAIL || 'noreply@trinck.com',
  replyTo
}: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Trinck Travel Agency!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Trinck!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for joining Trinck Travel Agency. We're excited to have you on board!</p>
              <p>With Trinck, you can:</p>
              <ul>
                <li>Book reliable trucking services instantly</li>
                <li>Track your shipments in real-time</li>
                <li>Manage payments securely</li>
                <li>Access 24/7 customer support</li>
              </ul>
              <a href="${process.env.APP_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>
            <div class="footer">
              <p>© 2024 Trinck Travel Agency. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to Trinck, ${name}! Thank you for joining our platform.`
  }),

  otp: (otp: string, purpose: string) => ({
    subject: `Your OTP for ${purpose}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .otp-box { background: #f0f0f0; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .warning { color: #ff6b6b; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Your One-Time Password</h2>
            <p>Use the following OTP to complete your ${purpose}:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This OTP is valid for 5 minutes.</p>
            <p class="warning">⚠️ Never share this OTP with anyone. Our team will never ask for it.</p>
          </div>
        </body>
      </html>
    `,
    text: `Your OTP for ${purpose} is: ${otp}. Valid for 5 minutes.`
  }),

  bookingConfirmation: (bookingDetails: any) => ({
    subject: `Booking Confirmed - #${bookingDetails.bookingNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .details { background: #f9f9f9; padding: 20px; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
            .track-button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
            </div>
            <div class="details">
              <h2>Booking Details</h2>
              <div class="detail-row">
                <span>Booking ID:</span>
                <strong>#${bookingDetails.bookingNumber}</strong>
              </div>
              <div class="detail-row">
                <span>Pickup:</span>
                <strong>${bookingDetails.pickupAddress}</strong>
              </div>
              <div class="detail-row">
                <span>Drop:</span>
                <strong>${bookingDetails.dropAddress}</strong>
              </div>
              <div class="detail-row">
                <span>Date:</span>
                <strong>${bookingDetails.scheduledAt}</strong>
              </div>
              <div class="detail-row">
                <span>Total Amount:</span>
                <strong>₹${bookingDetails.totalPrice}</strong>
              </div>
              <a href="${process.env.APP_URL}/booking/${bookingDetails.id}" class="track-button">Track Booking</a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your booking #${bookingDetails.bookingNumber} has been confirmed.`
  }),

  paymentReceipt: (paymentDetails: any) => ({
    subject: `Payment Receipt - ₹${paymentDetails.amount}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .receipt { background: #f9f9f9; padding: 20px; }
            .amount { font-size: 32px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Successful</h1>
            </div>
            <div class="receipt">
              <div class="amount">₹${paymentDetails.amount}</div>
              <div class="detail-row">
                <span>Transaction ID:</span>
                <strong>${paymentDetails.transactionId}</strong>
              </div>
              <div class="detail-row">
                <span>Date:</span>
                <strong>${new Date(paymentDetails.paidAt).toLocaleString()}</strong>
              </div>
              <div class="detail-row">
                <span>Payment Method:</span>
                <strong>${paymentDetails.method}</strong>
              </div>
              <div class="detail-row">
                <span>Booking ID:</span>
                <strong>#${paymentDetails.bookingNumber}</strong>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Payment of ₹${paymentDetails.amount} received successfully. Transaction ID: ${paymentDetails.transactionId}`
  }),

  driverAssigned: (driverDetails: any) => ({
    subject: 'Driver Assigned to Your Booking',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .driver-card { background: #f9f9f9; padding: 20px; border-radius: 10px; }
            .driver-info { margin: 10px 0; }
            .contact-button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Driver Assigned!</h2>
            <p>Good news! A driver has been assigned to your booking.</p>
            <div class="driver-card">
              <h3>Driver Details</h3>
              <div class="driver-info"><strong>Name:</strong> ${driverDetails.name}</div>
              <div class="driver-info"><strong>Vehicle:</strong> ${driverDetails.vehicleBrand} ${driverDetails.vehicleModel}</div>
              <div class="driver-info"><strong>Vehicle Number:</strong> ${driverDetails.vehicleNumber}</div>
              <div class="driver-info"><strong>Rating:</strong> ⭐ ${driverDetails.rating}/5</div>
              <div class="driver-info"><strong>Phone:</strong> ${driverDetails.phone}</div>
              <a href="tel:${driverDetails.phone}" class="contact-button">Call Driver</a>
              <a href="${process.env.APP_URL}/tracking/${driverDetails.bookingId}" class="contact-button">Track Live</a>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Driver ${driverDetails.name} has been assigned to your booking. Contact: ${driverDetails.phone}`
  })
}

// Send templated emails
export async function sendWelcomeEmail(to: string, name: string) {
  const template = emailTemplates.welcome(name)
  return sendEmail({ to, ...template })
}

export async function sendOTPEmail(to: string, otp: string, purpose: string) {
  const template = emailTemplates.otp(otp, purpose)
  return sendEmail({ to, ...template })
}

export async function sendBookingConfirmationEmail(to: string, bookingDetails: any) {
  const template = emailTemplates.bookingConfirmation(bookingDetails)
  return sendEmail({ to, ...template })
}

export async function sendPaymentReceiptEmail(to: string, paymentDetails: any) {
  const template = emailTemplates.paymentReceipt(paymentDetails)
  return sendEmail({ to, ...template })
}

export async function sendDriverAssignedEmail(to: string, driverDetails: any) {
  const template = emailTemplates.driverAssigned(driverDetails)
  return sendEmail({ to, ...template })
}
