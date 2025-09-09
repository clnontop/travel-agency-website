import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: '1minute' | '3months' | '6months' | '1year';
  price: number;
  features: string[];
  popular?: boolean;
}

export interface UserSubscription {
  planId: string;
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;
  autoRenew: boolean;
  price: number;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  userSubscription: UserSubscription | null;
  
  // Actions
  initializePlans: () => void;
  purchaseSubscription: (planId: string, userId: string) => Promise<{ success: boolean; message: string; }>;
  checkSubscriptionExpiry: (userId: string) => boolean;
  cancelSubscription: () => Promise<{ success: boolean; message: string; }>;
  renewSubscription: (planId: string) => Promise<{ success: boolean; message: string; }>;
  getActivePlan: () => SubscriptionPlan | null;
  isPremiumFeatureAvailable: (feature: string) => boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_1minute',
    name: '1 Minute Premium (Test)',
    duration: '1minute',
    price: 1000,
    features: [
      'Priority job visibility',
      'Advanced analytics',
      'Multiple truck management (up to 3)',
      'Premium customer support',
      'Real-time tracking',
      'Custom branding'
    ]
  },
  {
    id: 'premium_3months',
    name: '3 Months Premium',
    duration: '3months',
    price: 1500,
    features: [
      'Priority job visibility',
      'Advanced analytics',
      'Multiple truck management (up to 3)',
      'Premium customer support',
      'Real-time tracking',
      'Custom branding'
    ]
  },
  {
    id: 'premium_6months',
    name: '6 Months Premium',
    duration: '6months',
    price: 2500,
    features: [
      'Priority job visibility',
      'Advanced analytics',
      'Multiple truck management (up to 3)',
      'Premium customer support',
      'Real-time tracking',
      'Custom branding',
      'Route optimization',
      'Bulk job posting'
    ],
    popular: true
  },
  {
    id: 'premium_1year',
    name: '1 Year Premium',
    duration: '1year',
    price: 4000,
    features: [
      'Priority job visibility',
      'Advanced analytics',
      'Multiple truck management (up to 3)',
      'Premium customer support',
      'Real-time tracking',
      'Custom branding',
      'Route optimization',
      'Bulk job posting',
      'API access',
      'White-label solution',
      'Dedicated account manager',
      'New feature'
    ]
  }
];

