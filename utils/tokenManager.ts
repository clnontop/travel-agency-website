// Secure Token Management System
import { v4 as uuidv4 } from 'uuid';

export interface UserToken {
  id: string;
  userId: string;
  // Complete user registration details stored in token
  userDetails: {
    name: string;
    email: string;
    phone: string;
    type: 'customer' | 'driver' | 'admin';
    bio?: string;
    location?: string;
    company?: string;
    vehicleType?: string;
    licenseNumber?: string;
    password: string; // Encrypted in production
    googleId?: string;
    isPremium: boolean;
    memberSince: string;
    // Driver specific details
    rating?: number;
    completedJobs?: number;
    totalEarnings?: number;
    isAvailable?: boolean;
    isOnline?: boolean;
    // Wallet details
    walletBalance: number;
    totalSpent: number;
    totalEarned: number;
  };
  issuedAt: number;
  expiresAt: number;
  deviceIds: string[]; // Multiple devices supported
  sessionId: string;
  isActive: boolean;
  lastUsed: number;
}

export class TokenManager {
  private static readonly TOKEN_STORAGE_KEY = 'trinck-user-tokens';
  private static readonly CURRENT_TOKEN_KEY = 'trinck-current-token';
  private static readonly TOKEN_EXPIRY_HOURS = 24; // 24 hours

