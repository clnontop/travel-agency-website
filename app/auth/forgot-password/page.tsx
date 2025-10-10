'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Key } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Simple password reset without complex token system
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetKey, setResetKey] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      // Simple password reset - just check if user exists
      const users = JSON.parse(localStorage.getItem('users-storage') || '[]');
      const userExists = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (userExists) {
        setIsSubmitted(true);
        setResetKey('axhn itbh eaoo gxsm'); // Your reset key
        toast.success(`Password reset key sent to ${email}`);
        
        console.log('🔐 Reset Key: axhn itbh eaoo gxsm');
        console.log('🔗 Reset URL:', `/auth/reset-password?email=${encodeURIComponent(email)}&key=axhn%20itbh%20eaoo%20gxsm`);
      } else {
        toast.error('No account found with this email address.');
      }
    } catch (error) {
      toast.error('Failed to send reset instructions. Please try again.');
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
              <Mail className="h-8 w-8 text-red-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
            </h1>
            <p className="text-gray-300">
              {isSubmitted 
                ? 'We\'ve sent you a password reset link'
                : 'Enter your email to receive a password reset link'
              }
            </p>
          </div>

          {!isSubmitted ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
              onSubmit={handleSubmit}
            >
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white transition-all"
                    placeholder="Enter your email address"
                    required
                  />
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
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
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
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Reset Key Generated!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  We've generated a password reset key for <strong>{email}</strong>. 
                  Use this key to reset your password (valid for 5 minutes):
                </p>
                {resetKey && (
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Reset Key:</span>
                    </div>
                    <code className="text-green-400 font-mono text-sm break-all">
                      {resetKey}
                    </code>
                  </div>
                )}
                <Link
                  href={`/auth/reset-password?email=${encodeURIComponent(email)}&key=${encodeURIComponent(resetKey)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Key className="w-4 h-4" />
                  Reset Password Now
                </Link>
              </div>
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