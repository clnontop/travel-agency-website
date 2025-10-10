'use client';
import { useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { SessionSync } from '@/utils/sessionSync';

export default function SessionManager() {
  const { user, logout } = useAuth();

  useEffect(() => {
    // Initialize session synchronization
    SessionSync.init();
    const checkExistingSession = async () => {
      const currentUser = SessionSync.getCurrentUser();
      const sessionToken = SessionSync.getSessionToken();
      
      if (currentUser && sessionToken && !user) {
        // Validate session with server
        const isValid = await SessionSync.validateCurrentSession();
        if (isValid) {
          // Update auth store with validated session
          const { login } = useAuth.getState();
          // Note: This will be handled by the session validation in the background
        }
      }
    };

    checkExistingSession();

    // Cleanup on unmount
    return () => {
      SessionSync.destroy();
    };
  }, [user]);

  // This component doesn't render anything visible
  return null;
}
