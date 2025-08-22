'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Shield, Clock, RefreshCw, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { otpService } from '../../utils/otpService';

export default function TestOTPPage() {
  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSessionId, setPhoneOtpSessionId] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  // Aadhaar OTP State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [aadhaarOtpSessionId, setAadhaarOtpSessionId] = useState<string | null>(null);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  
  // Common State
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCountdown]);

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Phone OTP Handlers
  const handleSendPhoneOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await otpService.sendPhoneOTP(phoneNumber);
      if (result.success && result.sessionId) {
        setPhoneOtpSessionId(result.sessionId);
        setOtpCountdown(300); // 5 minutes
        toast.success(result.message);
        console.log(`📱 Phone OTP for ${phoneNumber}: Check console for OTP`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to send Phone OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!phoneOtpSessionId || !phoneOtp) {
      toast.error('Please enter the OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await otpService.verifyOTP(phoneOtpSessionId, phoneOtp);
      if (result.success) {
        setPhoneVerified(true);
        setOtpCountdown(0);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendPhoneOTP = async () => {
    if (!phoneOtpSessionId) return;
    
    setOtpLoading(true);
    try {
      const result = await otpService.resendOTP(phoneOtpSessionId);
      if (result.success && result.newSessionId) {
        setPhoneOtpSessionId(result.newSessionId);
        setOtpCountdown(300);
        setPhoneOtp('');
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to resend OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Aadhaar OTP Handlers
  const handleSendAadhaarOTP = async () => {
    if (!aadhaarNumber || aadhaarNumber.replace(/\s/g, '').length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await otpService.sendAadhaarOTP(aadhaarNumber);
      if (result.success && result.sessionId) {
        setAadhaarOtpSessionId(result.sessionId);
        setOtpCountdown(300); // 5 minutes
        toast.success(result.message);
        console.log(`🆔 Aadhaar OTP for ${aadhaarNumber}: Check console for OTP`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to send Aadhaar OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAadhaarOTP = async () => {
    if (!aadhaarOtpSessionId || !aadhaarOtp) {
      toast.error('Please enter the OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await otpService.verifyOTP(aadhaarOtpSessionId, aadhaarOtp);
      if (result.success) {
        setAadhaarVerified(true);
        setOtpCountdown(0);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendAadhaarOTP = async () => {
    if (!aadhaarOtpSessionId) return;
    
    setOtpLoading(true);
    try {
      const result = await otpService.resendOTP(aadhaarOtpSessionId);
      if (result.success && result.newSessionId) {
        setAadhaarOtpSessionId(result.newSessionId);
        setOtpCountdown(300);
        setAadhaarOtp('');
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to resend OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const resetPhoneTest = () => {
    setPhoneNumber('');
    setPhoneOtp('');
    setPhoneOtpSessionId(null);
    setPhoneVerified(false);
    setOtpCountdown(0);
  };

  const resetAadhaarTest = () => {
    setAadhaarNumber('');
    setAadhaarOtp('');
    setAadhaarOtpSessionId(null);
    setAadhaarVerified(false);
    setOtpCountdown(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 OTP Testing Lab
          </h1>
          <p className="text-gray-400 text-lg">
            Test Phone and Aadhaar OTP verification functionality
          </p>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mt-4 max-w-2xl mx-auto">
            <p className="text-yellow-300 text-sm">
              📝 <strong>Note:</strong> OTP codes will appear in the browser console (F12 → Console tab)
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Phone OTP Testing */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-6">
              <Phone className="h-8 w-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-semibold text-white">Phone OTP Test</h2>
            </div>

            <div className="space-y-4">
              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                />
              </div>

              {/* Send OTP Button */}
              {!phoneOtpSessionId ? (
                <motion.button
                  onClick={handleSendPhoneOTP}
                  disabled={otpLoading || phoneNumber.length < 10}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {otpLoading ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 inline mr-2" />
                      Send Phone OTP
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="space-y-4">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enter OTP
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={phoneOtp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 6) setPhoneOtp(value);
                        }}
                        className="flex-1 px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white text-center text-lg tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <motion.button
                        onClick={handleVerifyPhoneOTP}
                        disabled={phoneOtp.length !== 6 || otpLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Verify
                      </motion.button>
                    </div>
                  </div>

                  {/* Timer and Resend */}
                  {otpCountdown > 0 && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Resend in {formatCountdown(otpCountdown)}
                      </p>
                    </div>
                  )}

                  {otpCountdown === 0 && !phoneVerified && (
                    <div className="text-center">
                      <motion.button
                        onClick={handleResendPhoneOTP}
                        disabled={otpLoading}
                        className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center mx-auto"
                        whileHover={{ scale: 1.05 }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resend OTP
                      </motion.button>
                    </div>
                  )}

                  {/* Success State */}
                  {phoneVerified && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center"
                    >
                      <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                      <span className="text-green-400 font-medium">Phone verified successfully!</span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Reset Button */}
              <motion.button
                onClick={resetPhoneTest}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
              >
                Reset Phone Test
              </motion.button>
            </div>
          </motion.div>

          {/* Aadhaar OTP Testing */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 text-red-500 mr-3" />
              <h2 className="text-2xl font-semibold text-white">Aadhaar OTP Test</h2>
            </div>

            <div className="space-y-4">
              {/* Aadhaar Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 12) {
                      // Format as XXXX XXXX XXXX
                      if (value.length > 8) {
                        value = value.slice(0, 4) + ' ' + value.slice(4, 8) + ' ' + value.slice(8);
                      } else if (value.length > 4) {
                        value = value.slice(0, 4) + ' ' + value.slice(4);
                      }
                      setAadhaarNumber(value);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                />
              </div>

              {/* Send OTP Button */}
              {!aadhaarOtpSessionId ? (
                <motion.button
                  onClick={handleSendAadhaarOTP}
                  disabled={otpLoading || aadhaarNumber.replace(/\s/g, '').length !== 12}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {otpLoading ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 inline mr-2" />
                      Send Aadhaar OTP
                    </>
                  )}
                </motion.button>
              ) : (
                <div className="space-y-4">
                  {/* OTP Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enter OTP
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={aadhaarOtp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 6) setAadhaarOtp(value);
                        }}
                        className="flex-1 px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white text-center text-lg tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                      />
                      <motion.button
                        onClick={handleVerifyAadhaarOTP}
                        disabled={aadhaarOtp.length !== 6 || otpLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Verify
                      </motion.button>
                    </div>
                  </div>

                  {/* Timer and Resend */}
                  {otpCountdown > 0 && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Resend in {formatCountdown(otpCountdown)}
                      </p>
                    </div>
                  )}

                  {otpCountdown === 0 && !aadhaarVerified && (
                    <div className="text-center">
                      <motion.button
                        onClick={handleResendAadhaarOTP}
                        disabled={otpLoading}
                        className="text-red-400 hover:text-red-300 font-medium flex items-center justify-center mx-auto"
                        whileHover={{ scale: 1.05 }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resend OTP
                      </motion.button>
                    </div>
                  )}

                  {/* Success State */}
                  {aadhaarVerified && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center"
                    >
                      <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                      <span className="text-green-400 font-medium">Aadhaar verified successfully!</span>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Reset Button */}
              <motion.button
                onClick={resetAadhaarTest}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
              >
                Reset Aadhaar Test
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-semibold text-white mb-4">📋 Testing Instructions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-400 mb-2">Phone OTP Testing:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Enter any 10-digit phone number</li>
                <li>• Click "Send Phone OTP"</li>
                <li>• Check browser console (F12) for OTP code</li>
                <li>• Enter the 6-digit OTP and verify</li>
                <li>• Test resend functionality after timer expires</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-400 mb-2">Aadhaar OTP Testing:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Enter any 12-digit Aadhaar number</li>
                <li>• Click "Send Aadhaar OTP"</li>
                <li>• Check browser console (F12) for OTP code</li>
                <li>• Enter the 6-digit OTP and verify</li>
                <li>• Test resend functionality after timer expires</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
