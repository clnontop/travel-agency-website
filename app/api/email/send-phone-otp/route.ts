import { NextRequest, NextResponse } from 'next/server';

// Phone OTP email notification API route
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, userEmail } = await request.json();

    if (!phoneNumber || !otp || !userEmail) {
      return NextResponse.json(
        { success: false, message: 'Phone number, OTP, and user email are required' },
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

    const mailOptions = {
      from: `"TRINK SMS Service" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'TRINK - Phone Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">📱 Phone Verification</h1>
            <p style="color: white; margin: 10px 0 0 0;">TRINK Transport Platform</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; text-align: center;">Phone Verification Code</h2>
            <p style="color: #666; font-size: 16px;">We couldn't send SMS to your phone <strong>${phoneNumber}</strong>, so here's your verification code:</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 25px; margin: 30px 0; border-radius: 12px; letter-spacing: 8px;">
              ${otp}
            </div>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;"><strong>⏰ Important:</strong> This code expires in 5 minutes.</p>
            </div>
            <p style="color: #666; font-size: 14px;">Enter this code in the phone verification field to complete your registration.</p>
          </div>
          <div style="background: #333; color: #ccc; text-align: center; padding: 20px; font-size: 12px;">
            <p style="margin: 0;">© 2024 TRINK Transport. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({
      success: true,
      message: `Phone verification code sent to email`
    });

  } catch (error) {
    console.error('Phone OTP email failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}
