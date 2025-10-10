'use client';

import { useState, useEffect } from 'react';
import { EnhancedSessionSync } from '@/utils/enhancedSessionSync';
import { useAuth } from '@/store/useAuth';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Wifi, 
  WifiOff, 
  Activity,
  LogIn,
  LogOut,
  RefreshCw,
  Users,
  Clock,
  UserPlus
} from 'lucide-react';

export default function TestSessionPage() {
  const { user, login, logout, updateProfile } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [testCredentials, setTestCredentials] = useState({
    email: 'customer@trinck.com',
    password: 'demo123',
    userType: 'customer'
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      const result = await EnhancedSessionSync.login(
        testCredentials.email,
        testCredentials.password,
        testCredentials.userType,
        true // remember device
      );

      if (result.success && result.user) {
        // Update auth store with user data
        updateProfile(result.user);
        console.log('✅ Test login successful');
      } else {
        console.error('❌ Test login failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Test login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogout = async () => {
    setIsLoading(true);
    try {
      await EnhancedSessionSync.logout();
      logout();
      console.log('✅ Test logout successful');
    } catch (error) {
      console.error('❌ Test logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshSession = async () => {
    setIsLoading(true);
    try {
      const success = await EnhancedSessionSync.refreshSession();
      console.log(success ? '✅ Session refreshed' : '❌ Session refresh failed');
    } catch (error) {
      console.error('❌ Session refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔄 Cross-Device Session Sync Test
          </h1>
          <p className="text-slate-400">
            Test login synchronization across multiple devices and tabs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Authentication Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Authentication Test
            </h2>

            {!user ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={testCredentials.email}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={testCredentials.password}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">User Type</label>
                  <select
                    value={testCredentials.userType}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, userType: e.target.value }))}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="customer">Customer</option>
                    <option value="driver">Driver</option>
                  </select>
                </div>

                <button
                  onClick={handleTestLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  Test Login
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 font-semibold">Authenticated</span>
                  </div>
                  <div className="text-white">
                    <div className="text-lg font-medium">{user?.name}</div>
                    <div className="text-sm text-slate-300">{user?.email}</div>
                    <div className="text-xs text-slate-400 capitalize">{user?.type}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleRefreshSession}
                    disabled={isLoading}
                    className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>

                  <button
                    onClick={handleTestLogout}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Session Info Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Session Information
            </h2>

            {sessionInfo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Status</div>
                    <div className={`flex items-center gap-2 ${sessionInfo.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${sessionInfo.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                      {sessionInfo.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Network</div>
                    <div className={`flex items-center gap-2 ${sessionInfo.isOnline ? 'text-blue-400' : 'text-orange-400'}`}>
                      {sessionInfo.isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                      {sessionInfo.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>

                {sessionInfo.deviceId && (
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Device ID</div>
                    <div className="text-white font-mono text-sm">
                      {sessionInfo.deviceId.substring(0, 20)}...
                    </div>
                  </div>
                )}

                {sessionInfo.sessionData && (
                  <div className="space-y-3">
                    {sessionInfo.sessionData.deviceInfo && (
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-2">Device Info</div>
                        <div className="flex items-center gap-2 text-white">
                          {getDeviceIcon(sessionInfo.sessionData.deviceInfo.type)}
                          <span className="text-sm">{sessionInfo.sessionData.deviceInfo.type}</span>
                          <span className="text-xs text-slate-400">
                            {sessionInfo.sessionData.deviceInfo.platform}
                          </span>
                        </div>
                      </div>
                    )}

                    {sessionInfo.sessionData.loginTime && (
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="text-xs text-slate-400 mb-1">Login Time</div>
                        <div className="flex items-center gap-2 text-white text-sm">
                          <Clock className="w-3 h-3" />
                          {new Date(sessionInfo.sessionData.loginTime).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-500 mb-2">No session information</div>
                <div className="text-xs text-slate-600">Session sync not initialized</div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-blue-400 font-semibold mb-3">🧪 Testing Instructions</h3>
          <div className="text-slate-300 text-sm space-y-2">
            <p><strong>1. Single Device Test:</strong> Login here, then open another tab and navigate to this page. You should see the same session.</p>
            <p><strong>2. Cross-Device Test:</strong> Login here, then open the same URL on another device (phone/tablet). Session should sync.</p>
            <p><strong>3. Logout Test:</strong> Logout from one tab/device, all other tabs/devices should automatically logout.</p>
            <p><strong>4. Network Test:</strong> Disconnect internet, reconnect - session should remain active.</p>
            <p><strong>5. Heartbeat Test:</strong> Leave page open for 30+ seconds, check console for heartbeat logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
