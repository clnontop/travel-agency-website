'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Truck, 
  User, 
  Phone, 
  Building, 
  CheckCircle, 
  CreditCard,
  Shield,
  Crown,
  FileText,
  MapPin,
  AlertCircle,
  Check,
  Clock,
  RefreshCw,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/useAuth';
import { otpService } from '@/utils/otpService';
import LoadingScreen from '@/components/LoadingScreen';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<'driver' | 'customer'>('driver');
  const [isLoading, setIsLoading] = useState(false);
  
  // Verification States
  const [phoneOtpSessionId, setPhoneOtpSessionId] = useState<string | null>(null);
  const [emailOtpSessionId, setEmailOtpSessionId] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  
  // Form Data - 3 Stage Process
  const [formData, setFormData] = useState({
    // Stage 1 - Basic Info (no email/phone)
    name: '',
    password: '',
    confirmPassword: '',
    location: '',
    bio: '',
    company: '', // for customers
    vehicleType: '', // for drivers
    licenseNumber: '', // for drivers
    
    // Stage 2 - Email Verification
    email: '',
    emailOtp: '',
    
    // Stage 3 - Phone Verification
    phone: '',
    phoneOtp: ''
  });
  
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set user type from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'customer' || type === 'driver') {
      setUserType(type);
    }
  }, [searchParams]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCountdown]);

  // Email Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (emailCountdown > 0) {
      interval = setInterval(() => {
        setEmailCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailCountdown]);

  // Format countdown time
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const premiumPlans = [
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: '₹3,000',
      duration: '/year',
      features: ['Priority listing', 'Premium badge', '24/7 support', 'Advanced analytics'],
      popular: true
    },
    {
      id: 'halfyearly',
      name: 'Half-Yearly Premium',
      price: '₹2,000',
      duration: '/6 months',
      features: ['Priority listing', 'Premium badge', '24/7 support']
    },
    {
      id: 'quarterly',
      name: 'Quarterly Premium',
      price: '₹1,200',
      duration: '/3 months',
      features: ['Priority listing', 'Premium badge']
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Phone OTP Handlers
  const handleSendPhoneOTP = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await otpService.sendPhoneOTP(formData.phone);
      if (result.success && result.sessionId) {
        setPhoneOtpSessionId(result.sessionId);
        setOtpCountdown(300); // 5 minutes
        setWhatsappLink(result.whatsappLink || null);
        toast.success(result.message);
        
        // Show WhatsApp option if available
        if (result.whatsappLink) {
          toast(
            <div>
              <p>{result.message}</p>
              <button 
                onClick={() => window.open(result.whatsappLink, '_blank')}
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm"
              >
                📱 Open WhatsApp
              </button>
            </div>,
            { duration: 8000 }
          );
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!phoneOtpSessionId || !formData.phoneOtp) {
      toast.error('Please enter the OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const result = await otpService.verifyOTP(phoneOtpSessionId, formData.phoneOtp);
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
        setFormData(prev => ({ ...prev, phoneOtp: '' }));
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

  // Email OTP handlers
  const handleSendEmailOTP = async () => {
    if (!formData.email || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailOtpSessionId(data.sessionId);
        setEmailCountdown(300); // 5 minutes
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Email OTP send error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!formData.emailOtp || formData.emailOtp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!emailOtpSessionId) {
      toast.error('Please request a new OTP');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: emailOtpSessionId, 
          otp: formData.emailOtp 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailVerified(true);
        setEmailCountdown(0);
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Email OTP verify error:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendEmailOTP = async () => {
    if (!emailOtpSessionId) {
      toast.error('Please start verification process again');
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch('/api/email/send-otp', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: emailOtpSessionId }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailOtpSessionId(data.newSessionId);
        setEmailCountdown(300);
        setFormData(prev => ({ ...prev, emailOtp: '' }));
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Email OTP resend error:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!formData.name || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (userType === 'driver' && !formData.vehicleType) {
        toast.error('Please select your vehicle type');
        return;
      }
    } else if (currentStep === 2) {
      // Validate email verification
      if (!emailVerified) {
        toast.error('Please verify your email address');
        return;
      }
    } else if (currentStep === 3) {
      // Validate phone verification
      if (!phoneVerified) {
        toast.error('Please verify your phone number');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Final validation before submission
    if (!emailVerified) {
      toast.error('Please verify your email address');
      return;
    }

    if (!phoneVerified) {
      toast.error('Please verify your phone number');
      return;
    }

    setIsLoading(true);
    setPageLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: userType,
        bio: formData.bio,
        location: formData.location,
        
        // Verification status
        phoneVerified,
        emailVerified,
        
        // Type-specific details
        company: userType === 'customer' ? formData.company : undefined,
        vehicleType: userType === 'driver' ? formData.vehicleType : undefined,
        licenseNumber: userType === 'driver' ? formData.licenseNumber : undefined
      };

      const success = await register(userData);
      
      if (success) {
        toast.success(`🎉 Successfully registered as ${userType === 'driver' ? 'Trucker' : 'Customer'}!`);
        
        // Show success animation
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        toast.error('Registration failed. Please try again.');
        setIsLoading(false);
        setPageLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const totalSteps = 3;

  // Show loading screen during final registration
  if (isLoading && currentStep === 3 && phoneVerified) {
    return <LoadingScreen message="Creating your account..." />;
  }

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
            {step <= currentStep ? (
              step < currentStep ? <Check className="h-5 w-5" /> : step
            ) : (
              step
            )}
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

  // Stage 1: Basic Info (no email/phone)
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Basic Information</h3>
        <p className="text-gray-400 text-sm">Let's start with your basic details</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Name *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
            placeholder="Enter your full name"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
            placeholder="Create a password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Confirm Password *
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
            placeholder="e.g., Mumbai, Maharashtra"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="w-full p-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white resize-none transition-all duration-200"
          rows={3}
          placeholder="Tell us about yourself..."
        />
      </div>

      {userType === 'driver' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle Type *
            </label>
            <select
              value={formData.vehicleType}
              onChange={(e) => handleInputChange('vehicleType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
            >
              <option value="">Select vehicle type</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Lorry">Lorry</option>
              <option value="Pickup">Pickup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              License Number
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
              placeholder="Enter your license number"
            />
          </div>
        </>
      )}

      {userType === 'customer' && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company Name
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
              placeholder="Enter company name (optional)"
            />
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input type="checkbox" className="rounded border-gray-600 text-red-600 focus:ring-red-500 bg-gray-700" required />
        <span className="ml-2 text-sm text-gray-300">
          I agree to the <a href="#" className="text-red-500 hover:text-red-400">Terms of Service</a> and{' '}
          <a href="#" className="text-red-500 hover:text-red-400">Privacy Policy</a>
        </span>
      </div>
    </motion.div>
  );

  // Email Verification Step
  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 text-purple-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Email Verification</h3>
        <p className="text-gray-400 text-sm">Enter and verify your email address</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
            placeholder="Enter your email address"
            required
          />
        </div>
        {formData.email && !validateEmail(formData.email) && (
          <p className="text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Please enter a valid email address
          </p>
        )}
      </div>

      {formData.email && validateEmail(formData.email) && (
        <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm text-center">
            We'll send a verification code to: <span className="font-semibold text-white">{formData.email}</span>
          </p>
        </div>
      )}

      {formData.email && validateEmail(formData.email) && !emailOtpSessionId ? (
        <motion.button
          type="button"
          onClick={handleSendEmailOTP}
          disabled={otpLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
          whileHover={{ scale: otpLoading ? 1 : 1.02 }}
          whileTap={{ scale: otpLoading ? 1 : 0.98 }}
        >
          {otpLoading ? (
            <div className="flex items-center justify-center">
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Sending OTP...
            </div>
          ) : (
            'Send Email OTP'
          )}
        </motion.button>
      ) : (
        emailOtpSessionId && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Email OTP
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.emailOtp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      handleInputChange('emailOtp', value);
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                <motion.button
                  type="button"
                  onClick={handleVerifyEmailOTP}
                  disabled={formData.emailOtp.length !== 6 || otpLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {otpLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    'Verify'
                  )}
                </motion.button>
              </div>
            </div>


            {emailCountdown > 0 && (
              <div className="text-center">
                <p className="text-gray-400 text-sm flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Resend OTP in {formatCountdown(emailCountdown)}
                </p>
              </div>
            )}

            {emailCountdown === 0 && !emailVerified && (
              <div className="text-center">
                <motion.button
                  type="button"
                  onClick={handleResendEmailOTP}
                  disabled={otpLoading}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors flex items-center justify-center mx-auto"
                  whileHover={{ scale: 1.05 }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Resend OTP
                </motion.button>
              </div>
            )}

            {emailVerified && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center"
              >
                <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                <span className="text-green-400 font-medium">Email verified successfully!</span>
              </motion.div>
            )}
          </div>
        )
      )}
    </motion.div>
  );

  // Stage 3: Phone Verification Step
  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <Phone className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Phone Verification</h3>
        <p className="text-gray-400 text-sm">Enter and verify your phone number</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200"
            placeholder="Enter your phone number"
            required
          />
        </div>
        {formData.phone && !validatePhone(formData.phone) && (
          <p className="text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Please enter a valid 10-digit phone number
          </p>
        )}
      </div>

      {formData.phone && validatePhone(formData.phone) && (
        <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
          <p className="text-gray-300 text-sm text-center">
            We'll send a 6-digit code to: <span className="font-semibold text-white">{formData.phone}</span>
          </p>
        </div>
      )}

      {formData.phone && validatePhone(formData.phone) && !phoneOtpSessionId ? (
        <motion.button
          type="button"
          onClick={handleSendPhoneOTP}
          disabled={otpLoading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100"
          whileHover={{ scale: otpLoading ? 1 : 1.02 }}
          whileTap={{ scale: otpLoading ? 1 : 0.98 }}
        >
          {otpLoading ? (
            <div className="flex items-center justify-center">
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Sending OTP...
            </div>
          ) : (
            'Send Phone OTP'
          )}
        </motion.button>
      ) : (
        phoneOtpSessionId && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter Phone OTP
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.phoneOtp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      handleInputChange('phoneOtp', value);
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-700 text-white transition-all duration-200 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
                <motion.button
                  type="button"
                  onClick={handleVerifyPhoneOTP}
                  disabled={formData.phoneOtp.length !== 6 || otpLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {otpLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    'Verify'
                  )}
                </motion.button>
              </div>
            </div>

            {otpCountdown > 0 && (
              <div className="text-center">
                <p className="text-gray-400 text-sm flex items-center justify-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Resend OTP in {formatCountdown(otpCountdown)}
                </p>
              </div>
            )}

            {otpCountdown === 0 && !phoneVerified && (
              <div className="text-center">
                <motion.button
                  type="button"
                  onClick={handleResendPhoneOTP}
                  disabled={otpLoading}
                  className="text-green-400 hover:text-green-300 font-medium transition-colors flex items-center justify-center mx-auto"
                  whileHover={{ scale: 1.05 }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Resend OTP
                </motion.button>
              </div>
            )}

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
        )
      )}
    </motion.div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700/50"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Truck className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-300">Join TRINK as a {userType === 'driver' ? 'Trucker' : 'Customer'}</p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* User Type Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="bg-gray-700 rounded-lg p-1 flex">
              <button
                onClick={() => setUserType('driver')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  userType === 'driver'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4 inline mr-2" />
                Driver
              </button>
              <button
                onClick={() => setUserType('customer')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  userType === 'customer'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Customer
              </button>
            </div>
          </motion.div>

          {/* Form */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <motion.button
                type="button"
                onClick={prevStep}
                className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </motion.button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < 3 ? (
              <motion.button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !phoneVerified}
                className={`flex items-center px-8 py-3 font-semibold rounded-lg transition-all duration-200 ${
                  isLoading || !phoneVerified
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                }`}
                whileHover={{ scale: isLoading || !phoneVerified ? 1 : 1.05 }}
                whileTap={{ scale: isLoading || !phoneVerified ? 1 : 0.95 }}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Create Account
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-gray-300">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-red-500 hover:text-red-400 font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}