import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expires: number; email: string }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Email OTP API route
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const sessionId = 'email_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(sessionId, { otp, expires, email });

    // Send email via Gmail SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env.local');
      return NextResponse.json(
        { success: false, message: 'Email service not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify SMTP connection
      await transporter.verify();
      console.log('✅ SMTP connection verified');

      const mailOptions = {
        from: `"TRINK Transport" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: 'TRINK - Email Verification OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">TRINK</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Transport & Logistics Platform</p>
            </div>
            <div style="padding: 40px 30px; background: #f8f9fa;">
              <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Email Verification Required</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">Hello,</p>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">Thank you for registering with TRINK! Please use the following One-Time Password (OTP) to verify your email address:</p>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 25px; margin: 30px 0; border-radius: 12px; letter-spacing: 8px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                ${otp}
              </div>
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0;"><strong>⏰ Important:</strong> This OTP will expire in 5 minutes for security reasons.</p>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.6;">If you didn't create an account with TRINK, please ignore this email and no action is required.</p>
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 12px;">Need help? Contact our support team</p>
              </div>
            </div>
            <div style="background: #333; color: #ccc; text-align: center; padding: 20px; font-size: 12px;">
              <p style="margin: 0;">© 2024 TRINK Transport & Logistics. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email OTP sent successfully to ${email}: ${otp}`);
      
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email. Please check your email address and try again.' },
        { status: 500 }
      );
    }

    // Always return success (OTP is stored for verification)
    console.log(`📧 Email OTP generated for ${email}: ${otp}`);
    
    return NextResponse.json({
      success: true,
      message: `Verification email sent to ${email.replace(/(.{2}).*(@.*)/, '$1****$2')}. Please check your inbox.`,
      sessionId
    });

  } catch (error) {
    console.error('Email OTP API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}

// Verify email OTP
export async function PUT(request: NextRequest) {
  try {
    const { sessionId, otp } = await request.json();

    if (!sessionId || !otp) {
      return NextResponse.json(
        { success: false, message: 'Session ID and OTP are required' },
        { status: 400 }
      );
    }

    const storedData = otpStore.get(sessionId);
    
    if (!storedData) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session' },
        { status: 400 }
      );
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(sessionId);
      return NextResponse.json(
        { success: false, message: 'OTP has expired' },
        { status: 400 }
      );
    }

    if (storedData.otp !== otp) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP verified successfully
    otpStore.delete(sessionId);
    console.log(`✅ Email OTP verified for ${storedData.email}`);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      email: storedData.email
    });

  } catch (error) {
    console.error('Email OTP verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Resend email OTP
export async function PATCH(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
        { status: 400 }
      );
    }

    const storedData = otpStore.get(sessionId);
    
    if (!storedData) {
      return NextResponse.json(
        { success: false, message: 'Invalid session' },
        { status: 400 }
      );
    }

    // Generate new OTP and session
    const newOtp = generateOTP();
    const newSessionId = 'email_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    const expires = Date.now() + 5 * 60 * 1000;

    // Remove old session
    otpStore.delete(sessionId);
    
    // Store new OTP
    otpStore.set(newSessionId, { otp: newOtp, expires, email: storedData.email });

    // Try to send email
    try {
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
        from: process.env.SMTP_FROM || 'noreply@trink.com',
        to: storedData.email,
        subject: 'TRINK - Email Verification OTP (Resent)',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">TRINK</h1>
              <p style="color: white; margin: 5px 0;">Transport & Logistics Platform</p>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; text-align: center;">Email Verification (Resent)</h2>
              <p style="color: #666; font-size: 16px;">Hello,</p>
              <p style="color: #666; font-size: 16px;">Here's your new OTP for email verification:</p>
              <div style="background: #667eea; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 5px;">
                ${newOtp}
              </div>
              <p style="color: #666; font-size: 14px;">This OTP will expire in 5 minutes.</p>
            </div>
            <div style="background: #333; color: white; text-align: center; padding: 15px; font-size: 12px;">
              © 2024 TRINK. All rights reserved.
            </div>
          </div>
        `,
      };

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
      }
    } catch (emailError) {
      console.error('Email resend failed:', emailError);
    }

    console.log(`📧 Email OTP resent to ${storedData.email}: ${newOtp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully',
      newSessionId,
      // Include OTP in development for testing
      ...(process.env.NODE_ENV === 'development' && { otp: newOtp })
    });

  } catch (error) {
    console.error('Email OTP resend error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to resend OTP. Please try again.' },
      { status: 500 }
    );
  }
}
