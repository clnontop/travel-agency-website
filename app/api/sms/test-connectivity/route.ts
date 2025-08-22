import { NextRequest, NextResponse } from 'next/server';

// Test SMS connectivity API route
export async function GET() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({
        success: false,
        message: 'Email service not configured'
      });
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

    await transporter.verify();
    
    return NextResponse.json({
      success: true,
      message: 'SMS service connectivity verified'
    });

  } catch (error) {
    console.error('SMS connectivity test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'SMS service connectivity failed'
    });
  }
}
