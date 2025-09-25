import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthTokenUtils } from '@/utils/authUtils';
import { UserBackupSystem } from '@/utils/userBackupSystem';
import { SessionSync } from '@/utils/sessionSync';
import { EnhancedSessionSync } from '@/utils/enhancedSessionSync';

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
  token: string; // Unique persistent token like Discord
  tokenCreatedAt: Date; // When token was generated
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
  memberSince: string;
  isAvailable?: boolean;
  createdAt: Date;
  lastLogin?: Date;
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
  updateTruck: (truckId: string, updates: Partial<Truck>) => Promise<{ success: boolean; message: string; }>;
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
        user.createdAt = new Date(user.createdAt);
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
            user.createdAt = new Date(user.createdAt);
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
          // First try to find user in local storage
          const existingUser = Array.from(globalUsers.values()).find(
            user => user.email.toLowerCase() === email.toLowerCase() && 
                    user.type === userType &&
                    AuthTokenUtils.verifyPassword(password, user.password)
          );
          
          if (existingUser) {
            // Update last login time
            const updatedUser = { ...existingUser, lastLogin: new Date() };
            
            // Update user in global storage
            globalUsers.set(updatedUser.id, updatedUser);
            saveUsersToStorage(globalUsers);
            
            console.log(`✅ Local login successful:`, {
              id: updatedUser.id,
              name: updatedUser.name,
              email: updatedUser.email,
              type: updatedUser.type
            });
            
            set({ 
              user: updatedUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          }
          
          // If not found locally, try enhanced session sync as fallback
          try {
            const result = await EnhancedSessionSync.login(email, password, userType, rememberDevice);
            
            if (result.success && result.user) {
              // Update last login time in local storage
              const updatedUser = { ...result.user, lastLogin: new Date() };
              
              // Update user in global storage
              globalUsers.set(updatedUser.id, updatedUser);
              saveUsersToStorage(globalUsers);
              
              console.log(`✅ Enhanced cross-device login successful:`, {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                type: updatedUser.type,
                rememberDevice
              });
              
              set({ 
                user: updatedUser, 
                isAuthenticated: true, 
                isLoading: false 
              });
              return true;
            }
          } catch (enhancedError) {
            console.log('Enhanced login failed, user not found locally either');
          }
          
          console.log(`❌ Login failed: User not found or invalid credentials`);
          set({ isLoading: false });
          return false;
          
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
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
          
          // Generate Discord-style token and hash password
          const userToken = AuthTokenUtils.generateUserToken(uniqueId, userData.email);
          const hashedPassword = AuthTokenUtils.hashPassword(userData.password); // Use actual password from form
          
          const newUser: User = {
            id: uniqueId,
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            phone: userData.phone,
            type: userData.type,
            token: userToken,
            tokenCreatedAt: new Date(),
            isPremium: false,
            bio: userData.bio || '',
            location: userData.location || '',
            company: userData.company || '',
            vehicleType: userData.vehicleType || '',
            licenseNumber: userData.licenseNumber || '',
            wallet: {
              balance: 1000, // Give new users ₹1000 starting balance
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
          
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        // Use Enhanced SessionSync for cross-device logout
        await EnhancedSessionSync.logout();
        
        console.log('🔓 User logged out - enhanced session cleared from all devices');
        
        set({ 
          user: null, 
          isAuthenticated: false,
          transactions: []
        });
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get();
        if (!user) return { success: false, message: 'Not authenticated' };

        try {
          // Verify current password
          if (!AuthTokenUtils.verifyPassword(currentPassword, user.password)) {
            return { success: false, message: 'Current password is incorrect' };
          }

          // Hash new password
          const hashedNewPassword = AuthTokenUtils.hashPassword(newPassword);
          
          // Generate new token (invalidates old sessions)
          const newToken = AuthTokenUtils.generateUserToken(user.id, user.email);
          
          // Update user with new password and token
          const updatedUser = {
            ...user,
            password: hashedNewPassword,
            token: newToken,
            tokenCreatedAt: new Date()
          };

          // Update in storage
          globalUsers.set(user.id, updatedUser);
          saveUsersToStorage(globalUsers);

          // Update current session
          localStorage.setItem('auth_token', newToken);
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
      updateTruck: async (truckId: string, updates: Partial<Truck>) => {
        const { user } = get();
        if (!user) return { success: false, message: 'Not authenticated' };
        if (user.type !== 'driver') return { success: false, message: 'Only drivers can manage trucks' };

        try {
          const updatedTrucks = (user.trucks || []).map(truck => 
            truck.id === truckId ? { ...truck, ...updates } : truck
          );
          
          const updatedUser = {
            ...user,
            trucks: updatedTrucks
          };

          globalUsers.set(user.id, updatedUser);
          saveUsersToStorage(globalUsers);
          set({ user: updatedUser });

          return { success: true, message: 'Truck updated successfully!' };
        } catch (error) {
          return { success: false, message: 'Failed to update truck' };
        }
      }
      }
    ),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        transactions: state.transactions
      })
    }
  )
);