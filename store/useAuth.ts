import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthUtils } from '@/utils/authUtils';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // Hashed password
  token: string; // Unique user token linked to password
  type: 'driver' | 'customer' | 'admin';
  isPremium?: boolean;
  premiumSince?: Date;
  avatar?: string;
  bio?: string;
  location?: string;
  company?: string;
  vehicleType?: string;
  licenseNumber?: string;
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
  tokenCreatedAt: Date;
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
  login: (email: string, password: string, userType: 'driver' | 'customer' | 'admin') => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'memberSince' | 'wallet' | 'token' | 'tokenCreatedAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  updateWallet: (walletUpdate: Partial<User['wallet']>) => void;
  addTransaction: (transaction: Transaction) => void;
  payDriver: (driverId: string, amount: number, description: string) => Promise<{ success: boolean; message: string; }>;
  upgradeToPremium: () => Promise<{ success: boolean; message: string; }>;
}

// Persistent users storage using localStorage
const USERS_STORAGE_KEY = 'trinck-registered-users';

function loadUsersFromStorage(): Map<string, User> {
  if (typeof window === 'undefined') return new Map();
  
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const usersArray = JSON.parse(stored);
      const usersMap = new Map<string, User>();
      usersArray.forEach((user: User) => {
        // Convert date strings back to Date objects
        user.createdAt = new Date(user.createdAt);
        if (user.premiumSince) user.premiumSince = new Date(user.premiumSince);
        usersMap.set(user.id, user);
      });
      return usersMap;
    }
  } catch (error) {
    console.error('Error loading users from storage:', error);
  }
  return new Map();
}

