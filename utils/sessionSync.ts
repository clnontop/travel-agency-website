// Cross-device session synchronization utility
export class SessionSync {
  private static readonly SESSION_STORAGE_KEY = 'trinck-session-token';
  private static readonly USER_STORAGE_KEY = 'trinck-current-user';
  private static readonly SYNC_INTERVAL = 30000; // 30 seconds
  private static syncTimer: NodeJS.Timeout | null = null;

  // Initialize session synchronization
  static init() {
    if (typeof window === 'undefined') return;

    // Check for existing session on page load
    this.validateCurrentSession();

    // Start periodic session validation
    this.startSyncTimer();

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', this.handleStorageChange);

    // Listen for focus events to refresh session
    window.addEventListener('focus', this.handleWindowFocus);
  }

  // Store session token and user data
  static setSession(token: string, user: any) {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.SESSION_STORAGE_KEY, token);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    
    console.log('🔐 Session stored for cross-device sync:', {
      userId: user.id,
      email: user.email,
      type: user.type
    });
  }

  // Get current session token
  static getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.SESSION_STORAGE_KEY);
  }

  // Get current user data
  static getCurrentUser(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(this.USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Clear session data
  static clearSession() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.SESSION_STORAGE_KEY);
    localStorage.removeItem(this.USER_STORAGE_KEY);
    
    console.log('🔓 Session cleared from all devices');
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
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Update user data if session is valid
        this.setSession(token, data.user);
        return true;
      } else {
        // Clear invalid session
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  // Login with cross-device sync
  static async login(email: string, password: string, userType: string, deviceInfo?: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
          userType,
          deviceInfo: deviceInfo || this.getDeviceInfo()
        })
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        // Store session for cross-device access
        this.setSession(data.token, data.user);
        
        console.log('✅ Cross-device login successful:', {
          userId: data.user.id,
          email: data.user.email,
          type: data.user.type,
          sessionId: data.sessionId
        });

        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error during login' };
    }
  }

  // Logout with cross-device sync
  static async logout(): Promise<boolean> {
    const token = this.getSessionToken();
    
    try {
      if (token) {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'logout',
            token
          })
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear local session regardless of API response
    this.clearSession();
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'refresh',
          token,
          deviceInfo: this.getDeviceInfo()
        })
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        this.setSession(data.token, data.user);
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

  // Get device information for session tracking
  private static getDeviceInfo(): string {
    if (typeof window === 'undefined') return 'Server';
    
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    
    let deviceType = 'Desktop';
    if (isTablet) deviceType = 'Tablet';
    else if (isMobile) deviceType = 'Mobile';
    
    return `${deviceType} - ${navigator.platform}`;
  }

  // Handle storage changes (cross-tab sync)
  private static handleStorageChange = (event: StorageEvent) => {
    if (event.key === this.SESSION_STORAGE_KEY) {
      if (event.newValue === null) {
        // Session was cleared in another tab
        console.log('🔄 Session cleared in another tab');
        window.location.reload();
      } else if (event.oldValue !== event.newValue) {
        // Session was updated in another tab
        console.log('🔄 Session updated in another tab');
        window.location.reload();
      }
    }
  };

  // Handle window focus (refresh session)
  private static handleWindowFocus = () => {
    this.validateCurrentSession();
  };

  // Start periodic session validation
  private static startSyncTimer() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    
    this.syncTimer = setInterval(() => {
      this.validateCurrentSession();
    }, this.SYNC_INTERVAL);
  }

  // Stop session synchronization
  static destroy() {
    if (typeof window === 'undefined') return;

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    window.removeEventListener('storage', this.handleStorageChange);
    window.removeEventListener('focus', this.handleWindowFocus);
  }
}
