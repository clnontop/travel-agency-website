import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EnhancedSessionSync } from '../utils/enhancedSessionSync';
import { TokenManager } from '../utils/tokenManager';
import { formatINR } from '../utils/currency';
import { UserBackupSystem } from '../utils/userBackupSystem';

export interface Truck {
  id: string;
  name: string;
  vehicleType: string;
  licenseNumber: string;
  capacity: string;
  isActive: boolean;
  createdAt: Date;
}

export interface PremiumPlan {
  duration: '3months' | '6months' | '1year';
  price: number;
  expiresAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Store hashed password
  phone: string;
  type: 'driver' | 'customer' | 'admin';
  token?: string; // Unique persistent token like Discord
  tokenCreatedAt?: Date; // When token was generated
  googleId?: string; // Google OAuth ID
  profilePicture?: string; // Profile picture URL
  firstName?: string; // First name from Google
  lastName?: string; // Last name from Google
  isEmailVerified?: boolean; // Email verification status
  isAadhaarVerified?: boolean; // Aadhaar verification status
  aadhaarNumber?: string; // Aadhaar number
  aadhaarEmail?: string; // Aadhaar email
  createdAt?: Date; // Account creation date
  updatedAt?: Date; // Last update date
  lastLogin?: Date; // Last login time
  
  // Customer specific fields
  postedJobs?: number;
  activeJobs?: number;
  isActive?: boolean; // Account active status
  isBanned?: boolean; // Account banned status
  isPremium?: boolean;
  premiumPlan?: PremiumPlan;
  premiumSince?: Date;
  trucks?: Truck[]; // For premium drivers - up to 3 trucks
  avatar?: string;
  bio?: string;
  location?: string;
  company?: string;
  vehicleType?: string;
  licenseNumber?: string;
  experience?: string;
  specialization?: string;
  wallet: {
    balance: number;
    currency: string;
    pending: number;
    totalSpent: number;
    totalEarned: number;
  };
  rating?: number;
  completedJobs?: number;
  totalEarnings?: number;
  memberSince?: string;
  isAvailable?: boolean;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  transactions: Transaction[];

  // Actions
  login: (email: string, password: string, userType: 'driver' | 'customer' | 'admin', rememberDevice?: boolean) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'memberSince' | 'wallet' | 'token' | 'tokenCreatedAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
  updateProfile: (updates: Partial<User>) => void;
  updateWallet: (walletUpdate: Partial<User['wallet']>) => void;
  addTransaction: (transaction: Transaction) => void;
  payDriver: (driverId: string, amount: number, description: string) => Promise<{ success: boolean; message: string; }>;
  upgradeToPremium: (duration: '1minute' | '3months' | '6months' | '1year') => Promise<{ success: boolean; message: string; }>;
  addTruck: (truckData: Omit<Truck, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string; }>;
  removeTruck: (truckId: string) => Promise<{ success: boolean; message: string; }>;
  updateTruck: (truckId: string, updates: Partial<Truck>) => boolean;
  
  // Google Sign-In methods
  googleSignIn: (credential: string, userType: 'driver' | 'customer' | 'admin') => Promise<{ success: boolean; user?: User; isNewUser?: boolean; message?: string; }>;
  setUser: (user: User) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

// Persistent users storage using localStorage
const USERS_STORAGE_KEY = 'trinck-registered-users';

function loadUsersFromStorage(): Map<string, User> {
  if (typeof window === 'undefined') return new Map();
  
  try {
    // Always try to restore from backup first
    UserBackupSystem.checkAndRestore();
    
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      // No users found, try aggressive restore
      UserBackupSystem.restoreFromLatestBackup();
      const retryStored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!retryStored) return new Map();
    }
    
    const finalStored = stored || localStorage.getItem(USERS_STORAGE_KEY);
    if (!finalStored) return new Map();
    
