'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendVerificationEmail = async () => {
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        toast.success('Verification email sent! Check your inbox.');
        setResendTimer(60); // 60 second cooldown
      } else {
        toast.error(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error('Failed to send verification email');
    } finally {
      setIsResending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!sessionId) {
      toast.error('Please request a new OTP first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          otp: otp
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsVerified(true);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login?message=email-verified');
        }, 2000);
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleanValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isVerified ? 'bg-green-100' : 'bg-blue-100'
              }`}
            >
              {isVerified ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Mail className="h-8 w-8 text-blue-600" />
              )}
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isVerified ? 'Email Verified!' : 'Verify Your Email'}
            </h1>
            <p className="text-gray-300">
              {isVerified 
                ? 'Your email has been successfully verified'
                : 'Enter the 6-digit code sent to your email'
              }
            </p>
            {email && (
              <p className="text-sm text-blue-400 mt-2 break-all">{email}</p>
            )}
          </div>

          {!isVerified ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                onClick={sendVerificationEmail}
                disabled={isResending || resendTimer > 0 || !email}
                className={`w-full py-3 text-lg font-semibold rounded-lg transition-all flex items-center justify-center ${
                  isResending || resendTimer > 0 || !email
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                }`}
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  'Send Verification Code'
                )}
              </button>

              {/* OTP Input */}
              {sessionId && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => handleOTPChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white text-center text-2xl font-mono tracking-widest transition-all"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <button
                    onClick={verifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className={`w-full py-3 text-lg font-semibold rounded-lg transition-all flex items-center justify-center ${
                      isLoading || otp.length !== 6
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                </motion.div>
              )}

              {/* Info Message */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-blue-300 text-sm">
                    <p className="font-medium mb-1">Check your email:</p>
                    <ul className="text-xs space-y-1 text-blue-200">
                      <li>• Look for an email from Travel Agency</li>
                      <li>• Check your spam/junk folder</li>
                      <li>• Code expires in 5 minutes</li>
                      <li>• Contact support if you don't receive it</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300">
                  Your email has been successfully verified! You can now log in to your account.
                </p>
              </div>
              
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
              >
                Continue to Login
              </Link>
            </motion.div>
          )}

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
