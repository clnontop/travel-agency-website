'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff, Key, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
// Simple password reset without complex systems
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [resetKey, setResetKey] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const keyParam = searchParams.get('key');

  useEffect(() => {
    const validateResetKey = () => {
      if (!emailParam || !keyParam) {
        toast.error('Invalid reset link - missing email or key');
        router.push('/auth/forgot-password');
        return;
      }

      // Simple validation - just check if key matches
      if (keyParam === 'axhn itbh eaoo gxsm') {
        setTokenValid(true);
        setEmail(emailParam);
        setResetKey(keyParam);
        console.log(`✅ Reset key valid for ${emailParam}`);
      } else {
        toast.error('Invalid reset key');
        router.push('/auth/forgot-password');
      }
      
      setCheckingToken(false);
    };

    validateResetKey();
  }, [emailParam, keyParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Simple password reset - update user in localStorage
      const users = JSON.parse(localStorage.getItem('users-storage') || '[]');
      const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex !== -1) {
        users[userIndex].password = password;
        localStorage.setItem('users-storage', JSON.stringify(users));
        
        setIsSuccess(true);
        toast.success('Password reset successful! Please login with your new password.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        toast.error('User not found. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return null; // Will redirect
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
              {isSuccess ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Lock className="h-8 w-8 text-red-600" />
              )}
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSuccess ? 'Password Reset!' : 'Reset Password'}
            </h1>
            <p className="text-gray-300">
              {isSuccess 
                ? 'Your password has been successfully reset'
                : `Enter a new password for ${email}`
              }
            </p>
            
            {/* Reset Key Info */}
            {!isSuccess && resetKey && (
              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400">
                  <Key className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Using reset key: {resetKey}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isSuccess ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 text-lg font-semibold rounded-lg transition-all ${
                  isLoading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Success!</h3>
                <p className="text-gray-300 text-sm">
                  Your password has been reset successfully. You will be redirected to the login page in a few seconds.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Go to Login
              </Link>
            </motion.div>
          )}

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-red-500 hover:text-red-400 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
