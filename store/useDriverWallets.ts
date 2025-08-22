import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DriverWallet {
  driverId: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: string;
}

interface DriverTransaction {
  id: string;
  driverId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  fromCustomerId?: string;
  fromCustomerName?: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

interface DriverWalletsState {
  driverWallets: Record<string, DriverWallet>;
  driverTransactions: DriverTransaction[];
  
  // Actions
  getDriverWallet: (driverId: string) => DriverWallet;
  addPaymentToDriver: (driverId: string, amount: number, description: string, fromCustomerId: string, fromCustomerName: string) => void;
  getDriverTransactions: (driverId: string) => DriverTransaction[];
  withdrawFromDriver: (driverId: string, amount: number) => boolean;
}

export const useDriverWallets = create<DriverWalletsState>()(
  persist(
    (set, get) => ({
      driverWallets: {},
      driverTransactions: [],

      getDriverWallet: (driverId: string) => {
        const wallets = get().driverWallets;
        if (!wallets[driverId]) {
          // Create default wallet for new driver
          const defaultWallet: DriverWallet = {
            driverId,
            balance: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            currency: 'INR'
          };
          
          set(state => ({
            driverWallets: {
              ...state.driverWallets,
              [driverId]: defaultWallet
            }
          }));
          
          return defaultWallet;
        }
        return wallets[driverId];
      },

      addPaymentToDriver: (driverId: string, amount: number, description: string, fromCustomerId: string, fromCustomerName: string) => {
        const currentWallet = get().getDriverWallet(driverId);
        
        // Update driver wallet
        const updatedWallet: DriverWallet = {
          ...currentWallet,
          balance: currentWallet.balance + amount,
          totalEarned: currentWallet.totalEarned + amount
        };
        
        // Create transaction record
        const transaction: DriverTransaction = {
          id: `driver_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          driverId,
          type: 'credit',
          amount,
          description,
          fromCustomerId,
          fromCustomerName,
          timestamp: new Date(),
          status: 'completed',
          category: 'payment_received'
        };
        
        set(state => ({
          driverWallets: {
            ...state.driverWallets,
            [driverId]: updatedWallet
          },
          driverTransactions: [transaction, ...state.driverTransactions]
        }));
        
        console.log('Payment added to driver wallet:', {
          driverId,
          amount,
          newBalance: updatedWallet.balance,
          fromCustomer: fromCustomerName
        });
      },

      getDriverTransactions: (driverId: string) => {
        return get().driverTransactions.filter(t => t.driverId === driverId);
      },

      withdrawFromDriver: (driverId: string, amount: number) => {
        const currentWallet = get().getDriverWallet(driverId);
        
        if (currentWallet.balance < amount) {
          return false;
        }
        
        const updatedWallet: DriverWallet = {
          ...currentWallet,
          balance: currentWallet.balance - amount,
          totalWithdrawn: currentWallet.totalWithdrawn + amount
        };
        
        const transaction: DriverTransaction = {
          id: `driver_withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          driverId,
          type: 'debit',
          amount,
          description: 'Withdrawal from driver wallet',
          timestamp: new Date(),
          status: 'completed',
          category: 'withdrawal'
        };
        
        set(state => ({
          driverWallets: {
            ...state.driverWallets,
            [driverId]: updatedWallet
          },
          driverTransactions: [transaction, ...state.driverTransactions]
        }));
        
        return true;
      }
    }),
    {
      name: 'driver-wallets-storage',
      partialize: (state) => ({
        driverWallets: state.driverWallets,
        driverTransactions: state.driverTransactions
      })
    }
  )
);