function saveUsersToStorage(users: Map<string, User>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const usersArray = Array.from(users.values());
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersArray));
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

      login: async (email: string, password: string, userType: 'driver' | 'customer' | 'admin') => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check if user exists in registered users with exact email and type match
          const existingUser = Array.from(globalUsers.values()).find(
            user => user.email.toLowerCase() === email.toLowerCase() && user.type === userType
          );
          
          if (existingUser) {
            // Verify password using Discord-style authentication
            const isPasswordValid = AuthUtils.verifyPassword(password, existingUser.password);
            
            if (!isPasswordValid) {
              console.log(`❌ Login failed - invalid password for:`, { email, userType });
              set({ isLoading: false });
              return false;
            }
            
            // Generate new session token using user's unique token
            const sessionToken = AuthUtils.generateSessionToken(existingUser.token);
            
            // Update last login time
            existingUser.lastLogin = new Date();
            globalUsers.set(existingUser.id, existingUser);
            saveUsersToStorage(globalUsers);
            
            // Store session token in localStorage for persistence
            localStorage.setItem('auth_token', sessionToken);
            localStorage.setItem('current_user_id', existingUser.id);
            localStorage.setItem('user_token', existingUser.token);
            
            console.log(`✅ Login successful for registered user:`, {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              type: existingUser.type,
              token: existingUser.token,
              sessionToken: sessionToken
            });
            
            // Login with the actual registered user data (without password)
            const { password: _, ...userWithoutPassword } = existingUser;
            set({ 
              user: userWithoutPassword as User, 
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          }
          
          // If no registered user found, reject login
          console.log(`❌ Login failed - no registered user found for:`, { email, userType });
          set({ isLoading: false });
          return false;
          
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (userData: Omit<User, 'id' | 'createdAt' | 'memberSince' | 'wallet' | 'password' | 'token' | 'tokenCreatedAt' | 'lastLogin'> & { password: string }) => {
        set({ isLoading: true });
        
        try {
          // Check if user already exists
          const existingUser = Array.from(globalUsers.values()).find(
            user => user.email.toLowerCase() === userData.email.toLowerCase() && user.type === userData.type
          );
          
          if (existingUser) {
            set({ isLoading: false });
            return false; // User already exists
          }
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Generate unique user ID using Discord-style method
          const uniqueId = AuthUtils.generateUserId(userData.type);
          
          // Hash password using Discord-style authentication
          const hashedPassword = AuthUtils.hashPassword(userData.password);
          
          // Generate unique user token (Discord-style)
          const userToken = AuthUtils.generateUserToken(uniqueId, userData.password);
          
          const newUser: User = {
            id: uniqueId,
            name: userData.name,
            email: userData.email.toLowerCase(),
            phone: userData.phone,
            password: hashedPassword,
            token: userToken,
            type: userData.type,
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
            createdAt: new Date(),
            tokenCreatedAt: new Date()
          };

          // Store user in global registry and save to localStorage
          globalUsers.set(newUser.id, newUser);
          saveUsersToStorage(globalUsers);
          
          console.log(`✅ New user registered with Discord-style token:`, {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            type: newUser.type,
            token: newUser.token
          });

          // Don't store password in the state
          const { password: _, ...userWithoutPassword } = newUser;
          set({ 
            user: userWithoutPassword as User, 
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

      logout: () => {
        // Clear all session tokens from localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user_id');
        localStorage.removeItem('user_token');
        
        set({ 
          user: null, 
          isAuthenticated: false, 
          transactions: [] 
        });
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get();
        if (!user) return false;

        set({ isLoading: true });

        try {
          // Find the user in storage
          const existingUser = globalUsers.get(user.id);
          if (!existingUser) {
            set({ isLoading: false });
            return false;
          }

          // Verify current password
          const isCurrentPasswordValid = AuthUtils.verifyPassword(currentPassword, existingUser.password);
          if (!isCurrentPasswordValid) {
            set({ isLoading: false });
            return false;
          }

          // Hash new password
          const newHashedPassword = AuthUtils.hashPassword(newPassword);
          
          // Generate new user token (Discord-style - token changes when password changes)
          const newUserToken = AuthUtils.generateUserToken(existingUser.id, newPassword);

          // Update user with new password and token
          const updatedUser = {
            ...existingUser,
            password: newHashedPassword,
            token: newUserToken,
            tokenCreatedAt: new Date()
          };

          // Save to storage
          globalUsers.set(user.id, updatedUser);
          saveUsersToStorage(globalUsers);

          // Clear all existing sessions (force re-login)
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user_id');
          localStorage.removeItem('user_token');

          console.log(`✅ Password changed and token regenerated for user:`, {
            id: updatedUser.id,
            email: updatedUser.email,
            newToken: newUserToken
          });

          // Log out user (they need to login again with new password)
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            transactions: []
          });

          return true;
        } catch (error) {
          console.error('Password change error:', error);
          set({ isLoading: false });
          return false;
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

      upgradeToPremium: async () => {
        const currentUser = get().user;
        
        if (!currentUser) {
          return { success: false, message: 'User not authenticated' };
        }

        if (currentUser.isPremium) {
          return { success: false, message: 'You are already a premium member!' };
        }

        const premiumCost = 999; // ₹999 for premium upgrade

        if (currentUser.wallet.balance < premiumCost) {
          return { 
            success: false, 
            message: `Insufficient balance. Premium upgrade costs ₹${premiumCost}. Please add funds to your wallet.` 
          };
        }

        try {
          // Simulate API call for premium upgrade
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Deduct premium cost from wallet
          const updatedWallet = {
            ...currentUser.wallet,
            balance: currentUser.wallet.balance - premiumCost,
            totalSpent: currentUser.wallet.totalSpent + premiumCost
          };

          // Update user to premium
          const updatedUser = {
            ...currentUser,
            isPremium: true,
            premiumSince: new Date(),
            wallet: updatedWallet
          };

          // Update in global registry and save to localStorage
          globalUsers.set(updatedUser.id, updatedUser);
          saveUsersToStorage(globalUsers);
          
          set({ user: updatedUser });

          // Add transaction record
          const transaction: Transaction = {
            id: `premium_${Date.now()}`,
            type: 'debit',
            amount: premiumCost,
            description: 'Premium Account Upgrade',
            timestamp: new Date(),
            status: 'completed',
            category: 'premium'
          };

          get().addTransaction(transaction);

          return { 
            success: true, 
            message: `🎉 Congratulations! You are now a Premium member! Enjoy exclusive benefits and priority support.` 
          };

        } catch (error) {
          return { 
            success: false, 
            message: 'Premium upgrade failed. Please try again.' 
          };
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