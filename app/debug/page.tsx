'use client';

import { useAuth } from '@/store/useAuth';
import { useDriverWallets } from '@/store/useDriverWallets';
import { useJobs } from '@/store/useJobs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, Send, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export default function DebugPage() {
  const { user, login } = useAuth();
  const { getDriverWallet, getDriverTransactions, addPaymentToDriver } = useDriverWallets();
  const { jobs, clearAllJobs } = useJobs();
  const router = useRouter();
  const [testAmount, setTestAmount] = useState('500');
  
  // OTP Testing States
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPhone, setTestPhone] = useState('9876543210');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailSessionId, setEmailSessionId] = useState('');
  const [phoneSessionId, setPhoneSessionId] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Login as Rahul Sharma for testing
  const loginAsRahul = async () => {
    try {
      await login('rahul@example.com', 'password123', 'driver');
      toast.success('Logged in as Rahul Sharma');
    } catch (error) {
      toast.error('Login failed');
    }
  };

  // Email OTP Testing Functions
  const handleSendEmailOTP = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });

      const data = await response.json();
      if (data.success) {
        setEmailSessionId(data.sessionId);
        toast.success(data.message);
        // Show OTP in development mode
        if (data.otp) {
          toast(`🔑 Development OTP: ${data.otp}`, { duration: 15000, icon: '🔑' });
        }
      } else {
        toast.error(data.message || 'Failed to send email OTP');
      }
    } catch (error) {
      toast.error('Failed to send email OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtp || !emailSessionId) {
      toast.error('Please enter OTP and ensure email was sent');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: emailSessionId, otp: emailOtp }),
      });

      const data = await response.json();
      if (data.success) {
        setEmailVerified(true);
        toast.success('✅ Email verified successfully!');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Email verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  // Phone OTP Testing Functions
  const handleSendPhoneOTP = async () => {
    if (!testPhone) {
      toast.error('Please enter a phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: testPhone }),
      });

      const data = await response.json();
      console.log('📱 Phone OTP API Response:', data); // Debug log
      
      if (data.success) {
        setPhoneSessionId(data.sessionId || 'phone-session');
        toast.success(data.message);
        
        // Show OTP in development mode
        if (data.otp) {
          toast(`📱 Development OTP: ${data.otp}`, { duration: 15000, icon: '📱' });
          console.log(`📱 OTP for ${testPhone}: ${data.otp}`);
        }
        
        // Show WhatsApp link if available
        if (data.whatsappLink) {
          toast(`📱 WhatsApp Link Available - Check console for link`, { 
            duration: 10000
          });
          console.log('📱 WhatsApp Link:', data.whatsappLink);
        }
      } else {
        console.error('Phone OTP Error:', data);
        toast.error(data.message || 'Failed to send phone OTP');
      }
    } catch (error) {
      toast.error('Failed to send phone OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!phoneOtp || !phoneSessionId) {
      toast.error('Please enter OTP and ensure SMS was sent');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/sms/send-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: phoneSessionId, otp: phoneOtp }),
      });

      const data = await response.json();
      if (data.success) {
        setPhoneVerified(true);
        toast.success('✅ Phone verified successfully!');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Phone verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  // Add test payment to current user
  const addTestPayment = () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    const amount = parseFloat(testAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addPaymentToDriver(
      user.id,
      amount,
      'Test payment from debug page',
      'debug-customer',
      'Debug Customer'
    );
    
    toast.success(`Added ₹${amount} to ${user.name}'s wallet`);
  };

  // Clear all jobs function
  const handleClearAllJobs = () => {
    if (window.confirm('Are you sure you want to clear ALL jobs? This cannot be undone.')) {
      clearAllJobs();
      toast.success('All jobs cleared successfully!');
    }
  };

  // Get wallet info for current user
  const currentWallet = user ? getDriverWallet(user.id) : null;
  const currentTransactions = user ? getDriverTransactions(user.id) : [];

  // Get wallet info for Rahul Sharma specifically
  const rahulWallet = getDriverWallet('rahul-sharma');
  const rahulTransactions = getDriverTransactions('rahul-sharma');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 Debug & Testing Dashboard</h1>
        
        {/* OTP Testing Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border-l-4 border-blue-500 text-gray-900">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Mail className="h-6 w-6 mr-2 text-blue-500" />
            Email OTP Testing
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email to test"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSendEmailOTP}
                disabled={otpLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {otpLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Email OTP
              </button>
              
              {emailSessionId && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  OTP Sent
                </div>
              )}
            </div>

            {emailSessionId && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerifyEmailOTP}
                    disabled={otpLoading || emailOtp.length !== 6}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    Verify
                  </button>
                </div>
                {emailVerified && (
                  <div className="flex items-center text-green-600 mt-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Email Verified Successfully!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phone OTP Testing Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border-l-4 border-green-500 text-gray-900">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Phone className="h-6 w-6 mr-2 text-green-500" />
            Phone OTP Testing
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Phone Number</label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter 10-digit phone number"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSendPhoneOTP}
                disabled={otpLoading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {otpLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Phone OTP
              </button>
              
              {phoneSessionId && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  OTP Sent
                </div>
              )}
            </div>

            {phoneSessionId && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerifyPhoneOTP}
                    disabled={otpLoading || phoneOtp.length !== 6}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    Verify
                  </button>
                </div>
                {phoneVerified && (
                  <div className="flex items-center text-green-600 mt-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Phone Verified Successfully!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Jobs Info */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm text-gray-900">
          <h2 className="text-xl font-semibold mb-4">Jobs Status</h2>
          <div className="space-y-2">
            <p><strong>Total Jobs:</strong> {jobs.length}</p>
            <p><strong>Open Jobs:</strong> {jobs.filter(j => j.status === 'open').length}</p>
            <p><strong>In Progress:</strong> {jobs.filter(j => j.status === 'in-progress').length}</p>
            <p><strong>Completed:</strong> {jobs.filter(j => j.status === 'completed').length}</p>
            <p><strong>Pending Completion:</strong> {jobs.filter(j => j.status === 'pending-completion').length}</p>
          </div>
          <button
            onClick={handleClearAllJobs}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🗑️ Clear All Jobs
          </button>
        </div>

        {/* Current User Info */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm text-gray-900">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Type:</strong> {user.type}</p>
              <p><strong>Wallet Balance:</strong> ₹{currentWallet?.balance || 0}</p>
              <p><strong>Total Earned:</strong> ₹{currentWallet?.totalEarned || 0}</p>
              <p><strong>Transactions:</strong> {currentTransactions.length}</p>
            </div>
          ) : (
            <p className="text-gray-500">Not logged in</p>
          )}
        </div>

        {/* Rahul's Wallet Info */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm text-gray-900">
          <h2 className="text-xl font-semibold mb-4">Rahul Sharma's Wallet</h2>
          <div className="space-y-2">
            <p><strong>Balance:</strong> ₹{rahulWallet.balance}</p>
            <p><strong>Total Earned:</strong> ₹{rahulWallet.totalEarned}</p>
            <p><strong>Transactions:</strong> {rahulTransactions.length}</p>
            {rahulTransactions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Recent Transactions:</h3>
                <div className="space-y-1 text-sm">
                  {rahulTransactions.slice(0, 3).map(t => (
                    <div key={t.id} className="flex justify-between">
                      <span>{t.description}</span>
                      <span className="text-green-600">+₹{t.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm text-gray-900">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={loginAsRahul}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login as Rahul Sharma
            </button>
            
            <div className="flex space-x-2">
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={addTestPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Test Payment
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/driver')}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go to Driver Dashboard
              </button>
              <button
                onClick={() => router.push('/driver/wallet')}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Go to Driver Wallet
              </button>
            </div>

            <button
              onClick={() => router.push('/customer/pay')}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Go to Customer Payment Page
            </button>
          </div>
        </div>

        {/* Navigation Help */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Click "Login as Rahul Sharma" to switch to driver account</li>
            <li>Click "Add Test Payment" to add ₹500 to wallet</li>
            <li>Click "Go to Driver Wallet" to see the payment</li>
            <li>Or test real payment: Go to "Customer Payment Page" → Pay Rahul → Check wallet</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