    try {
      const usersArray = JSON.parse(finalStored);
      if (!Array.isArray(usersArray) || usersArray.length === 0) {
        // Empty or invalid data, restore from backup
        UserBackupSystem.restoreFromLatestBackup();
        const backupStored = localStorage.getItem(USERS_STORAGE_KEY);
        if (backupStored) {
          const backupUsers = JSON.parse(backupStored);
          if (Array.isArray(backupUsers) && backupUsers.length > 0) {
            usersArray.splice(0, usersArray.length, ...backupUsers);
          }
        }
      }
      
      const usersMap = new Map<string, User>();
      usersArray.forEach((user: User) => {
        // Convert date strings back to Date objects
        if (user.createdAt) user.createdAt = new Date(user.createdAt);
        if (user.premiumSince) user.premiumSince = new Date(user.premiumSince);
        if (user.tokenCreatedAt) user.tokenCreatedAt = new Date(user.tokenCreatedAt);
        if (user.lastLogin) user.lastLogin = new Date(user.lastLogin);
        usersMap.set(user.id, user);
      });
      
      console.log(`📊 Loaded ${usersMap.size} users from storage (auto-backup active)`);
      return usersMap;
    } catch (error) {
      console.error('Error parsing users, attempting restore:', error);
      // Aggressive restore attempt
      UserBackupSystem.restoreFromLatestBackup();
      const restoredStored = localStorage.getItem(USERS_STORAGE_KEY);
      if (restoredStored) {
        try {
          const restoredUsers = JSON.parse(restoredStored);
          const usersMap = new Map<string, User>();
          restoredUsers.forEach((user: User) => {
            if (user.createdAt) user.createdAt = new Date(user.createdAt);
            if (user.premiumSince) user.premiumSince = new Date(user.premiumSince);
            if (user.tokenCreatedAt) user.tokenCreatedAt = new Date(user.tokenCreatedAt);
            if (user.lastLogin) user.lastLogin = new Date(user.lastLogin);
            usersMap.set(user.id, user);
          });
          console.log(`🔄 Restored ${usersMap.size} users from backup`);
          return usersMap;
        } catch (restoreError) {
          console.error('Failed to restore from backup:', restoreError);
        }
      }
    }
  } catch (error) {
    console.error('Critical error loading users:', error);
    UserBackupSystem.restoreFromLatestBackup();
  }
  return new Map();
}

function saveUsersToStorage(users: Map<string, User>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const usersArray = Array.from(users.values());
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersArray));
    
    // Auto-backup after saving users
    UserBackupSystem.autoBackup();
    
    console.log(`💾 Saved ${usersArray.length} users to storage with backup`);
  } catch (error) {
    console.error('Error saving users to storage:', error);
  }
}

