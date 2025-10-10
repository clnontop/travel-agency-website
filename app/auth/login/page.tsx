'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Truck, User, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { LoginRequest, AuthResponse } from '@/types/auth';
import { useAuth } from '@/store/useAuth';
import AuthDebugger from '@/components/AuthDebugger';
import GoogleSignIn from '@/components/GoogleSignIn';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedInput from '@/components/ui/AnimatedInput';
import AnimatedButton from '@/components/ui/AnimatedButton';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'driver' | 'customer'>('customer');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const { login } = useAuth();

  useEffect(() => {
    if (message === 'registration-success') {
      toast.success('Registration successful! Please verify your email and then log in.');
    }
  }, [message]);

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      // Use the Zustand store login method
      const loginSuccess = await login(formData.email, formData.password, userType);

      if (loginSuccess) {
        toast.success('Login successful! Redirecting...');
        
        // FORCE redirect immediately
        if (userType === 'driver') {
          window.location.replace('/driver');
        } else if (userType === 'customer') {
          window.location.replace('/customer');
        } else {
          window.location.replace('/dashboard');
        }
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Truck className="h-8 w-8 text-red-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your verified account</p>
          </div>

          {/* User Type Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="bg-gray-700 rounded-lg p-1 flex">
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
            </div>
          </motion.div>

          {/* Info Message */}
          {message === 'registration-success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-green-300 text-sm">
                  Registration successful! Please check your email for verification.
                </p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            <AnimatedInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              required
            />


            <AnimatedInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-600 text-red-600 focus:ring-red-500 bg-gray-700" />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm text-red-500 hover:text-red-400">
                Forgot password?
              </Link>
            </div>

            <AnimatedButton
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              variant="danger"
              size="lg"
              className="w-full"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </AnimatedButton>

          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="my-6 flex items-center"
          >
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-sm text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </motion.div>

          {/* Google Sign-In */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <GoogleSignIn
              userType={userType}
              onSuccess={(user) => {
                toast.success(`Welcome back, ${user.firstName || user.name}!`);
              }}
              onError={(error) => {
                toast.error(error);
              }}
            />
          </motion.div>

          {/* Sign Up Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-red-500 hover:text-red-400 font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Auth Debugger - only shows in development */}
      <AuthDebugger />
    </div>
  );
}