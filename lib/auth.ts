import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AuthSession, EmailVerification, AadhaarVerification } from '@/types/auth';

// In-memory storage for demo (replace with actual database in production)
let users: User[] = [];
let sessions: AuthSession[] = [];
let emailVerifications: EmailVerification[] = [];
let aadhaarVerifications: AadhaarVerification[] = [];

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const SALT_ROUNDS = 12;

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }

  // Generate random token for email verification
  static generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Find user by email
  static findUserByEmail(email: string): User | undefined {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Find user by ID
  static findUserById(id: string): User | undefined {
    return users.find(user => user.id === id);
  }

  // Find user by Aadhaar number
  static findUserByAadhaar(aadhaarNumber: string): User | undefined {
    return users.find(user => user.aadhaarNumber === aadhaarNumber);
  }

  // Create new user
  static async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    aadhaarNumber: string;
    aadhaarEmail: string;
  }): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const newUser: User = {
      id: userId,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      aadhaarNumber: userData.aadhaarNumber,
      aadhaarEmail: userData.aadhaarEmail.toLowerCase(),
      isEmailVerified: false,
      isAadhaarVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    return newUser;
  }

  // Create email verification
  static createEmailVerification(userId: string, email: string): EmailVerification {
    const verification: EmailVerification = {
      id: `email_verify_${Date.now()}`,
      userId,
      email: email.toLowerCase(),
      token: this.generateVerificationToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isUsed: false,
      createdAt: new Date(),
    };

    emailVerifications.push(verification);
    return verification;
  }

  // Verify email token
  static verifyEmailToken(token: string): EmailVerification | null {
    const verification = emailVerifications.find(
      v => v.token === token && !v.isUsed && v.expiresAt > new Date()
    );

    if (verification) {
      verification.isUsed = true;
      
      // Update user email verification status
      const user = this.findUserById(verification.userId);
      if (user) {
        user.isEmailVerified = true;
        user.updatedAt = new Date();
      }
    }

    return verification || null;
  }

  // Create Aadhaar verification
  static createAadhaarVerification(userId: string, aadhaarNumber: string, aadhaarEmail: string): AadhaarVerification {
    const verification: AadhaarVerification = {
      id: `aadhaar_verify_${Date.now()}`,
      userId,
      aadhaarNumber,
      aadhaarEmail: aadhaarEmail.toLowerCase(),
      isVerified: false,
      createdAt: new Date(),
    };

    aadhaarVerifications.push(verification);
    return verification;
  }

  // Verify Aadhaar (mock implementation)
  static async verifyAadhaar(aadhaarNumber: string, aadhaarEmail: string): Promise<boolean> {
    // Mock Aadhaar verification - in production, integrate with UIDAI API
    // For demo purposes, we'll accept any 12-digit number and valid email
    const aadhaarRegex = /^\d{12}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!aadhaarRegex.test(aadhaarNumber) || !emailRegex.test(aadhaarEmail)) {
      return false;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock verification - 90% success rate for demo
    return Math.random() > 0.1;
  }

  // Complete Aadhaar verification
  static completeAadhaarVerification(userId: string): boolean {
    const verification = aadhaarVerifications.find(v => v.userId === userId && !v.isVerified);
    const user = this.findUserById(userId);

    if (verification && user) {
      verification.isVerified = true;
      verification.verifiedAt = new Date();
      
      user.isAadhaarVerified = true;
      user.updatedAt = new Date();
      
      return true;
    }

    return false;
  }

  // Create session
  static createSession(userId: string, deviceInfo?: string, ipAddress?: string): AuthSession {
    const session: AuthSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      token: this.generateToken(userId),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      deviceInfo,
      ipAddress,
    };

    sessions.push(session);
    return session;
  }

  // Validate session
  static validateSession(token: string): User | null {
    const session = sessions.find(s => s.token === token && s.expiresAt > new Date());
    if (!session) return null;

    const user = this.findUserById(session.userId);
    if (!user) return null;

    // Update last login
    user.lastLogin = new Date();
    return user;
  }

  // Logout (invalidate session)
  static logout(token: string): boolean {
    const sessionIndex = sessions.findIndex(s => s.token === token);
    if (sessionIndex > -1) {
      sessions.splice(sessionIndex, 1);
      return true;
    }
    return false;
  }

  // Clean expired sessions and verifications
  static cleanupExpired(): void {
    const now = new Date();
    
    // Remove expired sessions
    sessions = sessions.filter(s => s.expiresAt > now);
    
    // Remove expired email verifications
    emailVerifications = emailVerifications.filter(v => v.expiresAt > now || v.isUsed);
  }

  // Get all users (admin function)
  static getAllUsers(): Omit<User, 'password'>[] {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}
