import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
  location: string;
  vehicleType: string;
  licenseNumber: string;
  rating: number;
  completedJobs: number;
  totalEarnings: number;
  memberSince: string;
  isAvailable: boolean;
  isOnline: boolean;
  lastSeen: Date;
  isPremium: boolean;
  premiumSubscription?: {
    plan: 'premium_3m' | 'premium_6m' | 'premium_1y';
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    paymentId: string;
  };
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    capacity: string;
  };
  documents?: {
    license: string;
    insurance: string;
    registration: string;
  };
  preferences?: {
    maxDistance: number;
    preferredRoutes: string[];
    workingHours: {
      start: string;
      end: string;
    };
  };
}

interface DriversState {
  drivers: Driver[];
  
  // Actions
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (driverId: string, updates: Partial<Driver>) => void;
  removeDriver: (driverId: string) => void;
  getDriver: (driverId: string) => Driver | undefined;
  getAvailableDrivers: () => Driver[];
  getOnlineDrivers: () => Driver[];
  getPremiumDrivers: () => Driver[];
  getDriversByRoute: (route: string) => Driver[];
  setDriverAvailability: (driverId: string, isAvailable: boolean) => void;
  setDriverOnlineStatus: (driverId: string, isOnline: boolean) => void;
  updateDriverRating: (driverId: string, newRating: number) => void;
  incrementCompletedJobs: (driverId: string) => void;
  addEarnings: (driverId: string, amount: number) => void;
  upgradeToPremium: (driverId: string, plan: 'premium_3m' | 'premium_6m' | 'premium_1y', paymentId: string) => void;
  checkPremiumStatus: (driverId: string) => boolean;
}

export const useDrivers = create<DriversState>()(
  persist(
    (set, get) => ({
      drivers: [], // No fake drivers - only real registered users

      addDriver: (driver) => {
        const newDriver: Driver = {
          ...driver,
          id: `driver_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          rating: 0,
          completedJobs: 0,
          totalEarnings: 0,
          memberSince: new Date().getFullYear().toString(),
          isAvailable: true,
          isOnline: true,
          lastSeen: new Date(),
          isPremium: false
        };

        set(state => ({
          drivers: [...state.drivers, newDriver]
        }));
      },

      updateDriver: (driverId, updates) => {
        set(state => ({
          drivers: state.drivers.map(driver =>
            driver.id === driverId ? { ...driver, ...updates } : driver
          )
        }));
      },

      removeDriver: (driverId) => {
        set(state => ({
          drivers: state.drivers.filter(driver => driver.id !== driverId)
        }));
      },

      getDriver: (driverId) => {
        return get().drivers.find(driver => driver.id === driverId);
      },

      getAvailableDrivers: () => {
        return get().drivers.filter(driver => driver.isAvailable && driver.isOnline);
      },

      getOnlineDrivers: () => {
        return get().drivers.filter(driver => driver.isOnline);
      },

      getPremiumDrivers: () => {
        return get().drivers.filter(driver => driver.isPremium);
      },

      getDriversByRoute: (route) => {
        // For now, return all available drivers
        // In a real app, this would filter by route/location
        return get().getAvailableDrivers();
      },

      setDriverAvailability: (driverId, isAvailable) => {
        get().updateDriver(driverId, { isAvailable });
      },

      setDriverOnlineStatus: (driverId, isOnline) => {
        get().updateDriver(driverId, { 
          isOnline, 
          lastSeen: new Date() 
        });
      },

      updateDriverRating: (driverId, newRating) => {
        get().updateDriver(driverId, { rating: newRating });
      },

      incrementCompletedJobs: (driverId) => {
        const driver = get().getDriver(driverId);
        if (driver) {
          get().updateDriver(driverId, { 
            completedJobs: driver.completedJobs + 1 
          });
        }
      },

      addEarnings: (driverId, amount) => {
        const driver = get().getDriver(driverId);
        if (driver) {
          get().updateDriver(driverId, { 
            totalEarnings: driver.totalEarnings + amount 
          });
        }
      },

      upgradeToPremium: (driverId, plan, paymentId) => {
        const now = new Date();
        const duration = plan === 'premium_3m' ? 3 : plan === 'premium_6m' ? 6 : 12;
        const endDate = new Date(now.getFullYear(), now.getMonth() + duration, now.getDate());

        get().updateDriver(driverId, {
          isPremium: true,
          premiumSubscription: {
            plan,
            startDate: now,
            endDate,
            isActive: true,
            paymentId
          }
        });
      },

      checkPremiumStatus: (driverId) => {
        const driver = get().getDriver(driverId);
        if (!driver || !driver.isPremium || !driver.premiumSubscription) {
          return false;
        }

        const now = new Date();
        const isExpired = now > driver.premiumSubscription.endDate;
        
        if (isExpired) {
          get().updateDriver(driverId, {
            isPremium: false,
            premiumSubscription: undefined
          });
          return false;
        }

        return true;
      }
    }),
    {
      name: 'drivers-storage',
      partialize: (state) => ({ drivers: state.drivers })
    }
  )
);
