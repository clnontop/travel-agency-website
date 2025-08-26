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

    // Email service is configured with fallback credentials
    const emailUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'trinck.official@gmail.com';
    const emailPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'qovj wpmz kbeo tdzq';

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || process.env.GMAIL_USER || 'trinck.official@gmail.com',
        pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'qovj wpmz kbeo tdzq',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"TRINK SMS Service" <${emailUser}>`,
      to: userEmail,
      subject: 'TRINK - Phone Verification Code (Email Backup)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">📱 Phone Verification Backup</h1>
            <p style="color: white; margin: 10px 0 0 0;">TRINK Transport Platform</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; text-align: center;">Phone Verification Code (Email Backup)</h2>
            <p style="color: #666; font-size: 16px;">SMS delivery to <strong>${phoneNumber}</strong> failed. Here's your verification code via email backup:</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 25px; margin: 30px 0; border-radius: 12px; letter-spacing: 8px;">
              ${otp}
            </div>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; font-size: 14px; margin: 0;"><strong>⏰ Important:</strong> This code expires in 5 minutes.</p>
            </div>
            <p style="color: #666; font-size: 14px;">Enter this code in the phone verification field to complete your registration.</p>
            <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #1976d2; font-size: 14px; margin: 0;"><strong>📧 Note:</strong> This email is only a backup for phone verification. For email verification, use the dedicated email verification process.</p>
            </div>
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
