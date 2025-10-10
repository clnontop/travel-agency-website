// Secure Password Reset System
import { v4 as uuidv4 } from 'uuid';
import { TokenManager } from './tokenManager';

export interface PasswordResetSession {
  id: string;
  userId: string;
  email: string;
  resetKey: string;
  createdAt: number;
  expiresAt: number;
  isUsed: boolean;
  attempts: number;
  maxAttempts: number;
}

export class PasswordResetManager {
  private static readonly RESET_STORAGE_KEY = 'trinck-password-resets';
  private static readonly RESET_EXPIRY_MINUTES = 5; // 5 minutes
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly MASTER_RESET_KEY = 'axhn itbh eaoo gxsm'; // Your provided key

  // Generate password reset session
  static generateResetSession(email: string): PasswordResetSession | null {
    try {
      // Find user by email in localStorage first (fallback to tokens)
      const users = JSON.parse(localStorage.getItem('users-storage') || '[]');
      const userArray = Array.isArray(users) ? users : Object.values(users);
      const user = userArray.find((u: any) => 
        u.email && u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        console.log(`❌ No user found for email: ${email}`);
        return null;
      }

      const now = Date.now();
      const resetSession: PasswordResetSession = {
        id: uuidv4(),
        userId: user.id,
        email: user.email,
        resetKey: this.MASTER_RESET_KEY,
        createdAt: now,
        expiresAt: now + (this.RESET_EXPIRY_MINUTES * 60 * 1000), // 5 minutes
        isUsed: false,
        attempts: 0,
        maxAttempts: this.MAX_ATTEMPTS
      };

      // Store reset session
      this.storeResetSession(resetSession);

      console.log(`🔑 Password reset session created for ${email}:`, {
        sessionId: resetSession.id,
        userId: resetSession.userId,
        expiresAt: new Date(resetSession.expiresAt).toLocaleString(),
        resetKey: resetSession.resetKey
      });

      return resetSession;
    } catch (error) {
      console.error('Failed to generate reset session:', error);
      return null;
    }
  }

  // Store reset session securely
  private static storeResetSession(session: PasswordResetSession): void {
    if (typeof window === 'undefined') return;

    try {
      const existingSessions = this.getAllResetSessions();
      
      // Remove any existing sessions for this user
      const filteredSessions = existingSessions.filter(s => s.userId !== session.userId);
      
      // Add new session
      filteredSessions.push(session);
      
      // Clean up expired sessions
      const activeSessions = filteredSessions.filter(s => !this.isSessionExpired(s));
      
      localStorage.setItem(this.RESET_STORAGE_KEY, JSON.stringify(activeSessions));
    } catch (error) {
      console.error('Failed to store reset session:', error);
    }
  }

  // Get all reset sessions
  private static getAllResetSessions(): PasswordResetSession[] {
    if (typeof window === 'undefined') return [];

    try {
      const sessionsData = localStorage.getItem(this.RESET_STORAGE_KEY);
      if (!sessionsData) return [];
      
      const sessions: PasswordResetSession[] = JSON.parse(sessionsData);
      
      // Filter out expired sessions
      const activeSessions = sessions.filter(session => !this.isSessionExpired(session));
      
      // Update storage if we removed expired sessions
      if (activeSessions.length !== sessions.length) {
        localStorage.setItem(this.RESET_STORAGE_KEY, JSON.stringify(activeSessions));
      }
      
      return activeSessions;
    } catch (error) {
      console.error('Failed to get reset sessions:', error);
      return [];
    }
  }

  // Check if session is expired
  static isSessionExpired(session: PasswordResetSession): boolean {
    return Date.now() > session.expiresAt || session.isUsed;
  }

  // Verify reset key and get session
  static verifyResetKey(email: string, resetKey: string): PasswordResetSession | null {
    try {
      const allSessions = this.getAllResetSessions();
      
      const session = allSessions.find(s => 
        s.email.toLowerCase() === email.toLowerCase() &&
        s.resetKey === resetKey &&
        !s.isUsed &&
        !this.isSessionExpired(s)
      );

      if (!session) {
        console.log(`❌ Invalid or expired reset key for ${email}`);
        return null;
      }

      // Increment attempts
      session.attempts += 1;
      
      if (session.attempts > session.maxAttempts) {
        session.isUsed = true;
        console.log(`❌ Too many attempts for reset session ${session.id}`);
        this.updateResetSession(session);
        return null;
      }

      this.updateResetSession(session);
      
      console.log(`✅ Reset key verified for ${email}, attempts: ${session.attempts}/${session.maxAttempts}`);
      return session;
    } catch (error) {
      console.error('Failed to verify reset key:', error);
      return null;
    }
  }