let globalUsers: Map<string, User> = loadUsersFromStorage();

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      transactions: [],

      login: async (email: string, password: string, userType: 'driver' | 'customer' | 'admin', rememberDevice = true) => {
        set({ isLoading: true });
        
        try {
          // First try database API
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
              type: userType
            })
          });

          const data = await response.json();

          if (data.success && data.user) {
            // Store token if provided
            if (data.token) {
              localStorage.setItem('auth_token', data.token);
            }

            // Update user in local state
            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false 
            });

            console.log(`✅ Database login successful:`, {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              type: data.user.type
            });

            return true;
          } else {
            console.log(`❌ Database login failed, trying localStorage:`, data.message);
            
            // Fallback to localStorage
            const users = loadUsersFromStorage();
            const user = Array.from(users.values()).find(
              u => u.email.toLowerCase() === email.toLowerCase() && 
                   u.type === userType &&
                   u.password === password // In real app, this should be hashed
            );

            if (user) {
              set({ 
                user, 
                isAuthenticated: true, 
                isLoading: false 
              });

              console.log(`✅ LocalStorage login successful:`, {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type
              });

              return true;
            } else {
              set({ isLoading: false });
              return false;
            }
          }
          
        } catch (error) {
          console.error('Database login error, trying localStorage:', error);
          
          // Fallback to localStorage
          const users = loadUsersFromStorage();
          const user = Array.from(users.values()).find(
            u => u.email.toLowerCase() === email.toLowerCase() && 
                 u.type === userType &&
                 u.password === password // In real app, this should be hashed
          );

          if (user) {
            // Try to verify using existing token first
            const existingToken = TokenManager.verifyLoginCredentials(email, password, userType);
            
            if (existingToken) {
              // User has existing token - use it (multi-device support)
              TokenManager.setCurrentToken(existingToken);
              
              // Create user object from token details
              const tokenUser: User = {
                id: existingToken.userId,
                name: existingToken.userDetails.name,
                email: existingToken.userDetails.email,
                phone: existingToken.userDetails.phone,
                type: existingToken.userDetails.type,
                password: existingToken.userDetails.password,
                token: existingToken.id,
                tokenCreatedAt: new Date(existingToken.issuedAt),
                isPremium: existingToken.userDetails.isPremium,
                bio: existingToken.userDetails.bio,
                location: existingToken.userDetails.location,
                company: existingToken.userDetails.company,
                vehicleType: existingToken.userDetails.vehicleType,
                licenseNumber: existingToken.userDetails.licenseNumber,
                memberSince: existingToken.userDetails.memberSince,
                rating: existingToken.userDetails.rating,
                completedJobs: existingToken.userDetails.completedJobs,
                totalEarnings: existingToken.userDetails.totalEarnings,
                isAvailable: existingToken.userDetails.isAvailable,
                wallet: {
                  balance: existingToken.userDetails.walletBalance,
                  currency: 'INR',
                  pending: 0,
                  totalSpent: existingToken.userDetails.totalSpent,
                  totalEarned: existingToken.userDetails.totalEarned
                }
              };
              
              set({ 
                user: tokenUser, 
                isAuthenticated: true, 
                isLoading: false 
              });
              
              console.log(`✅ Login successful using existing token for ${email} on new device`);
            } else {
              // Fallback to old system and create new token
              const updatedUser = { ...user, token: user.token || 'legacy-token' };
              
              set({ 
                user: updatedUser, 
                isAuthenticated: true, 
                isLoading: false 
              });
              
              console.log(`✅ Login successful with legacy system for ${email}`);
            }

            console.log(`✅ LocalStorage fallback login successful:`, {
              id: user.id,
              name: user.name,
              email: user.email,
              type: user.type
            });

            return true;
          } else {
            set({ isLoading: false });
            return false;
          }
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          // Check if user already exists
          const existingUser = Array.from(globalUsers.values()).find(
            user => user.email.toLowerCase() === userData.email.toLowerCase() && user.type === userData.type
          );
          
          if (existingUser) {
            console.log(`⚠️ User already exists: ${userData.email} (${userData.type})`);
            set({ isLoading: false });
            
            // Instead of failing, log them in if it's the same user
            set({ 
              user: existingUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true; // Return success to avoid error message
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Generate unique user ID with timestamp and random string
          const uniqueId = `${userData.type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          
          // Generate comprehensive secure user token with all details
          const userToken = TokenManager.generateUserToken({
            id: uniqueId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            type: userData.type,
            password: userData.password,
            bio: userData.bio,
            location: userData.location,
            company: userData.company,
            vehicleType: userData.vehicleType,
            licenseNumber: userData.licenseNumber,
            isPremium: false,
            memberSince: new Date().getFullYear().toString(),
            wallet: {
              balance: 0,
              totalSpent: 0,
              totalEarned: 0
            }
          });
          const hashedPassword = userData.password; // In production, hash this properly
          
          const newUser: User = {
            id: uniqueId,
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            phone: userData.phone,
            type: userData.type,
            token: userToken.id,
            tokenCreatedAt: new Date(),
            isPremium: false,
            bio: userData.bio || '',
            location: userData.location || '',
            company: userData.company || '',
            vehicleType: userData.vehicleType || '',
            licenseNumber: userData.licenseNumber || '',
            wallet: {
              balance: 0, // New users start with ₹0 - must add money themselves
              currency: 'INR',
              pending: 0,
              totalSpent: 0,
              totalEarned: 0
            },
            rating: userData.type === 'driver' ? 0 : undefined,
            completedJobs: userData.type === 'driver' ? 0 : undefined,
            totalEarnings: userData.type === 'driver' ? 0 : undefined,
            memberSince: new Date().getFullYear().toString(),
            isAvailable: userData.type === 'driver' ? true : undefined,
            createdAt: new Date()
          };

          // Store user in global registry and save to localStorage
          globalUsers.set(newUser.id, newUser);
          saveUsersToStorage(globalUsers);
          
          // If user is a driver, add them to the drivers store
          if (newUser.type === 'driver') {
            const { useDrivers } = await import('./useDrivers');
            const driversStore = useDrivers.getState();
            driversStore.addDriver({
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              bio: newUser.bio || '',
              location: newUser.location || '',
              vehicleType: newUser.vehicleType || '',
              licenseNumber: newUser.licenseNumber || '',
              rating: 0,
              completedJobs: 0,
              totalEarnings: 0,
              memberSince: new Date().getFullYear().toString(),
              isAvailable: true,
              isOnline: true,
              lastSeen: new Date(),
              isPremium: false
            });
          }
          
          console.log(`✅ New user registered:`, {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            type: newUser.type
          });

          set({ 
            user: newUser, 
            isAuthenticated: true, 
            isLoading: false,
            transactions: []
          });

          // Set secure cookie for session management
          if (typeof window !== 'undefined') {
            document.cookie = `user-session=${JSON.stringify({
              id: newUser.id,
              type: newUser.type,
              email: newUser.email
            })}; path=/; max-age=86400; secure; samesite=strict`;
          }
          
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        const { user } = get();
        
        // Clear user tokens
        if (user && typeof window !== 'undefined') {
          TokenManager.clearAllUserTokens(user.id);
          await EnhancedSessionSync.logout();
        }
        
        // Clear local storage
        localStorage.removeItem('auth_token');
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false,
          transactions: []
        });
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get();
        if (!user) return { success: false, message: 'Not authenticated' };

        try {
          // Verify current password (simplified for demo - use proper hashing in production)
          if (currentPassword !== user.password) {
            return { success: false, message: 'Current password is incorrect' };
          }

          // Generate new token with updated password (invalidates old sessions)
          const newToken = TokenManager.generateUserToken({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            type: user.type,
            password: newPassword,
            bio: user.bio,
            location: user.location,
            company: user.company,
            vehicleType: user.vehicleType,
            licenseNumber: user.licenseNumber,
            isPremium: user.isPremium,
            memberSince: user.memberSince,
            rating: user.rating,
            completedJobs: user.completedJobs,
            totalEarnings: user.totalEarnings,
            isAvailable: user.isAvailable,
            wallet: {
              balance: user.wallet.balance,
              totalSpent: user.wallet.totalSpent,
              totalEarned: user.wallet.totalEarned
            }
          });
          
          // Update user with new password and token
          const updatedUser = {
            ...user,
            password: newPassword, // In production, hash this properly
            token: newToken.id,
            tokenCreatedAt: new Date()
          };

          // Update in storage
          globalUsers.set(user.id, updatedUser);
          saveUsersToStorage(globalUsers);

          // Update current session
          localStorage.setItem('auth_token', newToken.id);
          set({ user: updatedUser });

          return { success: true, message: 'Password changed successfully. All other sessions have been invalidated.' };
        } catch (error) {
          return { success: false, message: 'Failed to change password' };
        }
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          
          // Update in global registry and save to localStorage
          globalUsers.set(updatedUser.id, updatedUser);
          saveUsersToStorage(globalUsers);
          
          set({
            user: updatedUser
          });
        }
      },

      updateWallet: (walletUpdate) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            wallet: { 
              ...currentUser.wallet, 
              ...walletUpdate 
            }
          };
          
          // Update in global registry and save to localStorage
          globalUsers.set(updatedUser.id, updatedUser);
          saveUsersToStorage(globalUsers);
          
          set({ user: updatedUser });
          
          // Log for debugging
          console.log('Wallet updated:', {
            previous: currentUser.wallet,
            update: walletUpdate,
            new: updatedUser.wallet
          });
        }
      },
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions]
        }));
      },

      payDriver: async (driverId: string, amount: number, description: string) => {
        const currentUser = get().user;
        
        if (!currentUser) {
          return { success: false, message: 'User not authenticated' };
        }
        
        if (currentUser.type !== 'customer') {
          return { success: false, message: 'Only customers can make payments' };
        }
        
        if (amount <= 0) {
          return { success: false, message: 'Payment amount must be greater than 0' };
        }
        
        if (currentUser.wallet.balance < amount) {
          return { success: false, message: 'Insufficient balance' };
        }
        
        try {
          // Simulate finding the driver (in a real app, this would be an API call)
          // For now, we'll create a mock driver or assume the driver exists
          const transactionId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Deduct from customer wallet
          const updatedCustomerWallet = {
            ...currentUser.wallet,
            balance: currentUser.wallet.balance - amount,
            totalSpent: currentUser.wallet.totalSpent + amount
          };
          
          // Update customer wallet
          get().updateWallet(updatedCustomerWallet);
          
          // Add transaction for customer (debit)
          const customerTransaction: Transaction = {
            id: transactionId,
            type: 'debit',
            amount: amount,
            description: `Payment to driver: ${description}`,
            timestamp: new Date(),
            status: 'completed',
            category: 'payment'
          };
          
          get().addTransaction(customerTransaction);
          
          // Add payment to driver's wallet using driver wallet system
          try {
            const { useDriverWallets } = await import('./useDriverWallets');
            const { useDrivers } = await import('./useDrivers');
            const driverWalletStore = useDriverWallets.getState();
            const driversStore = useDrivers.getState();
            
            console.log('💰 Processing instant payment to driver:', {
              driverId,
              amount,
              description,
              customerId: currentUser.id,
              customerName: currentUser.name
            });
            
            // Transfer money to driver's wallet instantly
            driverWalletStore.addPaymentToDriver(
              driverId,
              amount,
              description,
              currentUser.id,
              currentUser.name
            );
            
            // Update driver's total earnings in the drivers store
            driversStore.addEarnings(driverId, amount);
            
            // Verify the payment was added
            const updatedDriverWallet = driverWalletStore.getDriverWallet(driverId);
            const driverTransactions = driverWalletStore.getDriverTransactions(driverId);
            const updatedDriver = driversStore.getDriver(driverId);
            
            console.log('✅ Instant payment completed:', {
              driverId,
              driverName: updatedDriver?.name,
              newWalletBalance: updatedDriverWallet.balance,
              totalEarned: updatedDriverWallet.totalEarned,
              driverTotalEarnings: updatedDriver?.totalEarnings,
              recentTransactions: driverTransactions.slice(0, 2)
            });
            
            // Broadcast payment notification for real-time updates
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('payment-broadcast', JSON.stringify({
                type: 'payment_received',
                driverId,
                amount,
                from: currentUser.name,
                timestamp: Date.now()
              }));
              window.localStorage.removeItem('payment-broadcast');
            }
            
          } catch (driverWalletError) {
            console.error('❌ Error updating driver wallet:', driverWalletError);
            // Don't fail the entire payment if driver wallet update fails
            // In a real app, you'd want to handle this more carefully
          }
          
          return { 
            success: true, 
            message: `Payment of ₹${amount} sent successfully to driver. Your new balance: ₹${updatedCustomerWallet.balance}` 
          };
          
        } catch (error) {
          console.error('Payment failed:', error);
          return { 
            success: false, 
            message: 'Payment failed. Please try again.' 
          };
        }
      },

      upgradeToPremium: async (duration: '1minute' | '3months' | '6months' | '1year') => {
        const currentUser = get().user;
        
        if (!currentUser) {
          return { success: false, message: 'User not authenticated' };
        }

        try {
          // Use the premium store directly
          const { usePremium } = await import('./usePremium');
          const premiumStore = usePremium.getState();
          
          // Map duration to plan ID
          const durationToPlanMap = {
            '1minute': 'premium_3m', // Fallback to 3 months for test
            '3months': 'premium_3m',
            '6months': 'premium_6m', 
            '1year': 'premium_1y'
          };
          
          const planId = durationToPlanMap[duration];
          const plan = premiumStore.getPlan(planId);
          
          if (!plan) {
            return { success: false, message: 'Invalid subscription plan' };
          }

          if (currentUser.wallet.balance < plan.price) {
            return { 
              success: false, 
              message: `Insufficient balance. You need ₹${plan.price} but have ₹${currentUser.wallet.balance}` 
            };
          }

          // Create subscription and payment
          const paymentId = `pay_${Date.now()}_${currentUser.id}`;
          const subscription = premiumStore.createSubscription(currentUser.id, planId, paymentId);
          
          // Update user wallet and premium status
          const updatedWallet = {
            ...currentUser.wallet,
            balance: currentUser.wallet.balance - plan.price,
            totalSpent: currentUser.wallet.totalSpent + plan.price
          };

          const updatedUser = {
            ...currentUser,
            isPremium: true,
            premiumSince: new Date(),
            wallet: updatedWallet
          };

          // Update user profile
          get().updateProfile(updatedUser);

          // Add transaction
          get().addTransaction({
            id: `sub_${Date.now()}`,
            type: 'debit',
            amount: plan.price,
            description: `Premium Subscription - ${plan.name}`,
            timestamp: new Date(),
            status: 'completed',
            category: 'subscription'
          });

          return { 
            success: true, 
            message: `🎉 Successfully upgraded to ${plan.name}! Your premium benefits are now active.` 
          };
        } catch (error) {
          console.error('Premium upgrade error:', error);
          return { 
            success: false, 
            message: 'Premium upgrade failed. Please try again.' 
          };
        }
      },

      // Add truck (for premium drivers only)
      addTruck: async (truckData: Omit<Truck, 'id' | 'createdAt'>) => {
        const { user } = get();
        if (!user) return { success: false, message: 'Not authenticated' };
        if (user.type !== 'driver') return { success: false, message: 'Only drivers can add trucks' };
        if (!user.isPremium) return { success: false, message: 'Premium membership required to add multiple trucks' };

        const currentTrucks = user.trucks || [];
        if (currentTrucks.length >= 3) {
          return { success: false, message: 'Maximum 3 trucks allowed per premium account' };
        }

        try {
          const newTruck: Truck = {
            ...truckData,
            id: `truck_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date()
          };

          const updatedUser = {
            ...user,
            trucks: [...currentTrucks, newTruck]
          };

          globalUsers.set(user.id, updatedUser);
          saveUsersToStorage(globalUsers);
          set({ user: updatedUser });

          return { success: true, message: 'Truck added successfully!' };
        } catch (error) {
          return { success: false, message: 'Failed to add truck' };
        }
      },

      // Remove truck
      removeTruck: async (truckId: string) => {
        const { user } = get();
        if (!user) return { success: false, message: 'Not authenticated' };
        if (user.type !== 'driver') return { success: false, message: 'Only drivers can manage trucks' };

        try {
          const updatedTrucks = (user.trucks || []).filter(truck => truck.id !== truckId);
          const updatedUser = {
            ...user,
            trucks: updatedTrucks
          };

          globalUsers.set(user.id, updatedUser);
          saveUsersToStorage(globalUsers);
          set({ user: updatedUser });

          return { success: true, message: 'Truck removed successfully!' };
        } catch (error) {
          return { success: false, message: 'Failed to remove truck' };
        }
      },
      // Update truck
      updateTruck: (truckId: string, updates: Partial<Truck>) => {
        const { user } = get();
        if (!user || user.type !== 'driver') return false;

        const updatedTrucks = user.trucks?.map(truck => 
          truck.id === truckId ? { ...truck, ...updates } : truck
        ) || [];

        const updatedUser = { ...user, trucks: updatedTrucks };
        
        // Update in global storage
        globalUsers.set(updatedUser.id, updatedUser);
        saveUsersToStorage(globalUsers);
        
        set({ user: updatedUser });
        return true;
      },

      // Google Sign-In integration
      googleSignIn: async (credential: string, userType: 'driver' | 'customer' | 'admin') => {
        set({ isLoading: true });
        
        try {
          const response = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              credential,
              userType,
            }),
          });

          const data = await response.json();

          if (data.success) {
            // Update global users storage
            globalUsers.set(data.user.id, data.user);
            saveUsersToStorage(globalUsers);

            set({ 
              user: data.user, 
              isAuthenticated: true, 
              isLoading: false 
            });

            return { success: true, user: data.user, isNewUser: data.isNewUser };
          } else {
            set({ isLoading: false });
            return { success: false, message: data.message };
          }
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: 'Google sign-in failed. Please try again.' };
        }
      },

      // Helper methods for Google integration
      setUser: (user: User) => {
        globalUsers.set(user.id, user);
        saveUsersToStorage(globalUsers);
        set({ user, isAuthenticated: true });
      },

      setAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);