// Script to clear all customer data from the database
const fs = require('fs');
const path = require('path');

// Clear user storage files
const userStoragePath = path.join(__dirname, 'lib', 'userStorage.ts');

if (fs.existsSync(userStoragePath)) {
  const userStorageContent = `// User storage utilities
import { User } from '@/types/auth';

const USERS_KEY = 'trink_users';
const CURRENT_USER_KEY = 'trink_current_user';

export const userStorage = {
  // Get all users
  getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  // Save users
  saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  },

  // Add new user
  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  },

  // Find user by email
  findUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  },

  // Update user
  updateUser(email: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      this.saveUsers(users);
    }
  },

  // Delete user
  deleteUser(email: string): void {
    const users = this.getUsers();
    const filteredUsers = users.filter(user => user.email !== email);
    this.saveUsers(filteredUsers);
  },

  // Clear all users (for reset)
  clearAllUsers(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Set current user
  setCurrentUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }
};
`;

  fs.writeFileSync(userStoragePath, userStorageContent);
  console.log('✅ Updated userStorage.ts with clear function');
}

// Create a client-side script to clear localStorage
const clearScriptContent = `
// Clear all customer data from localStorage
console.log('🧹 Clearing all customer data...');

// Clear user data
localStorage.removeItem('trink_users');
localStorage.removeItem('trink_current_user');

// Clear auth data
localStorage.removeItem('auth_token');
localStorage.removeItem('user_session');

// Clear any other Trink-related data
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('trink_') || key.startsWith('auth_') || key.startsWith('user_')) {
    localStorage.removeItem(key);
  }
});

console.log('✅ All customer data cleared successfully!');
console.log('You can now register with the same email address.');
`;

fs.writeFileSync(path.join(__dirname, 'public', 'clear-data.js'), clearScriptContent);

console.log('✅ Customer data clearing script created');
console.log('📝 To clear data, run: node clear-customer-data.js');
console.log('🌐 Or visit: /clear-data.js in your browser console');
