import { NextRequest, NextResponse } from 'next/server';
import { textbeltService } from '@/utils/textbeltService';
import { customSmsService } from '@/utils/customSmsService';
import { whatsappOtpService } from '@/utils/whatsappOtpService';
import { emailPhoneVerificationService } from '@/utils/emailPhoneVerificationService';

// SMS API route using Textbelt for phone verification
export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, userEmail } = await request.json();

    // Validate input
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, message: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Extract OTP from message if it's an OTP message
    const otpMatch = message.match(/(\d{6})/);
    const otp = otpMatch ? otpMatch[1] : '';

    if (otp) {
      // Primary method: Use WhatsApp for OTP sending
      const whatsappResult = await whatsappOtpService.sendOTP(phoneNumber, otp);
      
      if (whatsappResult.success) {
        return NextResponse.json({
          success: true,
          message: whatsappResult.message,
          method: whatsappResult.method,
          whatsappLink: whatsappResult.whatsappLink,
          messageId: whatsappResult.messageId || `whatsapp_${Date.now()}`
        });
      }

      // Fallback 1: Try Textbelt SMS
      console.log('WhatsApp failed, trying Textbelt SMS:', whatsappResult.message);
      const textbeltResult = await textbeltService.sendFormattedOTP(phoneNumber, otp);
      
      if (textbeltResult.success) {
        return NextResponse.json({
          success: true,
          message: 'WhatsApp failed. Verification code sent via SMS',
          method: 'textbelt-fallback',
          messageId: textbeltResult.messageId,
          quotaRemaining: textbeltResult.quotaRemaining
        });
      }

      // Fallback 2: Custom SMS service
      console.log('Textbelt also failed, trying custom service');
      const customResult = await customSmsService.sendOTP(phoneNumber, otp, userEmail);
      
      if (customResult.success) {
        return NextResponse.json({
          success: true,
          message: customResult.message,
          method: customResult.method,
          whatsappLink: customResult.whatsappLink,
          messageId: `fallback_${Date.now()}`
        });
      }

      // Final Fallback: Email phone verification
      if (userEmail) {
        console.log('All SMS methods failed, trying email phone verification');
        const emailResult = await emailPhoneVerificationService.sendVerificationEmail(phoneNumber, userEmail);
        
        return NextResponse.json({
          success: emailResult.success,
          message: emailResult.success ? emailResult.message : 'All delivery methods failed. Please try again.',
          method: emailResult.method,
          verificationId: emailResult.verificationId,
          messageId: `email_verification_${Date.now()}`
        });
      }

      return NextResponse.json({
        success: false,
        message: 'All delivery methods failed. Please try again.',
        method: 'all-failed'
      });
    } else {
      // Regular SMS sending via Textbelt
      const result = await textbeltService.sendSMS(phoneNumber, message);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'SMS sent successfully',
          method: 'textbelt',
          messageId: result.messageId,
          quotaRemaining: result.quotaRemaining
        });
      } else {
        // Fallback to custom service
        const fallbackResult = await customSmsService.sendSMSViaEmail(phoneNumber, message);
        
        return NextResponse.json({
          success: fallbackResult.success,
          message: fallbackResult.message,
          method: fallbackResult.method,
          messageId: `fallback_${Date.now()}`
        });
      }
    }

  } catch (error) {
    console.error('SMS API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send SMS. Please try again.' },
      { status: 500 }
    );
  }
}

