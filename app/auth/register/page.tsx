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
  Check,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
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
    email: '',
    password: '',
    confirmPassword: '',
    emailOtp: '',
    phone: '',
    userType: 'customer' as 'driver' | 'customer' | 'admin', // Default to customer
    // Additional profile fields
    bio: '',
    location: '',
    company: '',
    vehicleType: '',
    licenseNumber: '',
    experience: '',
    specialization: ''
  });
  
  const [emailOtpSessionId, setEmailOtpSessionId] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

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
    } else if (currentStep === 3) {
      setCurrentStep(4);
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
      const response = await fetch('/api/email/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setEmailOtpSessionId(data.sessionId);
        setResendTimer(60); // 60 seconds
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

  // Verify Email Using Rendomly Generated OTP
  const handleVerifyEmailOTP = async () => {
    if (!formData.emailOtp || formData.emailOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'PUT',
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

  // Final registration submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailVerified) {
      toast.error('Please verify your email first');
      return;
    }

    setIsLoading(true);

    try {
      // Use Zustand store for registration
      const success = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '',
        type: formData.userType,
        bio: formData.bio,
        location: formData.location,
        company: formData.company,
        vehicleType: formData.vehicleType,
        licenseNumber: formData.licenseNumber
      });

      if (success) {
        // Check if user already existed (logged in automatically)
        const existingUserCheck = localStorage.getItem('trinck-registered-users');
        if (existingUserCheck) {
          const users = JSON.parse(existingUserCheck);
          const userExists = users.find((u: any) => 
            u.email.toLowerCase() === formData.email.toLowerCase() && 
            u.type === formData.userType
          );
          
          if (userExists) {
            toast.success('Welcome back! You were automatically logged in.');
          } else {
            toast.success('Account created successfully!');
          }
        } else {
          toast.success('Account created successfully!');
        }
        
        // Redirect based on user type (user is already logged in after registration)
        setTimeout(() => {
          if (formData.userType === 'driver') {
            router.push('/driver');
          } else if (formData.userType === 'customer') {
            router.push('/customer');
          } else {
            router.push('/dashboard');
          }
        }, 2000);
      } else {
        toast.error('Registration failed. Please try again.');
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
      {[1, 2, 3, 4].map((step) => (
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
          {step < 4 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-red-500' : 'bg-gray-600'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  if (userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 w-full max-w-md text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Registration Complete!</h2>
          <p className="text-gray-300 mb-4">
            Your account has been created successfully.
          </p>
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Your User ID:</p>
            <p className="text-white font-mono text-sm break-all">{userId}</p>
          </div>
          <div className="text-sm text-gray-400">
            Redirecting to login page...
          </div>
        </motion.div>
      </div>
    );
  }

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
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Truck className="h-8 w-8 text-red-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-300">Join our travel community</p>
          </div>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    I want to register as:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleInputChange('userType', 'customer')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.userType === 'customer'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <User className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">Customer</div>
                      <div className="text-xs text-gray-400 mt-1">Ship goods & track deliveries</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('userType', 'driver')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.userType === 'driver'
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Truck className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">Driver</div>
                      <div className="text-xs text-gray-400 mt-1">Find jobs & earn money</div>
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Email Verification */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">Verify Your Email</h3>
                  <p className="text-gray-400 text-sm">We've sent a verification code to:</p>
                  <p className="text-blue-400 font-medium">{formData.email}</p>
                </div>

                {!emailOtpSessionId ? (
                  <button
                    type="button"
                    onClick={handleSendEmailOTP}
                    disabled={otpLoading}
                    className={`w-full py-3 text-lg font-semibold rounded-lg transition-all flex items-center justify-center ${
                      otpLoading
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                    }`}
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="emailOtp" className="block text-sm font-medium text-gray-300 mb-2">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="emailOtp"
                        value={formData.emailOtp}
                        onChange={(e) => handleInputChange('emailOtp', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white text-center text-2xl font-mono tracking-widest transition-all"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyEmailOTP}
                      disabled={otpLoading || emailVerified || formData.emailOtp.length !== 6}
                      className={`w-full py-3 text-lg font-semibold rounded-lg transition-all flex items-center justify-center ${
                        otpLoading || emailVerified || formData.emailOtp.length !== 6
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                      }`}
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : emailVerified ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Verified
                        </>
                      ) : (
                        'Verify Code'
                      )}
                    </button>

                    {!emailVerified && (
                      <button
                        type="button"
                        onClick={handleSendEmailOTP}
                        disabled={resendTimer > 0 || otpLoading}
                        className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Profile Details */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Profile Details</h3>
                  <p className="text-gray-400 text-sm">Tell us more about yourself</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                    placeholder="City, State"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Driver-specific fields */}
                {formData.userType === 'driver' && (
                  <>
                    <div>
                      <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-300 mb-2">
                        Vehicle Type
                      </label>
                      <select
                        id="vehicleType"
                        value={formData.vehicleType}
                        onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="Mini Truck">Mini Truck</option>
                        <option value="Small Truck">Small Truck</option>
                        <option value="Medium Truck">Medium Truck</option>
                        <option value="Large Truck">Large Truck</option>
                        <option value="Container Truck">Container Truck</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-300 mb-2">
                        License Number
                      </label>
                      <input
                        type="text"
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                        placeholder="Enter your license number"
                      />
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
                        Years of Experience
                      </label>
                      <select
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                      >
                        <option value="">Select Experience</option>
                        <option value="0-1 years">0-1 years</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="10+ years">10+ years</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Customer-specific fields */}
                {formData.userType === 'customer' && (
                  <>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                        placeholder="Enter your company name"
                      />
                    </div>

                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-300 mb-2">
                        Business Type
                      </label>
                      <select
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                      >
                        <option value="">Select Business Type</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Individual">Individual</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 4: Final Verification */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Complete Registration</h3>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Email:</span>
                    <div className="flex items-center">
                      <span className="text-white mr-2">{formData.email}</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white capitalize">{formData.userType}</span>
                  </div>
                  {formData.location && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white">{formData.location}</span>
                    </div>
                  )}
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <p className="text-green-300 text-sm">
                      All details verified! Ready to create your account.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  ← Previous
                </button>
              )}
              
              <div className="ml-auto">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={currentStep === 2 && !emailVerified}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                      (currentStep === 2 && !emailVerified)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
                    }`}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                      isLoading
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
                    }`}
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

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-red-500 hover:text-red-400 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
