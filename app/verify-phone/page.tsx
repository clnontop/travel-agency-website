'use client';

import React, { useState } from 'react';
import PhoneVerification from '@/components/PhoneVerification';
import { CheckCircle, Phone } from 'lucide-react';

export default function VerifyPhonePage() {
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');

  const handleVerified = (phoneNumber: string) => {
    setVerifiedPhone(phoneNumber);
    setIsVerified(true);
  };

  const resetVerification = () => {
    setIsVerified(false);
    setVerifiedPhone('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Phone Verification Test
          </h1>
          <p className="text-gray-600">
            Test the SMS OTP verification system with multiple fallback methods
          </p>
        </div>

        {!isVerified ? (
          <PhoneVerification onVerified={handleVerified} />
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Phone Verified Successfully!
            </h2>
            
            <p className="text-gray-600 mb-4">
              Your phone number has been verified:
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  {verifiedPhone}
                </span>
              </div>
            </div>

            <button
              onClick={resetVerification}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Verify Another Number
            </button>
          </div>
        )}

        {/* Information Panel */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6 text-gray-900">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            SMS OTP Verification Features
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Primary Methods:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• WhatsApp OTP delivery</li>
                <li>• Textbelt SMS (international)</li>
                <li>• Custom SMS via email gateways</li>
                <li>• Email fallback notification</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Security Features:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• 6-digit OTP generation</li>
                <li>• 5-minute expiration</li>
                <li>• 3 attempt limit</li>
                <li>• Session-based verification</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Development Mode:</strong> OTPs are logged to console for testing. 
              In production, real SMS will be sent via configured services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
