// Shared in-memory user storage for demo purposes
// In production, this would be replaced with a proper database

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  type: 'customer' | 'driver';
  createdAt: Date;
}

// Global user storage that persists across API route reloads
const getUserStorage = (): Map<string, User> => {
  if (typeof global !== 'undefined') {
    if (!(global as any).userStorage) {
      (global as any).userStorage = new Map<string, User>();
    }
    return (global as any).userStorage;
  }
  // Fallback for non-global environments
  return new Map<string, User>();
};

export const userStorage = getUserStorage();

// Helper functions
export const findUserByEmail = (email: string): User | undefined => {
  return Array.from(userStorage.values()).find(user => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  return userStorage.get(id);
};

export const createUser = (userData: User): void => {
  userStorage.set(userData.id, userData);
};

export const getAllUsers = (): User[] => {
  return Array.from(userStorage.values());
};

export const getUserCount = (): number => {
  return userStorage.size;
};
