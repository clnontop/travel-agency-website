'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Phone, Key, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { smsService } from '../../utils/smsService';

export default function SMSConfigPage() {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Check current SMS service status
    const status = smsService.getStatus();
    setIsConfigured(status.configured);
  }, []);

  const handleConfigure = () => {
    if (!accountSid || !authToken || !fromNumber) {
      toast.error('Please fill in all Twilio credentials');
      return;
    }

    const success = smsService.configure({
      accountSid,
      authToken,
      fromNumber
    });

    if (success) {
      setIsConfigured(true);
      toast.success('✅ SMS Service configured successfully!');
    } else {
      toast.error('❌ Failed to configure SMS service. Check your credentials.');
    }
  };

  const handleTestSMS = async () => {
    if (!testNumber) {
      toast.error('Please enter a phone number to test');
      return;
    }

    setIsTesting(true);
    try {
      const result = await smsService.sendOTP(testNumber, '123456');
      if (result.success) {
        toast.success('🎉 Test SMS sent successfully! Check your phone.');
      } else {
        toast.error('Failed to send test SMS');
      }
    } catch (error) {
      toast.error('Error sending test SMS');
    } finally {
      setIsTesting(false);
    }
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
            📱 SMS Configuration
          </h1>
          <p className="text-gray-400 text-lg">
            Configure Twilio SMS to receive real OTP codes on your phone
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-2xl border ${
              isConfigured 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}
          >
            <div className="flex items-center">
              {isConfigured ? (
                <CheckCircle className="h-8 w-8 text-green-400 mr-4" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-400 mr-4" />
              )}
              <div>
                <h3 className={`text-xl font-semibold ${
                  isConfigured ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {isConfigured ? 'SMS Service Active' : 'SMS Service Not Configured'}
                </h3>
                <p className="text-gray-400">
                  {isConfigured 
                    ? 'Real SMS messages will be sent to your phone' 
                    : 'OTP codes will appear in browser console only'
                  }
                </p>
              </div>
            </div>
          </motion.div>

          {/* Twilio Setup Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Twilio Setup Guide
            </h2>
            
            <div className="space-y-4 text-gray-300">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">📋 Quick Setup Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to <a href="https://www.twilio.com/try-twilio" target="_blank" className="text-blue-400 hover:underline inline-flex items-center">Twilio.com <ExternalLink className="h-3 w-3 ml-1" /></a> and create a free account</li>
                  <li>Get $15 free credit (enough for 100+ SMS messages)</li>
                  <li>Find your <strong>Account SID</strong> and <strong>Auth Token</strong> in the Console</li>
                  <li>Get a <strong>Twilio phone number</strong> (free with trial account)</li>
                  <li>Enter the credentials below and click "Configure"</li>
                </ol>
              </div>
            </div>
          </motion.div>

          {/* Configuration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 mb-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Key className="h-6 w-6 mr-2" />
              Twilio Credentials
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account SID
                </label>
                <input
                  type="text"
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Auth Token
                </label>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="Your Twilio Auth Token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twilio Phone Number
                </label>
                <input
                  type="text"
                  value={fromNumber}
                  onChange={(e) => setFromNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="+1234567890"
                />
              </div>

              <motion.button
                onClick={handleConfigure}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Configure SMS Service
              </motion.button>
            </div>
          </motion.div>

          {/* Test SMS */}
          {isConfigured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
            >
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <Phone className="h-6 w-6 mr-2" />
                Test SMS
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white"
                    placeholder="+919876543210 or 9876543210"
                  />
                </div>

                <motion.button
                  onClick={handleTestSMS}
                  disabled={isTesting}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  whileHover={{ scale: isTesting ? 1 : 1.02 }}
                  whileTap={{ scale: isTesting ? 1 : 0.98 }}
                >
                  {isTesting ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Sending Test SMS...
                    </div>
                  ) : (
                    'Send Test SMS (OTP: 123456)'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center space-y-4"
          >
            <div className="flex justify-center space-x-4">
              <a
                href="/test-otp"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 inline-flex items-center"
              >
                🧪 Test OTP System
              </a>
              <a
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 inline-flex items-center"
              >
                📝 Try Registration
              </a>
            </div>
            
            <p className="text-gray-400 text-sm">
              💡 <strong>Tip:</strong> Once configured, all OTP codes will be sent to your phone instead of appearing in the console!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