  // Update reset session
  private static updateResetSession(updatedSession: PasswordResetSession): void {
    try {
      const allSessions = this.getAllResetSessions();
      const sessionIndex = allSessions.findIndex(s => s.id === updatedSession.id);
      
      if (sessionIndex !== -1) {
        allSessions[sessionIndex] = updatedSession;
        localStorage.setItem(this.RESET_STORAGE_KEY, JSON.stringify(allSessions));
      }
    } catch (error) {
      console.error('Failed to update reset session:', error);
    }
  }

  // Reset password using valid session
  static resetPassword(email: string, resetKey: string, newPassword: string): { success: boolean; message: string } {
    try {
      // Verify reset key first
      const session = this.verifyResetKey(email, resetKey);
      
      if (!session) {
        return { 
          success: false, 
          message: 'Invalid or expired reset key. Please request a new password reset.' 
        };
      }

      // Check if session is still valid
      if (this.isSessionExpired(session)) {
        return { 
          success: false, 
          message: 'Reset session has expired. Please request a new password reset.' 
        };
      }

      // Update user's password in localStorage
      try {
        const users = JSON.parse(localStorage.getItem('users-storage') || '[]');
        const userArray = Array.isArray(users) ? users : Object.values(users);
        const userIndex = userArray.findIndex((u: any) => u.id === session.userId);
        
        if (userIndex !== -1) {
          userArray[userIndex].password = newPassword;
          localStorage.setItem('users-storage', JSON.stringify(userArray));
          console.log(`✅ Password updated for user ${session.userId}`);
        } else {
          return { 
            success: false, 
            message: 'User not found. Please try again.' 
          };
        }
      } catch (error) {
        console.error('Failed to update password:', error);
        return { 
          success: false, 
          message: 'Failed to update password. Please try again.' 
        };
      }

      // Mark session as used
      session.isUsed = true;
      this.updateResetSession(session);

      // Clear any existing auth tokens (force re-login)
      localStorage.removeItem('auth_token');

      console.log(`✅ Password reset successful for ${email}`);
      
      return { 
        success: true, 
        message: 'Password reset successful! Please login with your new password.' 
      };
    } catch (error) {
      console.error('Failed to reset password:', error);
      return { 
        success: false, 
        message: 'An error occurred while resetting password. Please try again.' 
      };
    }
  }

  // Send reset email (simulated)
  static sendResetEmail(email: string): { success: boolean; message: string; resetKey?: string } {
    try {
      const resetSession = this.generateResetSession(email);
      
      if (!resetSession) {
        return { 
          success: false, 
          message: 'No account found with this email address.' 
        };
      }

      // In production, you would send an actual email here
      // For demo purposes, we'll return the reset key
      console.log(`📧 Simulated email sent to ${email}:`);
      console.log(`Reset Key: ${resetSession.resetKey}`);
      console.log(`Session expires in ${this.RESET_EXPIRY_MINUTES} minutes`);
      console.log(`Reset URL: /auth/reset-password?email=${encodeURIComponent(email)}&key=${encodeURIComponent(resetSession.resetKey)}`);

      return { 
        success: true, 
        message: `Password reset instructions sent to ${email}. Check your email for the reset key.`,
        resetKey: resetSession.resetKey // Remove this in production
      };
    } catch (error) {
      console.error('Failed to send reset email:', error);
      return { 
        success: false, 
        message: 'Failed to send reset email. Please try again.' 
      };
    }
  }

  // Get remaining time for session
  static getSessionRemainingTime(email: string, resetKey: string): number {
    try {
      const allSessions = this.getAllResetSessions();
      
      const session = allSessions.find(s => 
        s.email.toLowerCase() === email.toLowerCase() &&
        s.resetKey === resetKey &&
        !s.isUsed
      );

      if (!session) return 0;
      
      const remaining = session.expiresAt - Date.now();
      return Math.max(0, remaining);
    } catch (error) {
      console.error('Failed to get session remaining time:', error);
      return 0;
    }
  }

  // Clean up expired sessions
  static cleanupExpiredSessions(): void {
    try {
      const allSessions = this.getAllResetSessions();
      const activeSessions = allSessions.filter(s => !this.isSessionExpired(s));
      
      if (activeSessions.length !== allSessions.length) {
        localStorage.setItem(this.RESET_STORAGE_KEY, JSON.stringify(activeSessions));
        console.log(`🧹 Cleaned up ${allSessions.length - activeSessions.length} expired reset sessions`);
      }
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
    }
  }
}
