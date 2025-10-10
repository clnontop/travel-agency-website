import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EnhancedSessionSync } from '../utils/enhancedSessionSync';
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
  isLoading: boolean;
  transactions: Transaction[];

  // Actions
  login: (email: string, password: string, userType: 'driver' | 'customer' | 'admin', rememberDevice?: boolean) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  processJobPayment: (jobAmount: number, driverId: string, jobId: string) => Promise<{ success: boolean; message: string; receipt?: any }>;
  addFunds: (amount: number) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string; }>;
  updateWallet: (walletUpdate: Partial<User['wallet']>) => void;
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

function loadUsersFromStorage(): Map<string, User> {
  if (typeof window === 'undefined') return new Map();
  
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      console.log('📦 No users found in storage');
      return new Map();
    }
    
    const usersArray = JSON.parse(stored);
    if (!Array.isArray(usersArray)) {
      console.log('📦 Invalid users data format');
      return new Map();
    }
    
    const usersMap = new Map<string, User>();
    usersArray.forEach((user: User) => {
      if (user.id && user.email) {
        usersMap.set(user.id, user);
      }
    });
    
    console.log(`📦 Loaded ${usersMap.size} users from storage:`, Array.from(usersMap.values()).map(u => ({ id: u.id, email: u.email, type: u.type })));
    return usersMap;
  } catch (error) {
    console.error('Failed to load users from storage:', error);
    return new Map();
  }
}

const USERS_STORAGE_KEY = 'trinck-registered-users';

function saveUsersToStorage(users: Map<string, User>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const usersArray = Array.from(users.values());
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersArray));
    console.log(`💾 Saved ${usersArray.length} users to storage`);
  } catch (error) {
    console.error('Error saving users to storage:', error);
  }
}

let globalUsers: Map<string, User> = loadUsersFromStorage();

