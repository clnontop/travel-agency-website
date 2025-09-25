'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Tablet, Wifi, WifiOff, Shield, CheckCircle } from 'lucide-react';
import { EnhancedSessionSync } from '@/utils/enhancedSessionSync';

interface CrossDeviceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string, userType: string, rememberDevice: boolean) => Promise<boolean>;
}

export default function CrossDeviceLoginModal({ isOpen, onClose, onLogin }: CrossDeviceLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'customer' | 'driver'>('customer');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Get device info when modal opens
      const info = getDeviceInfo();
      setDeviceInfo(info);
      
      // Check online status
      setIsOnline(navigator.onLine);
      
      // Listen for online/offline events
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isOpen]);

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    
    let deviceType = 'Desktop';
    let icon = Monitor;
    
    if (isTablet) {
      deviceType = 'Tablet';
      icon = Tablet;
    } else if (isMobile) {
      deviceType = 'Mobile';
      icon = Smartphone;
    }
    
    return {
      type: deviceType,
      icon,
      platform: navigator.platform,
      browser: getBrowserName(),
      location: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await onLogin(email, password, userType, rememberDevice);
      
      if (success) {
        onClose();
        setEmail('');
        setPassword('');
        setError('');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const DeviceIcon = deviceInfo?.icon || Monitor;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Cross-Device Login</h2>
            <p className="text-sm text-gray-400 mt-1">Sync across all your devices</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DeviceIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-medium">{deviceInfo?.type} Device</div>
              <div className="text-sm text-gray-400">{deviceInfo?.browser} on {deviceInfo?.platform}</div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className="text-xs text-gray-400">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Secure cross-device synchronization enabled</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUserType('customer')}
                className={`p-3 rounded-lg border transition-all ${
                  userType === 'customer'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-white/20 text-gray-400 hover:border-white/30'
                }`}
              >
                <div className="text-sm font-medium">Customer</div>
                <div className="text-xs opacity-80">Book trucks</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('driver')}
                className={`p-3 rounded-lg border transition-all ${
                  userType === 'driver'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-white/20 text-gray-400 hover:border-white/30'
                }`}
              >
                <div className="text-sm font-medium">Driver</div>
                <div className="text-xs opacity-80">Provide service</div>
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Remember Device */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="rememberDevice"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 text-red-500 bg-white/5 border border-white/20 rounded focus:ring-red-500 focus:ring-2"
            />
            <label htmlFor="rememberDevice" className="text-sm text-gray-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Remember this device for faster login
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isOnline}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Sign In Securely
              </>
            )}
          </button>

          {!isOnline && (
            <div className="text-center text-sm text-gray-400">
              Please check your internet connection
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400">
            Your session will sync across all devices automatically
          </p>
        </div>
      </div>
    </div>
  );
}
