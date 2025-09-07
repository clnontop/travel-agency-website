'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  CheckCircle,
  Loader2,
  Truck,
  ArrowRight,
  ArrowLeft,
  Check,
  Phone,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    emailOtp: '',
    phone: '',
    phoneOtp: '',
    aadhaarNumber: '',
    aadhaarEmail: ''
  });
  
  const [emailOtpSessionId, setEmailOtpSessionId] = useState('');
  const [phoneOtpSessionId, setPhoneOtpSessionId] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const totalSteps = 4;

  // Remember user functionality
  useEffect(() => {
    const savedUser = localStorage.getItem('remembered_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || ''
      }));
    }
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateAadhaar = (aadhaar: string) => {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar);
  };

  // Define types
  interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    aadhaarNumber: string;
    aadhaarEmail: string;
  }

  interface AuthResponse {
    success: boolean;
    message: string;
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      // Save user data to localStorage for remembering
      localStorage.setItem('remembered_user', JSON.stringify({
        name: formData.name,
        email: formData.email
      }));
      setCurrentStep(2);
    } else if (currentStep === 2 && emailVerified) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Send Email OTP
  const handleSendEmailOTP = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          type: 'email'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setEmailOtpSessionId(data.sessionId);
        setEmailCountdown(300); // 5 minutes
        toast.success('OTP sent to your email');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send email OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOTP = async () => {
    if (!formData.emailOtp || formData.emailOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: emailOtpSessionId,
          otp: formData.emailOtp
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setEmailVerified(true);
        toast.success('Email verified successfully!');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Failed to verify email OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Send Phone OTP
  const handleSendPhoneOTP = async () => {
    if (!formData.phone || !validatePhone(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.phone,
          type: 'phone'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setPhoneOtpSessionId(data.sessionId);
        setPhoneCountdown(300); // 5 minutes
        toast.success('OTP sent to your phone');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Failed to send phone OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Phone OTP
  const handleVerifyPhoneOTP = async () => {
    if (!formData.phoneOtp || formData.phoneOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: phoneOtpSessionId,
          otp: formData.phoneOtp
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setPhoneVerified(true);
        toast.success('Phone verified successfully!');
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Failed to verify phone OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Aadhaar in real-time
  const handleVerifyAadhaar = async () => {
    if (!formData.aadhaarNumber || !validateAadhaar(formData.aadhaarNumber)) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    
    if (!formData.aadhaarEmail || !validateEmail(formData.aadhaarEmail)) {
      toast.error('Please enter the email linked to your Aadhaar');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/auth/verify-aadhaar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aadhaarNumber: formData.aadhaarNumber,
          aadhaarEmail: formData.aadhaarEmail
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAadhaarVerified(true);
        toast.success('Aadhaar verified successfully!');
      } else {
        toast.error(data.message || 'Aadhaar verification failed');
      }
    } catch (error) {
      toast.error('Failed to verify Aadhaar');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailVerified || !phoneVerified || !aadhaarVerified) {
      toast.error('Please complete all verifications before submitting');
      return;
    }

    setIsLoading(true);

    try {
      // Use the Zustand store register method for persistent storage
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        type: 'customer' as 'driver' | 'customer', // Default to customer
        bio: '',
        location: '',
        company: '',
        vehicleType: '',
        licenseNumber: ''
      };

      const registrationSuccess = await register(userData);

      if (registrationSuccess) {
        setRegistrationSuccess(true);
        toast.success('Account created successfully!');
        
        // Redirect to login after showing success message
        setTimeout(() => {
          router.push('/auth/login?message=registration-success');
        }, 3000);
      } else {
        toast.error('User already exists with this email');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              step <= currentStep
                ? 'bg-red-500 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: step * 0.1 }}
          >
            {step < currentStep ? <Check className="h-5 w-5" /> : step}
          </motion.div>
          {step < totalSteps && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-red-500' : 'bg-gray-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 w-full max-w-md text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Registration Successful!</h2>
          <p className="text-gray-300 mb-6">
            Please check your email to verify your account before logging in.
          </p>
          <div className="text-sm text-gray-400">
            Redirecting to login page...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join our travel community</p>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>
                
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Verification Details</h3>
              
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  placeholder="Phone Number (10 digits)"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  maxLength={10}
                  required
                />
              </div>

              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Aadhaar Number (12 digits)"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  maxLength={12}
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  placeholder="Aadhaar Linked Email"
                  value={formData.aadhaarEmail}
                  onChange={(e) => handleInputChange('aadhaarEmail', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> Your Aadhaar number will be verified with the email address linked to your Aadhaar card. Make sure both details are accurate.
                </p>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Verification Required</h3>
              
              {/* Email Verification */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Email Verification</h4>
                  {emailVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                
                {!emailOtpSessionId ? (
                  <button
                    onClick={handleSendEmailOTP}
                    disabled={otpLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {otpLoading ? 'Sending...' : 'Send Email OTP'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={formData.emailOtp}
                      onChange={(e) => handleInputChange('emailOtp', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                      maxLength={6}
                    />
                    <button
                      onClick={handleVerifyEmailOTP}
                      disabled={otpLoading || emailVerified}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      {otpLoading ? 'Verifying...' : emailVerified ? 'Verified ✓' : 'Verify Email OTP'}
                    </button>
                  </div>
                )}
              </div>

              {/* Phone Verification */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Phone Verification</h4>
                  {phoneVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                
                {!phoneOtpSessionId ? (
                  <button
                    onClick={handleSendPhoneOTP}
                    disabled={otpLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {otpLoading ? 'Sending...' : 'Send Phone OTP'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={formData.phoneOtp}
                      onChange={(e) => handleInputChange('phoneOtp', e.target.value)}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                      maxLength={6}
                    />
                    <button
                      onClick={handleVerifyPhoneOTP}
                      disabled={otpLoading || phoneVerified}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      {otpLoading ? 'Verifying...' : phoneVerified ? 'Verified ✓' : 'Verify Phone OTP'}
                    </button>
                  </div>
                )}
              </div>

              {/* Aadhaar Verification */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Aadhaar Verification</h4>
                  {aadhaarVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                
                <button
                  onClick={handleVerifyAadhaar}
                  disabled={otpLoading || aadhaarVerified}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {otpLoading ? 'Verifying...' : aadhaarVerified ? 'Verified ✓' : 'Verify Aadhaar'}
                </button>
              </div>

              {emailVerified && phoneVerified && aadhaarVerified && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <p className="text-green-300 text-sm">
                      All verifications completed! You can now proceed to create your account.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Review & Submit</h3>
              
              <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Email:</span>
                  <div className="flex items-center">
                    <span className="text-white mr-2">{formData.email}</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Phone:</span>
                  <div className="flex items-center">
                    <span className="text-white mr-2">{formData.phone}</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Aadhaar:</span>
                  <div className="flex items-center">
                    <span className="text-white mr-2">****-****-{formData.aadhaarNumber.slice(-4)}</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  By creating an account, you agree to our Terms of Service and Privacy Policy. All verifications have been completed.
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex justify-between pt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="text-red-400 hover:text-red-300 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
