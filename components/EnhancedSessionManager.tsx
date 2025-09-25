'use client';

import React, { useEffect, useState } from 'react';
import { EnhancedSessionSync } from '@/utils/enhancedSessionSync';
import { useAuth } from '@/store/useAuth';

interface SessionInfo {
  isActive: boolean;
  deviceId: string | null;
  isOnline: boolean;
  sessionData: any;
}

interface SessionManagerProps {
  children: React.ReactNode;
}

export default function EnhancedSessionManager({ children }: SessionManagerProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize enhanced session sync
    EnhancedSessionSync.init();
    setIsInitialized(true);

    // Update session info
    const updateSessionInfo = () => {
      const info = EnhancedSessionSync.getSessionInfo();
      setSessionInfo(info);
    };

    updateSessionInfo();

    // Set up periodic session info updates
    const sessionInfoTimer = setInterval(updateSessionInfo, 5000);

    // Cleanup on unmount
    return () => {
      clearInterval(sessionInfoTimer);
      EnhancedSessionSync.destroy();
    };
  }, []);

  // Auto-logout if session becomes invalid
  useEffect(() => {
    if (isInitialized && isAuthenticated && sessionInfo && !sessionInfo.isActive) {
      console.log('🔓 Session invalid - auto logout');
      logout();
    }
  }, [sessionInfo, isAuthenticated, isInitialized, logout]);

  return (
    <>
      {children}
      
      {/* Session Status Indicator (Development Mode) */}
      {process.env.NODE_ENV === 'development' && sessionInfo && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-black/80 text-white text-xs p-3 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${sessionInfo.isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="font-semibold">Session Status</span>
            </div>
            
            <div className="space-y-1 text-xs opacity-80">
              <div>Status: {sessionInfo.isActive ? '🟢 Active' : '🔴 Inactive'}</div>
              <div>Network: {sessionInfo.isOnline ? '🌐 Online' : '📴 Offline'}</div>
              <div>Device: {sessionInfo.deviceId?.substring(0, 12)}...</div>
              {sessionInfo.sessionData?.loginTime && (
                <div>Login: {new Date(sessionInfo.sessionData.loginTime).toLocaleTimeString()}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
