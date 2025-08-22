import { NextRequest, NextResponse } from 'next/server';

// Major carrier email-to-SMS gateways
const CARRIER_GATEWAYS = [
  // India
  { name: 'Airtel', domain: 'airtelmail.com', country: 'IN' },
  { name: 'Jio', domain: 'jiomsg.com', country: 'IN' },
  { name: 'Vi (Vodafone Idea)', domain: 'vtext.com', country: 'IN' },
  { name: 'BSNL', domain: 'bsnlmail.com', country: 'IN' },
  
  // USA
  { name: 'Verizon', domain: 'vtext.com', country: 'US' },
  { name: 'AT&T', domain: 'txt.att.net', country: 'US' },
  { name: 'T-Mobile', domain: 'tmomail.net', country: 'US' },
  { name: 'Sprint', domain: 'messaging.sprintpcs.com', country: 'US' }
];

// Detect carrier from phone number
function detectCarrier(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Indian number patterns
  if (cleaned.startsWith('91') || (cleaned.length === 10 && cleaned.startsWith('9'))) {
    const number = cleaned.length === 10 ? cleaned : cleaned.substring(2);
    
    // Airtel: 7, 8, 9 series
    if (/^[789]/.test(number)) {
      return CARRIER_GATEWAYS.find(g => g.name === 'Airtel') || null;
    }
    
    // Jio: 6, 7, 8, 9 series
    if (/^[6789]/.test(number)) {
      return CARRIER_GATEWAYS.find(g => g.name === 'Jio') || null;
    }
  }
  
  // Default to most common carrier for the region
  return CARRIER_GATEWAYS.find(g => g.country === 'IN') || CARRIER_GATEWAYS[0];
}

// Email-to-SMS gateway API route
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, message: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { success: false, message: 'Email service not configured' },
        { status: 500 }
      );
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const cleaned = phoneNumber.replace(/\D/g, '');
    const carrier = detectCarrier(phoneNumber);
    
    if (!carrier) {
      return NextResponse.json(
        { success: false, message: 'Could not detect carrier' },
        { status: 400 }
      );
    }

    // Format number for email gateway
    const number = cleaned.length === 10 ? cleaned : 
                  cleaned.startsWith('91') ? cleaned.substring(2) : cleaned;
    
    const smsEmail = `${number}@${carrier.domain}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: smsEmail,
      subject: '', // Most carriers ignore subject for SMS
      text: message.substring(0, 160) // SMS character limit
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`📱 SMS sent via ${carrier.name} email gateway to ${phoneNumber}`);
    
    return NextResponse.json({
      success: true,
      message: `SMS sent via ${carrier.name} email gateway`,
      carrier: carrier.name
    });

  } catch (error) {
    console.error('Email-to-SMS gateway failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send via email gateway' },
      { status: 500 }
    );
  }
}