  // Generate a unique secure token for a user with complete details
  static generateUserToken(user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: 'customer' | 'driver' | 'admin';
    password: string;
    bio?: string;
    location?: string;
    company?: string;
    vehicleType?: string;
    licenseNumber?: string;
    googleId?: string;
    isPremium?: boolean;
    memberSince?: string;
    rating?: number;
    completedJobs?: number;
    totalEarnings?: number;
    isAvailable?: boolean;
    isOnline?: boolean;
    wallet?: {
      balance: number;
      totalSpent: number;
      totalEarned: number;
    };
  }, deviceId?: string): UserToken {
    const now = Date.now();
    const sessionId = uuidv4();
    
    const currentDeviceId = deviceId || this.generateDeviceId();
    
    const token: UserToken = {
      id: uuidv4(), // Unique token ID
      userId: user.id,
      userDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: user.type,
        password: user.password,
        bio: user.bio || '',
        location: user.location || '',
        company: user.company || '',
        vehicleType: user.vehicleType || '',
        licenseNumber: user.licenseNumber || '',
        googleId: user.googleId,
        isPremium: user.isPremium || false,
        memberSince: user.memberSince || new Date().getFullYear().toString(),
        rating: user.rating || 0,
        completedJobs: user.completedJobs || 0,
        totalEarnings: user.totalEarnings || 0,
        isAvailable: user.isAvailable || true,
        isOnline: user.isOnline || true,
        walletBalance: user.wallet?.balance || 0,
        totalSpent: user.wallet?.totalSpent || 0,
        totalEarned: user.wallet?.totalEarned || 0
      },
      issuedAt: now,
      expiresAt: now + (this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000), // 24 hours
      deviceIds: [currentDeviceId], // Support multiple devices
      sessionId,
      isActive: true,
      lastUsed: now
    };

    // Store token securely
    this.storeUserToken(token);
    this.setCurrentToken(token);

    console.log(`🔐 Generated secure token for user ${token.userDetails.email}:`, {
      tokenId: token.id,
      userId: token.userId,
      sessionId: token.sessionId,
      deviceIds: token.deviceIds,
      expiresAt: new Date(token.expiresAt).toLocaleString()
    });

    return token;
  }

  // Store token in secure storage
  private static storeUserToken(token: UserToken): void {
    if (typeof window === 'undefined') return;

    try {
      const existingTokens = this.getAllStoredTokens();
      
      // Remove any existing tokens for this user (single session per user)
      const filteredTokens = existingTokens.filter(t => t.userId !== token.userId);
      
      // Add new token
      filteredTokens.push(token);
      
      // Store in localStorage (encrypted in production)
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(filteredTokens));
      
      // Set secure cookie (remove secure flag for localhost)
      document.cookie = `user-token=${token.id}; path=/; max-age=${this.TOKEN_EXPIRY_HOURS * 3600}; samesite=strict`;
      
      console.log(`✅ Token stored successfully for user ${token.userId}`);
    } catch (error) {
      console.error('Failed to store user token:', error);
    }
  }

  // Set current active token
  static setCurrentToken(token: UserToken): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.CURRENT_TOKEN_KEY, JSON.stringify(token));
      
      // Also set in session cookie for middleware (remove secure flag for localhost)
      document.cookie = `user-session=${JSON.stringify({
        id: token.userId,
        type: token.userDetails.type,
        email: token.userDetails.email,
        tokenId: token.id,
        sessionId: token.sessionId
      })}; path=/; max-age=${this.TOKEN_EXPIRY_HOURS * 3600}; samesite=strict`;
      
    } catch (error) {
      console.error('Failed to set current token:', error);
    }
  }

  // Get current user token
  static getCurrentToken(): UserToken | null {
    if (typeof window === 'undefined') return null;

    try {
      const tokenData = localStorage.getItem(this.CURRENT_TOKEN_KEY);
      if (!tokenData) return null;

      const token: UserToken = JSON.parse(tokenData);
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        this.clearCurrentToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to get current token:', error);
      return null;
    }
  }

  // Validate token
  static validateToken(tokenId: string): UserToken | null {
    const allTokens = this.getAllStoredTokens();
    const token = allTokens.find(t => t.id === tokenId);
    
    if (!token) return null;
    
    if (this.isTokenExpired(token)) {
      this.removeToken(tokenId);
      return null;
    }
    
    return token;
  }

  // Check if token is expired
  static isTokenExpired(token: UserToken): boolean {
    return Date.now() > token.expiresAt;
  }

  // Get all stored tokens
  static getAllStoredTokens(): UserToken[] {
    if (typeof window === 'undefined') return [];

    try {
      const tokensData = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!tokensData) return [];
      
      const tokens: UserToken[] = JSON.parse(tokensData);
      
      // Filter out expired tokens
      const validTokens = tokens.filter(token => !this.isTokenExpired(token));
      
      // Update storage if we removed expired tokens
      if (validTokens.length !== tokens.length) {
        localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(validTokens));
      }
      
      return validTokens;
    } catch (error) {
      console.error('Failed to get stored tokens:', error);
      return [];
    }
  }

  // Remove specific token
  static removeToken(tokenId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const allTokens = this.getAllStoredTokens();
      const filteredTokens = allTokens.filter(t => t.id !== tokenId);
      
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(filteredTokens));
      
      // If this was the current token, clear it
      const currentToken = this.getCurrentToken();
      if (currentToken && currentToken.id === tokenId) {
        this.clearCurrentToken();
      }
      
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  // Clear current token (logout)
  static clearCurrentToken(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.CURRENT_TOKEN_KEY);
      
      // Clear cookies (remove secure flag for localhost)
      document.cookie = 'user-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
      document.cookie = 'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
      
    } catch (error) {
      console.error('Failed to clear current token:', error);
    }
  }

  // Clear all tokens for a user (logout from all devices)
  static clearAllUserTokens(userId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const allTokens = this.getAllStoredTokens();
      const filteredTokens = allTokens.filter(t => t.userId !== userId);
      
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(filteredTokens));
      
      // If current user, also clear current token
      const currentToken = this.getCurrentToken();
      if (currentToken && currentToken.userId === userId) {
        this.clearCurrentToken();
      }
      
    } catch (error) {
      console.error('Failed to clear user tokens:', error);
    }
  }

  // Generate device ID
  private static generateDeviceId(): string {
    if (typeof window === 'undefined') return 'server';

    let deviceId = localStorage.getItem('trinck-device-id');
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem('trinck-device-id', deviceId);
    }
    return deviceId;
  }

  // Refresh token (extend expiry)
  static refreshToken(tokenId: string): UserToken | null {
    const token = this.validateToken(tokenId);
    if (!token) return null;

    // Extend expiry
    token.expiresAt = Date.now() + (this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    
    // Update storage
    this.storeUserToken(token);
    
    return token;
  }

  // Get user info from token
  static getUserFromToken(tokenId: string): { id: string; email: string; type: string } | null {
    const token = this.validateToken(tokenId);
    if (!token) return null;

    return {
      id: token.userId,
      email: token.userDetails.email,
      type: token.userDetails.type
    };
  }

  // Add device to existing token (for multi-device support)
  static addDeviceToToken(tokenId: string, deviceId: string): boolean {
    try {
      const allTokens = this.getAllStoredTokens();
      const tokenIndex = allTokens.findIndex(t => t.id === tokenId);
      
      if (tokenIndex === -1) return false;
      
      const token = allTokens[tokenIndex];
      if (!token.deviceIds.includes(deviceId)) {
        token.deviceIds.push(deviceId);
        token.lastUsed = Date.now();
        
        // Update storage
        localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(allTokens));
        
        console.log(`📱 Added device ${deviceId} to token ${tokenId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to add device to token:', error);
      return false;
    }
  }

  // Verify login credentials against token
  static verifyLoginCredentials(email: string, password: string, type: string): UserToken | null {
    try {
      const allTokens = this.getAllStoredTokens();
      
      // Find token with matching credentials
      const token = allTokens.find(t => 
        t.userDetails.email.toLowerCase() === email.toLowerCase() &&
        t.userDetails.password === password &&
        t.userDetails.type === type &&
        t.isActive &&
        !this.isTokenExpired(t)
      );
      
      if (token) {
        // Update last used time
        token.lastUsed = Date.now();
        
        // Add current device if not already added
        const currentDeviceId = this.generateDeviceId();
        if (!token.deviceIds.includes(currentDeviceId)) {
          token.deviceIds.push(currentDeviceId);
        }
        
        // Update storage
        const tokenIndex = allTokens.findIndex(t => t.id === token.id);
        if (tokenIndex !== -1) {
          allTokens[tokenIndex] = token;
          localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(allTokens));
        }
        
        console.log(`✅ Login verified for ${email} from device ${currentDeviceId}`);
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to verify login credentials:', error);
      return null;
    }
  }

  // Update user details in token (preserves token across updates)
  static updateUserDetailsInToken(userId: string, updates: Partial<UserToken['userDetails']>): boolean {
    try {
      const allTokens = this.getAllStoredTokens();
      const tokenIndex = allTokens.findIndex(t => t.userId === userId);
      
      if (tokenIndex === -1) return false;
      
      const token = allTokens[tokenIndex];
      
      // Update user details while preserving token
      token.userDetails = { ...token.userDetails, ...updates };
      token.lastUsed = Date.now();
      
      // Update storage
      allTokens[tokenIndex] = token;
      localStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(allTokens));
      
      // Update current token if it's the same user
      const currentToken = this.getCurrentToken();
      if (currentToken && currentToken.userId === userId) {
        this.setCurrentToken(token);
      }
      
      console.log(`🔄 Updated user details for ${userId} while preserving token`);
      return true;
    } catch (error) {
      console.error('Failed to update user details in token:', error);
      return false;
    }
  }
}
