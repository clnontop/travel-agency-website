// Chat Moderation System
// Handles phone number detection, user strikes, and bans

export interface UserViolation {
  id: string;
  userId: string;
  userName: string;
  chatId: string;
  violationType: 'phone_number' | 'spam' | 'inappropriate';
  originalMessage: string;
  filteredMessage: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface UserBan {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  bannedAt: Date;
  expiresAt: Date;
  isActive: boolean;
  violations: UserViolation[];
}

export interface ModerationStats {
  totalViolations: number;
  activeBans: number;
  phoneNumberAttempts: number;
  recentViolations: UserViolation[];
}

class ChatModerationService {
  private violations: Map<string, UserViolation[]> = new Map();
  private bans: Map<string, UserBan> = new Map();
  private readonly STRIKE_LIMIT = 3;
  private readonly BAN_DURATION_DAYS = 7;

  // Phone number patterns to detect
  private phonePatterns = [
    /\b\d{10,15}\b/g, // Basic 10-15 digit numbers
    /\b\+\d{1,3}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g, // International format
    /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, // US format
    /\b\+44[\s-]?\d{4}[\s-]?\d{6}\b/g, // UK format
    /\b\+91[\s-]?\d{5}[\s-]?\d{5}\b/g, // India format
    /\b0\d{10}\b/g, // UK mobile starting with 0
    /\b\d{4}[\s-]?\d{3}[\s-]?\d{3}\b/g, // Alternative format
  ];

  // Additional patterns for creative attempts
  private creativePhonePatterns = [
    /\b\d+[\s]*[-_.]*[\s]*\d+[\s]*[-_.]*[\s]*\d+\b/g, // Numbers with separators
    /\b(zero|one|two|three|four|five|six|seven|eight|nine)+\b/gi, // Written numbers
    /\b\d+\s*(dot|period)\s*\d+\b/gi, // Numbers with "dot"
  ];

  // Check if user is banned
  isUserBanned(userId: string): boolean {
    const ban = this.bans.get(userId);
    if (!ban || !ban.isActive) return false;
    
    // Check if ban has expired
    if (new Date() > ban.expiresAt) {
      ban.isActive = false;
      return false;
    }
    
    return true;
  }

  // Get ban details for user
  getUserBan(userId: string): UserBan | null {
    const ban = this.bans.get(userId);
    if (!ban || !ban.isActive) return null;
    
    // Check if expired
    if (new Date() > ban.expiresAt) {
      ban.isActive = false;
      return null;
    }
    
    return ban;
  }

  // Filter message content for phone numbers
  filterMessage(content: string, userId: string, userName: string, chatId: string): {
    filteredContent: string;
    hasViolation: boolean;
    violation?: UserViolation;
  } {
    let filteredContent = content;
    let hasPhoneNumber = false;

    // Check for phone number patterns
    for (const pattern of this.phonePatterns) {
      if (pattern.test(content)) {
        hasPhoneNumber = true;
        filteredContent = filteredContent.replace(pattern, '###');
      }
    }

    // Check for creative phone number attempts
    for (const pattern of this.creativePhonePatterns) {
      if (pattern.test(content)) {
        hasPhoneNumber = true;
        filteredContent = filteredContent.replace(pattern, '###');
      }
    }

    if (hasPhoneNumber) {
      const violation: UserViolation = {
        id: `violation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        userName,
        chatId,
        violationType: 'phone_number',
        originalMessage: content,
        filteredMessage: filteredContent,
        timestamp: new Date()
      };

      this.recordViolation(violation);

      return {
        filteredContent,
        hasViolation: true,
        violation
      };
    }

    return {
      filteredContent: content,
      hasViolation: false
    };
  }

  // Record a violation and check for ban
  private recordViolation(violation: UserViolation): void {
    const userViolations = this.violations.get(violation.userId) || [];
    userViolations.push(violation);
    this.violations.set(violation.userId, userViolations);

    // Check if user should be banned
    const phoneViolations = userViolations.filter(v => v.violationType === 'phone_number');
    
    if (phoneViolations.length >= this.STRIKE_LIMIT) {
      this.banUser(violation.userId, violation.userName, phoneViolations);
    }
  }

  // Ban a user
  private banUser(userId: string, userName: string, violations: UserViolation[]): void {
    const banId = `ban-${Date.now()}-${userId}`;
    const bannedAt = new Date();
    const expiresAt = new Date(bannedAt.getTime() + (this.BAN_DURATION_DAYS * 24 * 60 * 60 * 1000));

    const ban: UserBan = {
      id: banId,
      userId,
      userName,
      reason: `Repeated phone number sharing attempts (${violations.length} violations)`,
      bannedAt,
      expiresAt,
      isActive: true,
      violations
    };

    this.bans.set(userId, ban);
  }

  // Admin functions
  getAllViolations(): UserViolation[] {
    const allViolations: UserViolation[] = [];
    this.violations.forEach((violations) => {
      allViolations.push(...violations);
    });
    return allViolations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAllBans(): UserBan[] {
    return Array.from(this.bans.values()).sort((a, b) => b.bannedAt.getTime() - a.bannedAt.getTime());
  }

  getActiveBans(): UserBan[] {
    return this.getAllBans().filter(ban => ban.isActive && new Date() < ban.expiresAt);
  }

  getUserViolations(userId: string): UserViolation[] {
    return this.violations.get(userId) || [];
  }

  // Admin controls
  unbanUser(userId: string): boolean {
    const ban = this.bans.get(userId);
    if (ban) {
      ban.isActive = false;
      return true;
    }
    return false;
  }

  manualBanUser(userId: string, userName: string, reason: string, durationDays: number = 7): void {
    const banId = `manual-ban-${Date.now()}-${userId}`;
    const bannedAt = new Date();
    const expiresAt = new Date(bannedAt.getTime() + (durationDays * 24 * 60 * 60 * 1000));

    const ban: UserBan = {
      id: banId,
      userId,
      userName,
      reason,
      bannedAt,
      expiresAt,
      isActive: true,
      violations: this.getUserViolations(userId)
    };

    this.bans.set(userId, ban);
  }

  // Get moderation statistics
  getModerationStats(): ModerationStats {
    const allViolations = this.getAllViolations();
    const activeBans = this.getActiveBans();
    const phoneNumberAttempts = allViolations.filter(v => v.violationType === 'phone_number').length;
    const recentViolations = allViolations.slice(0, 10);

    return {
      totalViolations: allViolations.length,
      activeBans: activeBans.length,
      phoneNumberAttempts,
      recentViolations
    };
  }

  // Clear old violations (for cleanup)
  clearOldViolations(daysOld: number = 30): void {
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
    
    this.violations.forEach((violations, userId) => {
      const recentViolations = violations.filter((v: UserViolation) => v.timestamp > cutoffDate);
      if (recentViolations.length > 0) {
        this.violations.set(userId, recentViolations);
      } else {
        this.violations.delete(userId);
      }
    });
  }
}

export const chatModerationService = new ChatModerationService();
export default chatModerationService;
