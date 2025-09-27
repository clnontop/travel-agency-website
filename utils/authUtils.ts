// Crypto utility that works in both browser and Node.js environments
function getRandomBytes(length: number): string {
  if (typeof window !== 'undefined') {
    // Browser environment - use Web Crypto API
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment - use crypto module
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
  }
}

function encodeBase64(str: string): string {
  if (typeof window !== 'undefined') {
    // Browser environment
    return btoa(str);
  } else {
    // Node.js environment
    return Buffer.from(str).toString('base64');
  }
}

// Discord-style token generation utilities
export class AuthTokenUtils {
  // Generate a unique token like Discord (base64 encoded with user info)
  static generateUserToken(userId: string, email: string): string {
    const timestamp = Date.now();
    const randomBytes = getRandomBytes(16);
    const userPart = encodeBase64(`${userId}.${email}`);
    const timePart = encodeBase64(timestamp.toString());
    const randomPart = encodeBase64(randomBytes);
    
    return `${userPart}.${timePart}.${randomPart}`;
  }

  // Generate session token for cross-device authentication
  static generateSessionToken(): string {
    const timestamp = Date.now();
    const randomBytes = getRandomBytes(32);
    const sessionId = getRandomBytes(16);
    
    const timePart = encodeBase64(timestamp.toString());
    const sessionPart = encodeBase64(sessionId);
    const randomPart = encodeBase64(randomBytes);
    
    return `sess_${timePart}.${sessionPart}.${randomPart}`;
  }

  // Hash password securely (simplified for cross-platform compatibility)
  static hashPassword(password: string): string {
    // Simple hash for demo purposes - in production use bcrypt or similar
    const salt = getRandomBytes(8);
    const hash = this.simpleHash(password + salt);
    return `${salt}:${hash}`;
  }

  // Verify password against hash
  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const verifyHash = this.simpleHash(password + salt);
      return hash === verifyHash;
    } catch (error) {
      return false;
    }
  }

  // Simple hash function for cross-platform compatibility
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Validate token format
  static isValidToken(token: string): boolean {
    try {
      const parts = token.split('.');
      return parts.length === 3 && parts.every(part => part.length > 0);
    } catch {
      return false;
    }
  }

  // Extract user info from token (for debugging)
  static decodeToken(token: string): { userId?: string; email?: string; timestamp?: number } | null {
    try {
      const [userPart, timePart] = token.split('.');
      const userInfo = Buffer.from(userPart, 'base64').toString();
      const timestamp = parseInt(Buffer.from(timePart, 'base64').toString());
      const [userId, email] = userInfo.split('.');
      
      return { userId, email, timestamp };
    } catch {
      return null;
    }
  }
}
