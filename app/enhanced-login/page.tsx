'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Smartphone, Monitor, Tablet, Users, Shield, Zap, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import { EnhancedSessionSync } from '@/utils/enhancedSessionSync';
import CrossDeviceLoginModal from '@/components/CrossDeviceLoginModal';
import EnhancedSessionManager from '@/components/EnhancedSessionManager';

export default function EnhancedLoginPage() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [demoUsers] = useState([
    { email: 'customer@trinck.com', password: 'demo123', type: 'customer', name: 'Demo Customer' },
    { email: 'driver@trinck.com', password: 'demo123', type: 'driver', name: 'Demo Driver' },
  ]);

  useEffect(() => {
    // Update session info periodically
    const updateSessionInfo = () => {
      const info = EnhancedSessionSync.getSessionInfo();
      setSessionInfo(info);
    };

    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (email: string, password: string, userType: string, rememberDevice: boolean) => {
    try {
      const success = await login(email, password, userType as any, rememberDevice);
      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const handleQuickLogin = async (demoUser: any) => {
    const success = await handleLogin(demoUser.email, demoUser.password, demoUser.type, true);
    if (success) {
      setShowLoginModal(false);
    }
  };

  return (
    <EnhancedSessionManager>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Home</span>
                </Link>
                <div className="h-6 w-px bg-white/20" />
                <h1 className="text-xl font-bold text-white">Enhanced Cross-Device Login</h1>
              </div>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-300">
                    Welcome, <span className="text-white font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Enhanced Security & Synchronization
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Cross-Device
              <span className="block bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Authentication
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Experience seamless login across all your devices with real-time synchronization, 
              enhanced security, and automatic session management.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Try Enhanced Login
                </button>
                
                <div className="flex gap-2">
                  {demoUsers.map((demoUser, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickLogin(demoUser)}
                      className="px-4 py-4 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all text-sm"
                    >
                      Quick Login as {demoUser.type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Cross-Device Sync</h3>
              <p className="text-gray-400">
                Login on any device and your session automatically syncs across all platforms - mobile, tablet, desktop.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Enhanced Security</h3>
              <p className="text-gray-400">
                Advanced session tokens, device fingerprinting, and automatic session validation for maximum security.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-Time Updates</h3>
              <p className="text-gray-400">
                Instant session updates, cross-tab synchronization, and automatic logout when needed.
              </p>
            </div>
          </div>

          {/* Session Status */}
          {sessionInfo && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6">Live Session Status</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Session Info */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${sessionInfo.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                    <h3 className="text-lg font-semibold text-white">
                      Session {sessionInfo.isActive ? 'Active' : 'Inactive'}
                    </h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white">
                        {sessionInfo.isActive ? '🟢 Connected' : '🔴 Disconnected'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-white">
                        {sessionInfo.isOnline ? '🌐 Online' : '📴 Offline'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Device ID:</span>
                      <span className="text-white font-mono text-xs">
                        {sessionInfo.deviceId?.substring(0, 16)}...
                      </span>
                    </div>
                    
                    {sessionInfo.sessionData?.loginTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Login Time:</span>
                        <span className="text-white">
                          {new Date(sessionInfo.sessionData.loginTime).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Info */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-4">Current Device</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
                      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
                      const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
                      
                      let DeviceIcon = Monitor;
                      let deviceType = 'Desktop';
                      
                      if (isTablet) {
                        DeviceIcon = Tablet;
                        deviceType = 'Tablet';
                      } else if (isMobile) {
                        DeviceIcon = Smartphone;
                        deviceType = 'Mobile';
                      }
                      
                      return (
                        <>
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <DeviceIcon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{deviceType}</div>
                            <div className="text-sm text-gray-400">
                              {typeof window !== 'undefined' ? navigator.platform : 'Unknown'}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Secure connection established</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Cross-device sync enabled</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Real-time updates active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
              
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                    <p className="text-gray-400">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        {user.type}
                      </span>
                      {user.isPremium && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">₹{user.wallet.balance}</div>
                    <div className="text-sm text-gray-400">Wallet Balance</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">{user.memberSince}</div>
                    <div className="text-sm text-gray-400">Member Since</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-bold text-white">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                    </div>
                    <div className="text-sm text-gray-400">Last Login</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Instructions */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Try It Out</h2>
            <div className="max-w-2xl mx-auto p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-2 justify-center mb-4">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">Demo Instructions</span>
              </div>
              <p className="text-gray-300 mb-4">
                Test the cross-device login system by opening this page in multiple tabs or devices. 
                When you login/logout in one tab, watch how it instantly syncs across all other tabs!
              </p>
              <div className="text-sm text-gray-400">
                <strong>Demo Accounts:</strong><br />
                Customer: customer@trinck.com / demo123<br />
                Driver: driver@trinck.com / demo123
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        <CrossDeviceLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      </div>
    </EnhancedSessionManager>
  );
}
