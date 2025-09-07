// Discord-style authentication utilities
import crypto from 'crypto';

export class AuthUtils {
  // Generate a secure hash from password
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

  // Generate unique user token (Discord-style)
  static generateUserToken(userId: string, password: string): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const tokenData = `${userId}:${password}:${timestamp}:${randomBytes}`;
    return crypto.createHash('sha256').update(tokenData).digest('hex');
  }

  // Generate session token for login
  static generateSessionToken(userToken: string): string {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const sessionData = `${userToken}:${timestamp}:${randomBytes}`;
    return crypto.createHash('sha256').update(sessionData).digest('hex');
  }

  // Validate token format
  static isValidToken(token: string): boolean {
    return /^[a-f0-9]{64}$/i.test(token);
  }

  // Generate unique user ID
  static generateUserId(type: string): string {
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    return `${type}_${timestamp}_${randomId}`;
  }
}