export const useSubscription = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      plans: [],
      userSubscription: null,

      initializePlans: () => {
        set({ plans: SUBSCRIPTION_PLANS });
      },

      purchaseSubscription: async (planId: string, userId: string): Promise<{ success: boolean; message: string; }> => {
        const { plans } = get();
        const selectedPlan = plans.find((plan: any) => plan.id === planId);
        
        if (!selectedPlan) {
          return { success: false, message: 'Invalid subscription plan' };
        }

        try {
          // Import auth store to check user balance and update
          const { useAuth }: any = await import('./useAuth');
          const authStore: any = useAuth.getState();
          const currentUser: any = authStore.user;

          if (!currentUser) {
            return { success: false, message: 'User not authenticated' };
          }

          if (currentUser.wallet.balance < selectedPlan.price) {
            return { 
              success: false, 
              message: `Insufficient balance. You need ₹${selectedPlan.price} but have ₹${currentUser.wallet.balance}` 
            };
          }

          // Calculate expiry date
          const startDate = new Date();
          const expiryDate = new Date(startDate);
          
          switch (selectedPlan.duration) {
            case '1minute':
              expiryDate.setMinutes(startDate.getMinutes() + 1);
              break;
            case '3months':
              expiryDate.setMonth(startDate.getMonth() + 3);
              break;
            case '6months':
              expiryDate.setMonth(startDate.getMonth() + 6);
              break;
            case '1year':
              expiryDate.setFullYear(startDate.getFullYear() + 1);
              break;
          }

          // Create subscription
          const newSubscription: UserSubscription = {
            planId: selectedPlan.id,
            startDate,
            expiryDate,
            isActive: true,
            autoRenew: false,
            price: selectedPlan.price
          };

          // Update user's premium status and deduct payment
          const updatedWallet = {
            ...currentUser.wallet,
            balance: currentUser.wallet.balance - selectedPlan.price,
            totalSpent: currentUser.wallet.totalSpent + selectedPlan.price
          };

          const updatedUser = {
            ...currentUser,
            isPremium: true,
            premiumSince: startDate,
            premiumPlan: {
              duration: selectedPlan.duration,
              price: selectedPlan.price,
              expiresAt: expiryDate
            },
            wallet: updatedWallet
          };

          // Update auth store
          authStore.updateProfile(updatedUser);

          // Add transaction
          authStore.addTransaction({
            id: `sub_${Date.now()}`,
            type: 'debit',
            amount: selectedPlan.price,
            description: `Premium Subscription - ${selectedPlan.name}`,
            timestamp: new Date(),
            status: 'completed',
            category: 'subscription'
          });

          set({ userSubscription: newSubscription });

          // Set up automatic expiry check
          const timeUntilExpiry = expiryDate.getTime() - Date.now();
          if (timeUntilExpiry > 0) {
            setTimeout(() => {
              get().checkSubscriptionExpiry(userId);
            }, timeUntilExpiry);
          }

          return { 
            success: true, 
            message: `🎉 Successfully subscribed to ${selectedPlan.name}! Your premium benefits are now active until ${expiryDate.toLocaleDateString()}.` 
          };

        } catch (error) {
          console.error('Subscription purchase failed:', error);
          return { success: false, message: 'Subscription purchase failed. Please try again.' };
        }
      },

      checkSubscriptionExpiry: (userId: string) => {
        const { userSubscription } = get();
        
        if (!userSubscription || !userSubscription.isActive) {
          return false;
        }

        const now = new Date();
        const isExpired = now > userSubscription.expiryDate;

        if (isExpired) {
          // Subscription has expired - downgrade user
          console.log('🕒 Subscription expired, downgrading user...');
          
          // Update subscription status
          set({
            userSubscription: {
              ...userSubscription,
              isActive: false
            }
          });

          // Update user's premium status
          const { useAuth }: any = require('./useAuth');
          const authStore: any = useAuth.getState();
          const currentUser: any = authStore.user;

          if (currentUser && currentUser.isPremium) {
            const downgradedUser = {
              ...currentUser,
              isPremium: false,
              premiumPlan: undefined,
              trucks: currentUser.type === 'driver' ? (currentUser.trucks || []).slice(0, 1) : undefined // Keep only 1 truck
            };

            authStore.updateProfile(downgradedUser);

            // Notify user about expiry
            authStore.addTransaction({
              id: `exp_${Date.now()}`,
              type: 'debit',
              amount: 0,
              description: 'Premium subscription expired - downgraded to free plan',
              timestamp: new Date(),
              status: 'completed',
              category: 'subscription'
            });

            // Show notification
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('subscription-expired', JSON.stringify({
                message: 'Your premium subscription has expired. Premium features have been disabled.',
                timestamp: Date.now()
              }));
            }
          }

          return false;
        }

        return true;
      },

      cancelSubscription: async () => {
        const { userSubscription } = get();
        
        if (!userSubscription || !userSubscription.isActive) {
          return { success: false, message: 'No active subscription to cancel' };
        }

        try {
          // Mark subscription as inactive but don't remove premium until expiry
          set({
            userSubscription: {
              ...userSubscription,
              autoRenew: false
            }
          });

          return { 
            success: true, 
            message: `Subscription cancelled. Your premium benefits will remain active until ${userSubscription.expiryDate.toLocaleDateString()}.` 
          };

        } catch (error) {
          return { success: false, message: 'Failed to cancel subscription' };
        }
      },

      renewSubscription: async (planId: string): Promise<{ success: boolean; message: string; }> => {
        const { userSubscription } = get();
        
        if (!userSubscription) {
          return { success: false, message: 'No existing subscription to renew' };
        }

        // Use purchase subscription logic for renewal
        const { useAuth }: any = await import('./useAuth');
        const authStore: any = useAuth.getState();
        const currentUser: any = authStore.user;

        if (!currentUser) {
          return { success: false, message: 'User not authenticated' };
        }

        return get().purchaseSubscription(planId, currentUser.id);
      },

      getActivePlan: () => {
        const { plans, userSubscription } = get();
        
        if (!userSubscription || !userSubscription.isActive) {
          return null;
        }

        return plans.find((plan: any) => plan.id === userSubscription.planId) || null;
      },

      isPremiumFeatureAvailable: (feature: string) => {
        const activePlan = get().getActivePlan();
        
        if (!activePlan) {
          return false;
        }

        return activePlan.features.some((planFeature: any) => 
          planFeature.toLowerCase().includes(feature.toLowerCase())
        );
      }
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({ 
        userSubscription: state.userSubscription,
        plans: state.plans
      })
    }
  )
);

// Initialize plans on store creation
useSubscription.getState().initializePlans();

// Auto-check subscription expiry on app load
if (typeof window !== 'undefined') {
  const checkExpiry = () => {
    const { useAuth } = require('./useAuth');
    const authStore = useAuth.getState();
    const currentUser = authStore.user;
    
    if (currentUser) {
      useSubscription.getState().checkSubscriptionExpiry(currentUser.id);
    }
  };

  // Check on load
  setTimeout(checkExpiry, 1000);
  
  // Check every hour
  setInterval(checkExpiry, 60 * 60 * 1000);
}