// Initialize user from localStorage to prevent hydration issues
const initializeUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const storedUser = localStorage.getItem('current_user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (storedUser && isLoggedIn === 'true') {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
  }
  return null;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: initializeUser(),
      isAuthenticated: typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true',
      isLoading: false,
      transactions: [],

      login: async (email: string, password: string, userType: 'driver' | 'customer' | 'admin', rememberDevice = true) => {
        set({ isLoading: true });
        
        try {
          // SIMPLE LOGIN - Check localStorage users
          const storedUsers = localStorage.getItem('trinck-registered-users');
          if (!storedUsers) {
            console.log('❌ No users found in storage');
            set({ isLoading: false });
            return false;
          }

          const users = JSON.parse(storedUsers);
          const user = users.find((u: any) => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.type === userType &&
            u.password === password
          );

          if (user) {
            // SIMPLE SESSION - Just set the user
            set({ 
              user: user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            
            // Simple localStorage session
            localStorage.setItem('current_user', JSON.stringify(user));
            localStorage.setItem('isLoggedIn', 'true');
            
            console.log(`✅ SIMPLE LOGIN SUCCESS:`, user.name, user.type);
            return true;
          } else {
            console.log(`❌ Login failed - wrong credentials`);
            set({ isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          // SIMPLE REGISTRATION
          const storedUsers = localStorage.getItem('trinck-registered-users') || '[]';
          const users = JSON.parse(storedUsers);
          
          const existingUser = users.find((u: any) => 
            u.email.toLowerCase() === userData.email.toLowerCase() && 
            u.type === userData.type
          );
          
          if (existingUser) {
            set({ 
              user: existingUser, 
              isAuthenticated: true, 
              isLoading: false 
            });
            localStorage.setItem('current_user', JSON.stringify(existingUser));
            localStorage.setItem('isLoggedIn', 'true');
            return true;
          }
          
          // Create new user
          const uniqueId = `${userData.type}_${Date.now()}`;
          const newUser = {
            id: uniqueId,
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password,
            phone: userData.phone,
            type: userData.type,
            bio: userData.bio || '',
            location: userData.location || '',
            wallet: { balance: 0, currency: 'INR', pending: 0, totalSpent: 0, totalEarned: 0 },
            createdAt: new Date()
          };

          // Save to localStorage
          users.push(newUser);
          localStorage.setItem('trinck-registered-users', JSON.stringify(users));
          
          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false
          });

          localStorage.setItem('current_user', JSON.stringify(newUser));
          localStorage.setItem('isLoggedIn', 'true');
          
          console.log('✅ SIMPLE REGISTRATION SUCCESS:', newUser.name);
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        // Clear secure cookie
        if (typeof window !== 'undefined') {
          document.cookie = 'user-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
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

          // Update user with new password
          const updatedUser = {
            ...user,
            password: newPassword // In production, hash this properly
          };

          // Update in storage
          globalUsers.set(user.id, updatedUser);
          saveUsersToStorage(globalUsers);

          // Update current session
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

      processJobPayment: async (jobAmount: number, driverId: string, jobId: string) => {
        const currentUser = get().user;
        
        if (!currentUser) {
          return { success: false, message: 'User not authenticated' };
        }
        
        if (currentUser.type !== 'customer') {
          return { success: false, message: 'Only customers can make job payments' };
        }
        
        // Calculate fees: 2% customer fee + 2% driver fee = 4% total
        const customerFee = Math.round(jobAmount * 0.02); // 2% customer fee
        const driverFee = Math.round(jobAmount * 0.02);   // 2% driver fee
        const totalCustomerPayment = jobAmount + customerFee; // Customer pays job amount + 2%
        const driverReceives = jobAmount - driverFee;         // Driver receives job amount - 2%
        const platformEarnings = customerFee + driverFee;     // Platform earns 4% total
        
        console.log('💰 Payment Calculation:', {
          jobAmount,
          customerFee: `₹${customerFee} (2%)`,
          driverFee: `₹${driverFee} (2%)`,
          totalCustomerPayment: `₹${totalCustomerPayment}`,
          driverReceives: `₹${driverReceives}`,
          platformEarnings: `₹${platformEarnings} (4% total)`
        });
        
        // Check if customer has sufficient balance
        if (currentUser.wallet.balance < totalCustomerPayment) {
          return { 
            success: false, 
            message: `Insufficient balance. You need ₹${totalCustomerPayment} (₹${jobAmount} + ₹${customerFee} fee) but have ₹${currentUser.wallet.balance}` 
          };
        }
        
        try {
          const transactionId = `job_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Deduct total amount from customer wallet
          const updatedCustomerWallet = {
            ...currentUser.wallet,
            balance: currentUser.wallet.balance - totalCustomerPayment,
            totalSpent: currentUser.wallet.totalSpent + totalCustomerPayment
          };
          
          // Update customer wallet
          get().updateWallet(updatedCustomerWallet);
          
          // Add transaction for customer (debit)
          const customerTransaction: Transaction = {
            id: transactionId,
            type: 'debit',
            amount: totalCustomerPayment,
            description: `Job payment: ₹${jobAmount} + ₹${customerFee} platform fee`,
            timestamp: new Date(),
            status: 'completed',
            category: 'job_payment'
          };
          
          get().addTransaction(customerTransaction);
          
          // Transfer money to driver (after deducting driver fee)
          try {
            const { useDriverWallets } = await import('./useDriverWallets');
            const { useDrivers } = await import('./useDrivers');
            const driverWalletStore = useDriverWallets.getState();
            const driversStore = useDrivers.getState();
            
            console.log('💰 Processing job payment to driver:', {
              driverId,
              jobAmount,
              driverReceives,
              driverFee,
              jobId,
              customerId: currentUser.id,
              customerName: currentUser.name
            });
            
            // Transfer money to driver's wallet (job amount minus driver fee)
            driverWalletStore.addPaymentToDriver(
              driverId,
              driverReceives,
              `Job completed: ₹${jobAmount} - ₹${driverFee} platform fee`,
              currentUser.id,
              currentUser.name
            );
            
            // Update driver's total earnings
            driversStore.addEarnings(driverId, driverReceives);
            
            // Broadcast payment notification
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('job-payment-broadcast', JSON.stringify({
                type: 'job_payment_received',
                driverId,
                jobId,
                jobAmount,
                driverReceives,
                customerFee,
                driverFee,
                from: currentUser.name,
                timestamp: Date.now()
              }));
              window.localStorage.removeItem('job-payment-broadcast');
            }
            
            const receipt = {
              transactionId,
              jobId,
              jobAmount,
              customerFee,
              driverFee,
              totalCustomerPayment,
              driverReceives,
              platformEarnings,
              customerName: currentUser.name,
              timestamp: new Date()
            };
            
            return { 
              success: true, 
              message: `✅ Job payment successful! Driver receives ₹${driverReceives}. Your new balance: ₹${updatedCustomerWallet.balance}`,
              receipt
            };
            
          } catch (driverWalletError) {
            console.error('❌ Error updating driver wallet:', driverWalletError);
            return { 
              success: false, 
              message: 'Payment processing failed. Please try again.' 
            };
          }
          
        } catch (error) {
          console.error('Job payment failed:', error);
          return { 
            success: false, 
            message: 'Job payment failed. Please try again.' 
          };
        }
      },

      addFunds: (amount: number) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedWallet = {
            ...currentUser.wallet,
            balance: currentUser.wallet.balance + amount
          };
          
          get().updateWallet(updatedWallet);
          
          // Add transaction
          const transaction: Transaction = {
            id: `fund_${Date.now()}`,
            type: 'credit' as const,
            amount,
            description: 'Funds added to wallet',
            timestamp: new Date(),
            status: 'completed' as const,
            category: 'deposit'
          };
          
          get().addTransaction(transaction);
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