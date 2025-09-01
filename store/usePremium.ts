import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PremiumPlan, PremiumSubscription } from '@/types';

interface PremiumState {
  plans: PremiumPlan[];
  subscriptions: PremiumSubscription[];
  
  // Actions
  getPlan: (planId: string) => PremiumPlan | undefined;
  getActivePlans: () => PremiumPlan[];
  createSubscription: (userId: string, planId: string, paymentId: string) => PremiumSubscription;
  getSubscription: (userId: string) => PremiumSubscription | undefined;
  isUserPremium: (userId: string) => boolean;
  renewSubscription: (subscriptionId: string, paymentId: string) => void;
  cancelSubscription: (subscriptionId: string) => void;
}

// Premium plans with Indian pricing
const premiumPlans: PremiumPlan[] = [
  {
    id: 'premium_3m',
    name: '3 Months Premium',
    duration: 3,
    price: 1500,
    features: [
      'Priority placement in search results',
      'Verified premium badge',
      'Enhanced profile visibility',
      'Priority customer support',
      'Advanced analytics dashboard'
    ]
  },
  {
    id: 'premium_6m',
    name: '6 Months Premium',
    duration: 6,
    price: 2500,
    features: [
      'Priority placement in search results',
      'Verified premium badge',
      'Enhanced profile visibility',
      'Priority customer support',
      'Advanced analytics dashboard',
      'Featured driver status',
      'Monthly performance reports'
    ],
    popular: true
  },
  {
    id: 'premium_1y',
    name: '1 Year Premium',
    duration: 12,
    price: 4000,
    features: [
      'Priority placement in search results',
      'Verified premium badge',
      'Enhanced profile visibility',
      'Priority customer support',
      'Advanced analytics dashboard',
      'Featured driver status',
      'Monthly performance reports',
      'Exclusive job opportunities',
      'Premium driver community access'
    ]
  }
];

export const usePremium = create<PremiumState>()(
  persist(
    (set, get) => ({
      plans: premiumPlans,
      subscriptions: [],

      getPlan: (planId) => {
        return get().plans.find(plan => plan.id === planId);
      },

      getActivePlans: () => {
        return get().plans;
      },

      createSubscription: (userId, planId, paymentId) => {
        const plan = get().getPlan(planId);
        if (!plan) throw new Error('Plan not found');

        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + plan.duration);

        const subscription: PremiumSubscription = {
          id: `sub_${Date.now()}_${userId}`,
          userId,
          plan: planId as 'premium_3m' | 'premium_6m' | 'premium_1y',
          startDate: now,
          endDate,
          isActive: true,
          paymentId,
          autoRenew: false
        };

        set(state => ({
          subscriptions: [...state.subscriptions.filter(s => s.userId !== userId), subscription]
        }));

        return subscription;
      },

      getSubscription: (userId) => {
        return get().subscriptions.find(sub => sub.userId === userId && sub.isActive);
      },

      isUserPremium: (userId) => {
        const subscription = get().getSubscription(userId);
        if (!subscription) return false;

        const now = new Date();
        const isExpired = now > subscription.endDate;

        if (isExpired) {
          // Auto-expire the subscription
          set(state => ({
            subscriptions: state.subscriptions.map(sub =>
              sub.userId === userId ? { ...sub, isActive: false } : sub
            )
          }));
          return false;
        }

        return subscription.isActive;
      },

      renewSubscription: (subscriptionId, paymentId) => {
        set(state => ({
          subscriptions: state.subscriptions.map(sub => {
            if (sub.id === subscriptionId) {
              const plan = get().getPlan(sub.plan);
              if (plan) {
                const newEndDate = new Date(sub.endDate);
                newEndDate.setMonth(newEndDate.getMonth() + plan.duration);
                return {
                  ...sub,
                  endDate: newEndDate,
                  paymentId,
                  isActive: true
                };
              }
            }
            return sub;
          })
        }));
      },

      cancelSubscription: (subscriptionId) => {
        set(state => ({
          subscriptions: state.subscriptions.map(sub =>
            sub.id === subscriptionId ? { ...sub, autoRenew: false } : sub
          )
        }));
      }
    }),
    {
      name: 'premium-storage',
      partialize: (state) => ({
        subscriptions: state.subscriptions
      })
    }
  )
);
