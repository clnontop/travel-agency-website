'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Phone, MessageSquare, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void;
  onCancel?: () => void;
  initialPhone?: string;
  className?: string;
}

interface OTPResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  whatsappLink?: string;
}

export default function PhoneVerification({ 
  onVerified, 
  onCancel, 
  initialPhone = '', 
  className = '' 
}: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [whatsappLink, setWhatsappLink] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (step === 'otp' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [step, timeLeft]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format phone number for display
  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2');
    }
    return phone;
  };

  // Validate phone number
  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 13;
  };

  // Send OTP
  const sendOTP = async () => {
    if (!validatePhone(phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data: OTPResponse = await response.json();

      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        setWhatsappLink(data.whatsappLink || '');
        setMessage(data.message);
        setStep('otp');
        setTimeLeft(300);
        setCanResend(false);
        toast.success(data.message);
      } else {
        setMessage(data.message || 'Failed to send OTP');
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const verifyOTP = async (otpCode: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, otp: otpCode })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Phone verified successfully!');
        onVerified(phoneNumber);
      } else {
        toast.error(data.message);
        // Clear OTP on failure
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        setMessage(data.message);
        setTimeLeft(300);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        toast.success('OTP resent successfully');
        otpRefs.current[0]?.focus();
      } else {
        setMessage(data.message || 'Failed to resend OTP');
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 ${className}`}>
      {step === 'phone' ? (
        // Phone Number Input Step
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Phone Number</h2>
          <p className="text-gray-600 mb-8">
            We'll send you a verification code to confirm your phone number
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                disabled={loading}
              />
            </div>

            <button
              onClick={sendOTP}
              disabled={loading || !phoneNumber.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  Send Verification Code
                </>
              )}
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        // OTP Verification Step
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
          <p className="text-gray-600 mb-2">
            We sent a 6-digit code to
          </p>
          <p className="text-blue-600 font-semibold mb-6">
            {formatPhoneDisplay(phoneNumber)}
          </p>

          <div className="space-y-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  maxLength={1}
                  disabled={loading}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-sm text-gray-600">
              {timeLeft > 0 ? (
                <p>Code expires in {formatTime(timeLeft)}</p>
              ) : (
                <p className="text-red-600">Code has expired</p>
              )}
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successfully') || message.includes('verified') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
                {message.includes('console') && (
                  <div className="mt-2 text-sm">
                    💡 <strong>Check your terminal/console for the OTP code</strong>
                  </div>
                )}
              </div>
            )}

            {/* WhatsApp Link */}
            {whatsappLink && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-2">
                  SMS delivery failed? Try WhatsApp:
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Send via WhatsApp
                </a>
              </div>
            )}

            {/* Resend Button */}
            <button
              onClick={resendOTP}
              disabled={!canResend || resending}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 mx-auto"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              onClick={() => {
                setStep('phone');
                setOtp(['', '', '', '', '', '']);
                setTimeLeft(300);
              }}
              className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
            >
              Change Phone Number
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
