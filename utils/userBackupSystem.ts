// User Account Backup and Recovery System
// This system ensures user accounts persist across website updates and development changes

export interface BackupData {
  users: any[];
  timestamp: Date;
  version: string;
  backupId: string;
}

export class UserBackupSystem {
  private static readonly BACKUP_KEY = 'trinck-user-backup';
  private static readonly USERS_KEY = 'trinck-registered-users';
  private static readonly MAX_BACKUPS = 5;

  // Create a backup of all user data
  static createBackup(): boolean {
    try {
      const usersData = localStorage.getItem(this.USERS_KEY);
      if (!usersData) {
        console.log('📦 No user data found to backup');
        return false;
      }

      const backup: BackupData = {
        users: JSON.parse(usersData),
        timestamp: new Date(),
        version: '1.0',
        backupId: `backup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      };

      // Get existing backups
      const existingBackups = this.getAllBackups();
      
      // Add new backup
      existingBackups.unshift(backup);
      
      // Keep only the latest MAX_BACKUPS
      const trimmedBackups = existingBackups.slice(0, this.MAX_BACKUPS);
      
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(trimmedBackups));
      
      console.log(`✅ User backup created successfully:`, {
        backupId: backup.backupId,
        userCount: backup.users.length,
        timestamp: backup.timestamp
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to create user backup:', error);
      return false;
    }
  }

  // Get all available backups
  static getAllBackups(): BackupData[] {
    try {
      const backupsData = localStorage.getItem(this.BACKUP_KEY);
      if (!backupsData) return [];
      
      const backups = JSON.parse(backupsData);
      return backups.map((backup: any) => ({
        ...backup,
        timestamp: new Date(backup.timestamp)
      }));
    } catch (error) {
      console.error('❌ Failed to load backups:', error);
      return [];
    }
  }

  // Restore users from a specific backup
  static restoreFromBackup(backupId: string): boolean {
    try {
      const backups = this.getAllBackups();
      const targetBackup = backups.find(backup => backup.backupId === backupId);
      
      if (!targetBackup) {
        console.error('❌ Backup not found:', backupId);
        return false;
      }

      // Restore the user data
      localStorage.setItem(this.USERS_KEY, JSON.stringify(targetBackup.users));
      
      console.log(`✅ Users restored from backup:`, {
        backupId: targetBackup.backupId,
        userCount: targetBackup.users.length,
        backupDate: targetBackup.timestamp
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error);
      return false;
    }
  }

  // Restore from the most recent backup
  static restoreFromLatestBackup(): boolean {
    const backups = this.getAllBackups();
    if (backups.length === 0) {
      console.log('📦 No backups available to restore from');
      return false;
    }

    return this.restoreFromBackup(backups[0].backupId);
  }

  // Auto-backup before any major operation
  static autoBackup(): void {
    const usersData = localStorage.getItem(this.USERS_KEY);
    if (usersData) {
      const users = JSON.parse(usersData);
      if (users.length > 0) {
        this.createBackup();
      }
    }
  }

  // Check if users exist, if not try to restore from backup
  static checkAndRestore(): boolean {
    const usersData = localStorage.getItem(this.USERS_KEY);
    
    if (!usersData || JSON.parse(usersData).length === 0) {
      console.log('🔍 No user data found, attempting to restore from backup...');
      return this.restoreFromLatestBackup();
    }
    
    return true;
  }

  // Export user data for manual backup
  static exportUserData(): string {
    try {
      const usersData = localStorage.getItem(this.USERS_KEY);
      if (!usersData) return '';
      
      const exportData = {
        users: JSON.parse(usersData),
        exportDate: new Date(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export user data:', error);
      return '';
    }
  }

  // Import user data from manual backup
  static importUserData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.users || !Array.isArray(importData.users)) {
        console.error('❌ Invalid import data format');
        return false;
      }

      // Create backup before importing
      this.createBackup();
      
      // Import the data
      localStorage.setItem(this.USERS_KEY, JSON.stringify(importData.users));
      
      console.log(`✅ User data imported successfully:`, {
        userCount: importData.users.length,
        importDate: importData.exportDate
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to import user data:', error);
      return false;
    }
  }

  // Get statistics about stored users
  static getUserStats(): { totalUsers: number; drivers: number; customers: number; admins: number; } {
    try {
      const usersData = localStorage.getItem(this.USERS_KEY);
      if (!usersData) return { totalUsers: 0, drivers: 0, customers: 0, admins: 0 };
      
      const users = JSON.parse(usersData);
      const stats = {
        totalUsers: users.length,
        drivers: users.filter((u: any) => u.type === 'driver').length,
        customers: users.filter((u: any) => u.type === 'customer').length,
        admins: users.filter((u: any) => u.type === 'admin').length
      };
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      return { totalUsers: 0, drivers: 0, customers: 0, admins: 0 };
    }
  }
}

// Auto-initialize backup system - FULLY AUTOMATIC
if (typeof window !== 'undefined') {
  // Check and restore on page load
  UserBackupSystem.checkAndRestore();
  
  // Create backup every 30 seconds for maximum safety
  setInterval(() => {
    UserBackupSystem.autoBackup();
  }, 30 * 1000);
  
  // Create backup before page unload
  window.addEventListener('beforeunload', () => {
    UserBackupSystem.autoBackup();
  });
  
  // Create backup on visibility change (tab switch, minimize, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      UserBackupSystem.autoBackup();
    } else {
      // When tab becomes visible, check if we need to restore
      setTimeout(() => UserBackupSystem.checkAndRestore(), 100);
    }
  });
  
  // Create backup on focus events
  window.addEventListener('blur', () => {
    UserBackupSystem.autoBackup();
  });
  
  window.addEventListener('focus', () => {
    setTimeout(() => UserBackupSystem.checkAndRestore(), 100);
  });
  
  // Storage event listener for cross-tab sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'trinck-registered-users' && (!e.newValue || JSON.parse(e.newValue).length === 0)) {
      // If users were cleared in another tab, restore immediately
      setTimeout(() => UserBackupSystem.restoreFromLatestBackup(), 50);
    }
  });
}
