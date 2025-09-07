import crypto from 'crypto';

// Discord-style token generation utilities
export class AuthTokenUtils {
  // Generate a unique token like Discord (base64 encoded with user info)
  static generateUserToken(userId: string, email: string): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const userPart = Buffer.from(`${userId}.${email}`).toString('base64');
    const timePart = Buffer.from(timestamp.toString()).toString('base64');
    const randomPart = Buffer.from(randomBytes).toString('base64');
    
    return `${userPart}.${timePart}.${randomPart}`;
  }

  // Hash password securely
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  // Verify password against hash
  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      return hash === verifyHash;
    } catch (error) {
      return false;
    }
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
