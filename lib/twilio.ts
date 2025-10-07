// import twilio from 'twilio'
let twilio: any
try {
  twilio = require('twilio')
} catch (e) {
  console.warn('Twilio not available')
  twilio = () => ({ messages: { create: () => Promise.resolve() } })
}

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID
const phoneNumber = process.env.TWILIO_PHONE_NUMBER

const client = twilio(accountSid, authToken)

export interface SendSMSParams {
  to: string
  body: string
  from?: string
}

// Send SMS
export async function sendSMS({ to, body, from = phoneNumber }: SendSMSParams) {
  try {
    const message = await client.messages.create({
      body,
      from,
      to,
    })
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
    }
  } catch (error: any) {
    console.error('Error sending SMS:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Send OTP using Twilio Verify
export async function sendOTP(phoneNumber: string) {
  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid!)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      })
    
    return {
      success: true,
      status: verification.status,
      sid: verification.sid,
    }
  } catch (error: any) {
    console.error('Error sending OTP:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Verify OTP
export async function verifyOTP(phoneNumber: string, code: string) {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid!)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      })
    
    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status,
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Send WhatsApp message
export async function sendWhatsApp({ to, body }: { to: string; body: string }) {
  try {
    const message = await client.messages.create({
      body,
      from: `whatsapp:${phoneNumber}`,
      to: `whatsapp:${to}`,
    })
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
    }
  } catch (error: any) {
    console.error('Error sending WhatsApp:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Make voice call
export async function makeCall({ to, message }: { to: string; message: string }) {
  try {
    const call = await client.calls.create({
      twiml: `<Response><Say>${message}</Say></Response>`,
      to,
      from: phoneNumber!,
    })
    
    return {
      success: true,
      callId: call.sid,
      status: call.status,
    }
  } catch (error: any) {
    console.error('Error making call:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Check phone number validity
export async function validatePhoneNumber(phoneNumber: string) {
  try {
    const phoneNumberInfo = await client.lookups.v2
      .phoneNumbers(phoneNumber)
      .fetch()
    
    return {
      valid: phoneNumberInfo.valid,
      countryCode: phoneNumberInfo.countryCode,
      nationalFormat: phoneNumberInfo.nationalFormat,
      internationalFormat: phoneNumberInfo.phoneNumber,
    }
  } catch (error: any) {
    console.error('Error validating phone number:', error)
    return {
      valid: false,
      error: error.message,
    }
  }
}

// SMS Templates
export const smsTemplates = {
  otp: (otp: string) => 
    `Your Trinck verification code is: ${otp}. Valid for 5 minutes. Never share this code.`,
  
  bookingConfirmed: (bookingNumber: string) => 
    `Your booking #${bookingNumber} has been confirmed. Track your shipment at ${process.env.APP_URL}/tracking`,
  
  driverAssigned: (driverName: string, vehicleNumber: string) => 
    `Driver ${driverName} (${vehicleNumber}) has been assigned to your booking. They will contact you soon.`,
  
  deliveryCompleted: (bookingNumber: string) => 
    `Your shipment #${bookingNumber} has been delivered successfully. Thank you for using Trinck!`,
  
  paymentReceived: (amount: number, transactionId: string) => 
    `Payment of ₹${amount} received successfully. Transaction ID: ${transactionId}`,
}
