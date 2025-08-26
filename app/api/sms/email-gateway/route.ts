// Email-to-SMS Gateway API - Server-side nodemailer implementation
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json({
        success: false,
        message: 'Phone number and message required'
      }, { status: 400 });
    }

    // Setup Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'trinck.official@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'qovj wpmz kbeo tdzq'
      }
    });

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Indian carrier email-to-SMS gateways
    const carriers = [
      '@airtelmail.com',
      '@jiomobile.com',
      '@vimobile.com',
      '@bsnlmobile.com'
    ];

    for (const carrier of carriers) {
      try {
        const emailAddress = cleanNumber + carrier;
        
        await transporter.sendMail({
          from: process.env.GMAIL_USER || 'trinck.official@gmail.com',
          to: emailAddress,
          subject: '',
          text: message.substring(0, 160) // SMS length limit
        });
        
        console.log(`✅ Email-to-SMS sent via ${carrier}`);
        return NextResponse.json({
          success: true,
          message: `SMS sent via ${carrier} gateway`,
          provider: `email-${carrier}`
        });
      } catch (error) {
        console.log(`❌ ${carrier} failed:`, error);
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'All email carriers failed'
    }, { status: 500 });

  } catch (error) {
    console.error('Email-to-SMS API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Email-to-SMS service error'
    }, { status: 500 });
  }
}
