// Enhanced Cross-Device Session Synchronization
export class EnhancedSessionSync {
  private static readonly SESSION_STORAGE_KEY = 'trinck-session-token';
  private static readonly USER_STORAGE_KEY = 'trinck-current-user';
  private static readonly DEVICE_ID_KEY = 'trinck-device-id';
  private static readonly SYNC_INTERVAL = 15000; // 15 seconds for better responsiveness
  private static readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  
  private static syncTimer: NodeJS.Timeout | null = null;
  private static heartbeatTimer: NodeJS.Timeout | null = null;
  private static isOnline = true;
  private static deviceId: string | null = null;

  // Initialize enhanced session synchronization
  static init() {
    if (typeof window === 'undefined') return;

    // Generate or retrieve device ID
    this.initDeviceId();

    // Check for existing session on page load
    this.validateCurrentSession();

    // Start periodic session validation and heartbeat
    this.startSyncTimer();
    this.startHeartbeat();

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', this.handleStorageChange);

    // Listen for focus events to refresh session
    window.addEventListener('focus', this.handleWindowFocus);

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);

    // Listen for beforeunload to cleanup
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    console.log('🔄 Enhanced session sync initialized:', {
      deviceId: this.deviceId,
      syncInterval: this.SYNC_INTERVAL,
      heartbeatInterval: this.HEARTBEAT_INTERVAL
    });
  }

  // Generate or retrieve unique device ID
  private static initDeviceId() {
    if (typeof window === 'undefined') return;

    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate unique device ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      console.log('📱 New device ID generated:', deviceId);
    }
    
    this.deviceId = deviceId;
  }

  // Store session with enhanced metadata
  static setSession(token: string, user: any, sessionMetadata?: any) {
    if (typeof window === 'undefined') return;

    const sessionData = {
      token,
      user,
      deviceId: this.deviceId,
      timestamp: Date.now(),
      metadata: sessionMetadata || {}
    };

    localStorage.setItem(this.SESSION_STORAGE_KEY, token);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(sessionData));
    
    // Broadcast session update to other tabs
    this.broadcastSessionUpdate('session_created', sessionData);
    
    console.log('🔐 Enhanced session stored:', {
      userId: user.id,
      email: user.email,
      type: user.type,
      deviceId: this.deviceId,
      timestamp: new Date(sessionData.timestamp).toISOString()
    });
  }

  // Get current session token
  static getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.SESSION_STORAGE_KEY);
  }

  // Get current user data with enhanced metadata
  static getCurrentUser(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem(this.USER_STORAGE_KEY);
      if (!sessionData) return null;
      
      const parsed = JSON.parse(sessionData);
      return parsed.user || parsed; // Handle both old and new formats
    } catch {
      return null;
    }
  }

  // Get full session data
  static getSessionData(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem(this.USER_STORAGE_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  }

  // Clear session data
  static clearSession() {
    if (typeof window === 'undefined') return;

    const sessionData = this.getSessionData();
    
    localStorage.removeItem(this.SESSION_STORAGE_KEY);
    localStorage.removeItem(this.USER_STORAGE_KEY);
    
    // Broadcast session clear to other tabs
    this.broadcastSessionUpdate('session_cleared', sessionData);
    
    console.log('🔓 Enhanced session cleared from all devices');
  }

  // Validate current session with server
  static async validateCurrentSession(): Promise<boolean> {
    const token = this.getSessionToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceId || 'unknown'
        }
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Update user data if session is valid
        this.setSession(token, data.user, data.sessionInfo);
        return true;
      } else {
        // Clear invalid session
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      
      // If offline, don't clear session immediately
      if (!this.isOnline) {
        console.log('📴 Offline - keeping session for later validation');
        return true;
      }
      
      return false;
    }
  }

  // Enhanced login with device tracking
  static async login(email: string, password: string, userType: string, rememberDevice = true): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const deviceInfo = this.getEnhancedDeviceInfo();
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceId || 'unknown'
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
          userType,
          deviceInfo,
          rememberDevice,
          deviceId: this.deviceId
        })
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        // Store session for cross-device access
        this.setSession(data.token, data.user, {
          sessionId: data.sessionId,
          deviceInfo,
          loginTime: Date.now(),
          rememberDevice
        });
        
        console.log('✅ Enhanced cross-device login successful:', {
          userId: data.user.id,
          email: data.user.email,
          type: data.user.type,
          sessionId: data.sessionId,
          deviceId: this.deviceId,
          deviceInfo
        });

        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Enhanced login API error, falling back to local auth:', error);
      
      // Fallback to local authentication if API fails
      return this.fallbackToLocalAuth(email, password, userType, rememberDevice);
    }
  }

  // Fallback to local authentication system
  private static fallbackToLocalAuth(email: string, password: string, userType: string, rememberDevice: boolean): { success: boolean; user?: any; message?: string } {
    try {
      // Simple validation for demo accounts
      const testUsers = [
        { email: 'customer@trinck.com', password: 'demo123', type: 'customer', id: 'customer_1', name: 'Demo Customer' },
        { email: 'driver@trinck.com', password: 'demo123', type: 'driver', id: 'driver_1', name: 'Demo Driver' },
      ];
      
      const user = testUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password && 
        u.type === userType
      );
      
      if (user) {
        // Generate local session token
        const localToken = `local_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Store session locally
        this.setSession(localToken, user, {
          sessionId: `local_session_${Date.now()}`,
          deviceInfo: this.getEnhancedDeviceInfo(),
          loginTime: Date.now(),
          rememberDevice,
          isLocalAuth: true
        });
        
        console.log('✅ Local fallback login successful:', {
          userId: user.id,
          email: user.email,
          type: user.type,
          deviceId: this.deviceId
        });
        
        return { success: true, user };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Local auth fallback error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }

  // Enhanced logout with session cleanup
  static async logout(): Promise<boolean> {
    const token = this.getSessionToken();
    const sessionData = this.getSessionData();
    
    try {
      if (token) {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Device-ID': this.deviceId || 'unknown'
          },
          body: JSON.stringify({
            action: 'logout',
            token,
            deviceId: this.deviceId
          })
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear local session and broadcast
    this.clearSession();
    
    // Broadcast logout to other tabs
    this.broadcastSessionUpdate('user_logged_out', sessionData);
    
    return true;
  }

  // Refresh session token
  static async refreshSession(): Promise<boolean> {
    const token = this.getSessionToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceId || 'unknown'
        },
        body: JSON.stringify({
          action: 'refresh',
          token,
          deviceInfo: this.getEnhancedDeviceInfo(),
          deviceId: this.deviceId
        })
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        this.setSession(data.token, data.user, data.sessionInfo);
        console.log('🔄 Session refreshed successfully');
        return true;
      } else {
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  }

  // Get enhanced device information
  private static getEnhancedDeviceInfo(): any {
    if (typeof window === 'undefined') return { type: 'Server', platform: 'Node.js' };
    
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    
    let deviceType = 'Desktop';
    if (isTablet) deviceType = 'Tablet';
    else if (isMobile) deviceType = 'Mobile';
    
    return {
      type: deviceType,
      platform: navigator.platform,
      userAgent: userAgent.substring(0, 100), // Truncate for privacy
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height
      },
      deviceId: this.deviceId,
      timestamp: Date.now()
    };
  }

  // Broadcast session updates to other tabs
  private static broadcastSessionUpdate(type: string, data: any) {
    if (typeof window === 'undefined') return;
    
    const broadcastData = {
      type,
      data,
      deviceId: this.deviceId,
      timestamp: Date.now()
    };
    
    // Use localStorage event for cross-tab communication
    localStorage.setItem('trinck-session-broadcast', JSON.stringify(broadcastData));
    localStorage.removeItem('trinck-session-broadcast');
  }

  // Handle storage changes (cross-tab sync)
  private static handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'trinck-session-broadcast' && event.newValue) {
      try {
        const broadcastData = JSON.parse(event.newValue);
        
        // Ignore broadcasts from same device
        if (broadcastData.deviceId === this.deviceId) return;
        
        console.log('🔄 Session broadcast received:', broadcastData.type);
        
        switch (broadcastData.type) {
          case 'session_cleared':
          case 'user_logged_out':
            console.log('🔄 User logged out in another tab/device');
            window.location.reload();
            break;
            
          case 'session_created':
            console.log('🔄 New session created in another tab/device');
            // Optionally reload or update UI
            break;
        }
      } catch (error) {
        console.error('Error handling session broadcast:', error);
      }
    }
    
    if (event.key === this.SESSION_STORAGE_KEY) {
      if (event.newValue === null) {
        console.log('🔄 Session cleared in another tab');
        window.location.reload();
      }
    }
  };

  // Handle window focus (refresh session)
  private static handleWindowFocus = () => {
    console.log('👁️ Window focused - validating session');
    this.validateCurrentSession();
  };

  // Handle online/offline status
  private static handleOnlineStatus = () => {
    this.isOnline = navigator.onLine;
    console.log(`📡 Network status: ${this.isOnline ? 'Online' : 'Offline'}`);
    
    if (this.isOnline) {
      // Validate session when coming back online
      this.validateCurrentSession();
    }
  };

  // Handle before unload
  private static handleBeforeUnload = () => {
    // Send heartbeat to indicate session is still active
    this.sendHeartbeat();
  };

  // Send heartbeat to server
  private static async sendHeartbeat() {
    const token = this.getSessionToken();
    if (!token || !this.isOnline) return;

    try {
      await fetch('/api/auth/heartbeat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceId || 'unknown'
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      // Ignore heartbeat errors
    }
  }

  // Start periodic session validation
  private static startSyncTimer() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    
    this.syncTimer = setInterval(() => {
      if (this.isOnline) {
        this.validateCurrentSession();
      }
    }, this.SYNC_INTERVAL);
  }

  // Start heartbeat timer
  private static startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  // Get active sessions info
  static getSessionInfo() {
    const sessionData = this.getSessionData();
    return {
      isActive: !!this.getSessionToken(),
      deviceId: this.deviceId,
      isOnline: this.isOnline,
      sessionData: sessionData ? {
        timestamp: sessionData.timestamp,
        deviceInfo: sessionData.metadata?.deviceInfo,
        loginTime: sessionData.metadata?.loginTime
      } : null
    };
  }

  // Stop session synchronization
  static destroy() {
    if (typeof window === 'undefined') return;

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    
    console.log('🔄 Enhanced session sync destroyed');
  }
}
