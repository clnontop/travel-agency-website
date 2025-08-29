import { NextRequest, NextResponse } from 'next/server';

// Twilio SMS API route - server-side only
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json({
        success: false,
        message: 'Phone number and message required'
      }, { status: 400 });
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return NextResponse.json({
        success: false,
        message: 'Twilio credentials not configured'
      }, { status: 500 });
    }

    try {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      if (!process.env.TWILIO_PHONE_NUMBER) {
        return NextResponse.json({
          success: false,
          message: 'Twilio phone number not configured'
        }, { status: 500 });
      }

      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return NextResponse.json({
        success: true,
        message: 'SMS sent via Twilio',
        messageId: result.sid
      });

    } catch (error: any) {
      console.error('Twilio SMS failed:', error);
      return NextResponse.json({
        success: false,
        message: `Twilio failed: ${error.message}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Twilio API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Twilio service error'
    }, { status: 500 });
  }
}
