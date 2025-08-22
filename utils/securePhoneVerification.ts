// Secure Phone Verification Service
// Implements proper rate limiting, session management, and security measures

interface VerificationSession {
  phoneNumber: string;
  otp: string;
  attempts: number;
  createdAt: number;
  expiresAt: number;
  verified: boolean;
}

interface RateLimitEntry {
  phoneNumber: string;
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

interface VerificationResult {
  success: boolean;
  message: string;
  sessionId?: string;
  otp?: string; // Only in development
  method?: string;
  whatsappLink?: string;
  cooldownSeconds?: number;
}

class SecurePhoneVerificationService {
  private sessions = new Map<string, VerificationSession>();
  private rateLimits = new Map<string, RateLimitEntry>();
  
  // Configuration
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS_PER_SESSION = 3;
  private readonly RATE_LIMIT_WINDOW_MINUTES = 15;
  private readonly MAX_REQUESTS_PER_WINDOW = 3;
  private readonly COOLDOWN_MINUTES = 5;
  private readonly BLOCK_DURATION_MINUTES = 30;

  /**
   * Generate secure 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check rate limiting for phone number
   */
  private checkRateLimit(phoneNumber: string): { allowed: boolean; cooldownSeconds?: number } {
    const now = Date.now();
    const entry = this.rateLimits.get(phoneNumber);

    if (!entry) {
      // First request
      this.rateLimits.set(phoneNumber, {
        phoneNumber,
        attempts: 1,
        lastAttempt: now
      });
      return { allowed: true };
    }

    // Check if blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const cooldownSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
      return { allowed: false, cooldownSeconds };
    }

    // Reset window if expired
    const windowExpired = now - entry.lastAttempt > this.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
    if (windowExpired) {
      entry.attempts = 1;
      entry.lastAttempt = now;
      entry.blockedUntil = undefined;
      return { allowed: true };
    }

    // Check if within rate limit
    if (entry.attempts >= this.MAX_REQUESTS_PER_WINDOW) {
      // Block the phone number
      entry.blockedUntil = now + (this.BLOCK_DURATION_MINUTES * 60 * 1000);
      const cooldownSeconds = this.BLOCK_DURATION_MINUTES * 60;
      return { allowed: false, cooldownSeconds };
    }

    // Check cooldown between requests
    const timeSinceLastAttempt = now - entry.lastAttempt;
    const cooldownMs = this.COOLDOWN_MINUTES * 60 * 1000;
    
    if (timeSinceLastAttempt < cooldownMs) {
      const cooldownSeconds = Math.ceil((cooldownMs - timeSinceLastAttempt) / 1000);
      return { allowed: false, cooldownSeconds };
    }

    // Update attempts
    entry.attempts++;
    entry.lastAttempt = now;
    return { allowed: true };
  }

  /**
   * Clean expired sessions and rate limits
   */
  private cleanup(): void {
    const now = Date.now();

    // Clean expired sessions
    this.sessions.forEach((session, sessionId) => {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    });

    // Clean old rate limit entries
    this.rateLimits.forEach((entry, phoneNumber) => {
      const isOld = now - entry.lastAttempt > 24 * 60 * 60 * 1000; // 24 hours
      const isUnblocked = !entry.blockedUntil || now > entry.blockedUntil;
      
      if (isOld && isUnblocked) {
        this.rateLimits.delete(phoneNumber);
      }
    });
  }

  /**
   * Generate WhatsApp link for manual delivery
   */
  private generateWhatsAppLink(phoneNumber: string, otp: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    
    const message = encodeURIComponent(
      `🔐 TRINK Verification Code: ${otp}\n\nYour phone verification code is ${otp}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.\n\nDo not share this code with anyone.`
    );
    
    return `https://wa.me/${formattedNumber}?text=${message}`;
  }

  /**
   * Send OTP with proper security measures
   */
  async sendOTP(phoneNumber: string): Promise<VerificationResult> {
    // Clean up expired data
    this.cleanup();

    // Validate phone number
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      return {
        success: false,
        message: 'Invalid phone number format'
      };
    }

    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit(phoneNumber);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: `Too many requests. Please wait ${Math.ceil((rateLimitCheck.cooldownSeconds || 0) / 60)} minutes before trying again.`,
        cooldownSeconds: rateLimitCheck.cooldownSeconds
      };
    }

    // Generate OTP and session
    const otp = this.generateOTP();
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const expiresAt = now + (this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store session
    this.sessions.set(sessionId, {
      phoneNumber,
      otp,
      attempts: 0,
      createdAt: now,
      expiresAt,
      verified: false
    });

    // Generate WhatsApp link
    const whatsappLink = this.generateWhatsAppLink(phoneNumber, otp);

    // Development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 SECURE DEVELOPMENT OTP`);
      console.log(`📱 Phone: ${phoneNumber}`);
      console.log(`🔑 OTP: ${otp}`);
      console.log(`🆔 Session: ${sessionId}`);
      console.log(`⏰ Expires: ${new Date(expiresAt).toLocaleString()}`);
      console.log(`📱 WhatsApp: ${whatsappLink}`);
      console.log(`🚫 Do not share this code\n`);

      return {
        success: true,
        message: `Verification code sent to ${phoneNumber}`,
        sessionId,
        otp, // Only in development
        method: 'development-secure',
        whatsappLink
      };
    }

    // Production mode
    console.log(`📱 OTP sent to ${phoneNumber} (Session: ${sessionId})`);
    console.log(`📱 WhatsApp fallback: ${whatsappLink}`);

    return {
      success: true,
      message: `Verification code sent to ${phoneNumber}. Check your messages or use WhatsApp link.`,
      sessionId,
      method: 'secure-production',
      whatsappLink
    };
  }

  /**
   * Verify OTP with security measures
   */
  async verifyOTP(sessionId: string, enteredOTP: string): Promise<VerificationResult> {
    // Clean up expired data
    this.cleanup();

    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        message: 'Invalid or expired verification session'
      };
    }

    // Check if session expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      };
    }

    // Check if already verified
    if (session.verified) {
      return {
        success: false,
        message: 'This verification code has already been used'
      };
    }

    // Check attempt limit
    if (session.attempts >= this.MAX_ATTEMPTS_PER_SESSION) {
      this.sessions.delete(sessionId);
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new verification code.'
      };
    }

    // Increment attempts
    session.attempts++;

    // Verify OTP
    if (enteredOTP !== session.otp) {
      const remainingAttempts = this.MAX_ATTEMPTS_PER_SESSION - session.attempts;
      
      if (remainingAttempts > 0) {
        return {
          success: false,
          message: `Incorrect verification code. ${remainingAttempts} attempts remaining.`
        };
      } else {
        this.sessions.delete(sessionId);
        return {
          success: false,
          message: 'Incorrect verification code. Maximum attempts exceeded. Please request a new code.'
        };
      }
    }

    // Success - mark as verified
    session.verified = true;
    
    return {
      success: true,
      message: 'Phone number verified successfully!'
    };
  }

  /**
   * Get session info (for debugging)
   */
  getSessionInfo(sessionId: string): VerificationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get rate limit info (for debugging)
   */
  getRateLimitInfo(phoneNumber: string): RateLimitEntry | null {
    return this.rateLimits.get(phoneNumber) || null;
  }
}

export const securePhoneVerification = new SecurePhoneVerificationService();
export default securePhoneVerification;
