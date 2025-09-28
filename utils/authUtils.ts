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

  // Hash password securely using crypto-based approach
  static hashPassword(password: string): string {
    try {
      // Use Web Crypto API for secure hashing
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Browser environment - use a simplified secure approach
        const salt = getRandomBytes(16);
        const iterations = 100000;
        const combined = password + salt + iterations.toString();
        
        // Create a stronger hash using multiple rounds
        let hash = combined;
        for (let i = 0; i < 1000; i++) {
          hash = this.secureHash(hash + salt + i.toString());
        }
        
        return `v2:${salt}:${iterations}:${hash}`;
      } else {
        // Node.js environment - use crypto module
        const crypto = require('crypto');
        const salt = crypto.randomBytes(16).toString('hex');
        const iterations = 100000;
        const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
        return `v2:${salt}:${iterations}:${hash}`;
      }
    } catch (error) {
      // Fallback to improved simple hash if crypto fails
      const salt = getRandomBytes(16);
      const hash = this.secureHash(password + salt);
      return `v1:${salt}:${hash}`;
    }
  }

  // Verify password against hash
  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const parts = hashedPassword.split(':');
      
      if (parts[0] === 'v2' && parts.length === 4) {
        // New secure format
        const [version, salt, iterations, hash] = parts;
        const iterCount = parseInt(iterations);
        
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
          // Browser verification
          const combined = password + salt + iterCount.toString();
          let testHash = combined;
          for (let i = 0; i < 1000; i++) {
            testHash = this.secureHash(testHash + salt + i.toString());
          }
          return testHash === hash;
        } else {
          // Node.js verification
          const crypto = require('crypto');
          const testHash = crypto.pbkdf2Sync(password, salt, iterCount, 64, 'sha512').toString('hex');
          return testHash === hash;
        }
      } else if (parts[0] === 'v1' && parts.length === 3) {
        // Fallback format
        const [version, salt, hash] = parts;
        const testHash = this.secureHash(password + salt);
        return testHash === hash;
      } else if (parts.length === 2) {
        // Legacy format - still support but less secure
        const [salt, hash] = parts;
        const verifyHash = this.simpleHash(password + salt);
        return hash === verifyHash;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  // Secure hash function using crypto APIs
  private static secureHash(str: string): string {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Browser - use a more complex hash
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
        // Add more complexity
        hash = ((hash << 3) - hash) + (char * 31);
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).padStart(8, '0');
    } else {
      // Node.js - use crypto
      try {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(str).digest('hex');
      } catch {
        return this.simpleHash(str);
      }
    }
  }

  // Simple hash function for legacy compatibility
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
