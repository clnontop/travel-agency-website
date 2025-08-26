import { NextRequest, NextResponse } from 'next/server';

// Enhanced phone verification email API route
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp, userEmail, verificationId, expiresAt, isResend, phoneChallenge } = await request.json();

    if (!phoneNumber || !otp || !userEmail) {
      return NextResponse.json(
        { success: false, message: 'Phone number, OTP, and user email are required' },
        { status: 400 }
      );
    }

    // Email service configured with fallback credentials
    const emailUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'trinck.official@gmail.com';
    const emailPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'qovj wpmz kbeo tdzq';

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Format phone number for display
    const formatPhoneForDisplay = (phone: string): string => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `+91 ${cleaned.substr(0, 5)} ${cleaned.substr(5)}`;
      }
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        return `+91 ${cleaned.substr(2, 5)} ${cleaned.substr(7)}`;
      }
      return phone;
    };

    const formattedPhone = formatPhoneForDisplay(phoneNumber);
    const expiryTime = expiresAt ? new Date(expiresAt).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }) : '5 minutes';

    const mailOptions = {
      from: `"TRINK Verification" <${emailUser}>`,
      to: userEmail,
      subject: isResend ? 'TRINK - New Phone Verification Code (Email Backup)' : 'TRINK - Phone Verification Code (Email Backup)',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📱 Phone Verification (Email Backup)</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">TRINK Transport Platform</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px; background: white;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
              <p style="color: #856404; font-size: 14px; margin: 0;"><strong>📧 Email Backup Method</strong><br>SMS delivery failed. This is a backup phone verification via email.</p>
            </div>
            
            ${isResend ? 
              `<div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
                <p style="color: #1976d2; font-size: 14px; margin: 0;"><strong>🔄 New Code Generated</strong><br>Your previous code has been replaced with a new one.</p>
              </div>` : ''
            }
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px; font-size: 24px;">Phone Verification Code (Email Backup)</h2>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; display: inline-block;">
                <p style="color: #666; font-size: 16px; margin: 0;">Phone Number to Verify</p>
                <p style="color: #333; font-size: 20px; font-weight: 600; margin: 8px 0 0 0;">${formattedPhone}</p>
              </div>
            </div>

            <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 30px;">
              SMS delivery to this phone number failed. Use the backup verification code below to complete phone verification:
            </p>

            <!-- OTP Display -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 42px; font-weight: bold; text-align: center; padding: 30px; margin: 30px 0; border-radius: 12px; letter-spacing: 12px; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);">
              ${otp}
            </div>

            <!-- Instructions -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #856404; font-size: 16px; margin: 0 0 10px 0;">⏰ Important Instructions:</h3>
              <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>This code expires at <strong>${expiryTime}</strong></li>
                <li>Enter this code in the phone verification field</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>

            <!-- Verification ID (for support) -->
            ${verificationId ? 
              `<div style="background: #f8f9fa; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                  <strong>Verification ID:</strong> ${verificationId}<br>
                  <em>Keep this ID for support reference if needed</em>
                </p>
              </div>` : ''
            }

            ${phoneChallenge ? 
              `<!-- Phone Verification Challenge -->
              <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #2e7d32; font-size: 16px; margin: 0 0 15px 0;">📱 Additional Phone Verification Required</h3>
                <p style="color: #2e7d32; font-size: 14px; margin: 0 0 10px 0;">
                  <strong>Challenge Type:</strong> ${phoneChallenge.type.replace('_', ' ').toUpperCase()}
                </p>
                <div style="background: white; border-radius: 6px; padding: 15px; margin: 10px 0;">
                  <p style="color: #333; font-size: 14px; margin: 0; line-height: 1.5;">
                    ${phoneChallenge.instructions}
                  </p>
                </div>
                <p style="color: #2e7d32; font-size: 12px; margin: 10px 0 0 0;">
                  <em>Complete both the OTP verification above AND this phone challenge to fully verify your number.</em>
                </p>
              </div>` : ''
            }

            <!-- Help Section -->
            <div style="border-top: 1px solid #eee; padding-top: 25px; margin-top: 30px;">
              <h3 style="color: #333; font-size: 16px; margin-bottom: 15px;">Need Help?</h3>
              <p style="color: #666; font-size: 14px; margin: 0;">
                If you're having trouble with verification, please contact our support team. 
                Make sure to include your verification ID for faster assistance.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #333; color: #ccc; text-align: center; padding: 25px; font-size: 12px; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 8px 0;">© 2024 TRINK Transport. All rights reserved.</p>
            <p style="margin: 0; opacity: 0.8;">This is an automated message for phone verification.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({
      success: true,
      message: isResend ? 'New verification code sent to email' : 'Phone verification code sent to email',
      verificationId,
      expiresAt
    });

  } catch (error) {
    console.error('Phone verification email failed:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
