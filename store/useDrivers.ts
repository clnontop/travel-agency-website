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

// Mock drivers data for demonstration
const mockDrivers: Driver[] = [
  {
    id: 'rahul-sharma',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    avatar: '/avatars/rahul.jpg',
    bio: 'Experienced driver with 5+ years in Indian logistics and transportation.',
    location: 'Delhi, India',
    vehicleType: 'Heavy Truck',
    licenseNumber: 'DL-0420198765',
    rating: 4.8,
    completedJobs: 156,
    totalEarnings: 245000,
    memberSince: '2019',
    isAvailable: true,
    isOnline: true,
    lastSeen: new Date(),
    isPremium: false,
    vehicleDetails: {
      make: 'Tata',
      model: 'LPT 1618',
      year: 2020,
      plateNumber: 'DL-01-AB-1234',
      capacity: '16 tons'
    }
  },
  {
    id: 'priya-patel',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 87654 32109',
    avatar: '/avatars/priya.jpg',
    bio: 'Reliable driver specializing in city deliveries and express transport.',
    location: 'Mumbai, India',
    vehicleType: 'Medium Truck',
    licenseNumber: 'MH-0312087654',
    rating: 4.9,
    completedJobs: 203,
    totalEarnings: 189000,
    memberSince: '2020',
    isAvailable: true,
    isOnline: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isPremium: false,
    vehicleDetails: {
      make: 'Ashok Leyland',
      model: 'Dost+',
      year: 2021,
      plateNumber: 'MH-02-CD-5678',
      capacity: '8 tons'
    }
  },
  {
    id: 'amit-singh',
    name: 'Amit Singh',
    email: 'amit.singh@example.com',
    phone: '+91 76543 21098',
    avatar: '/avatars/amit.jpg',
    bio: 'Long-haul specialist with expertise in interstate transportation.',
    location: 'Bangalore, India',
    vehicleType: 'Heavy Truck',
    licenseNumber: 'KA-0598765432',
    rating: 4.7,
    completedJobs: 89,
    totalEarnings: 167000,
    memberSince: '2021',
    isAvailable: false,
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isPremium: false,
    vehicleDetails: {
      make: 'Mahindra',
      model: 'Blazo X 35',
      year: 2022,
      plateNumber: 'KA-03-EF-9012',
      capacity: '25 tons'
    }
  },
  {
    id: 'sunita-yadav',
    name: 'Sunita Yadav',
    email: 'sunita.yadav@example.com',
    phone: '+91 65432 10987',
    avatar: '/avatars/sunita.jpg',
    bio: 'Experienced female driver promoting women in transportation sector.',
    location: 'Pune, India',
    vehicleType: 'Light Truck',
    licenseNumber: 'MH-1234567890',
    rating: 4.9,
    completedJobs: 134,
    totalEarnings: 98000,
    memberSince: '2020',
    isAvailable: true,
    isOnline: true,
    lastSeen: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    isPremium: false,
    vehicleDetails: {
      make: 'Tata',
      model: 'Ace Gold',
      year: 2021,
      plateNumber: 'MH-12-GH-3456',
      capacity: '1 ton'
    }
  },
  {
    id: 'rajesh-kumar',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 54321 09876',
    avatar: '/avatars/rajesh.jpg',
    bio: 'Dedicated driver with focus on timely deliveries and customer satisfaction.',
    location: 'Chennai, India',
    vehicleType: 'Medium Truck',
    licenseNumber: 'TN-0987654321',
    rating: 4.6,
    completedJobs: 78,
    totalEarnings: 123000,
    memberSince: '2019',
    isAvailable: true,
    isOnline: true,
    lastSeen: new Date(),
    isPremium: true,
    premiumSubscription: {
      plan: 'premium_1y',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2025, 0, 1),
      isActive: true,
      paymentId: 'pay_rahul_2024'
    },
    vehicleDetails: {
      make: 'Eicher',
      model: 'Pro 2049',
      year: 2022,
      plateNumber: 'TN-09-IJ-7890',
      capacity: '4.9 tons'
    }
  },
  {
    id: 'deepak-gupta',
    name: 'Deepak Gupta',
    email: 'deepak.gupta@example.com',
    phone: '+91 43210 98765',
    avatar: '/avatars/deepak.jpg',
    bio: 'Tech-savvy driver with modern fleet management and GPS tracking expertise.',
    location: 'Hyderabad, India',
    vehicleType: 'Heavy Truck',
    licenseNumber: 'TS-1357924680',
    rating: 4.8,
    completedJobs: 112,
    totalEarnings: 201000,
    memberSince: '2023',
    isAvailable: true,
    isOnline: true,
    lastSeen: new Date(),
    isPremium: false,
    vehicleDetails: {
      make: 'Volvo',
      model: 'FMX 440',
      year: 2023,
      plateNumber: 'TS-07-KL-1234',
      capacity: '31 tons'
    }
  }
];

export const useDrivers = create<DriversState>()(
  persist(
    (set, get) => ({
      drivers: mockDrivers,

      addDriver: (driverData) => {
        const newDriver: Driver = {
          id: `driver-${Date.now()}`,
          ...driverData,
          completedJobs: 0,
          totalEarnings: 0,
          rating: 0,
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
        return get().drivers.filter(driver => driver.isAvailable);
      },

      getOnlineDrivers: () => {
        return get().drivers.filter(driver => driver.isOnline);
      },

      setDriverAvailability: (driverId, isAvailable) => {
        set(state => ({
          drivers: state.drivers.map(driver =>
            driver.id === driverId 
              ? { ...driver, isAvailable, lastSeen: new Date() }
              : driver
          )
        }));
      },

      setDriverOnlineStatus: (driverId, isOnline) => {
        set(state => ({
          drivers: state.drivers.map(driver =>
            driver.id === driverId 
              ? { ...driver, isOnline, lastSeen: new Date() }
              : driver
          )
        }));
      },

      updateDriverRating: (driverId, newRating) => {
        set(state => ({
          drivers: state.drivers.map(driver =>
            driver.id === driverId 
              ? { ...driver, rating: newRating }
              : driver
          )
        }));
      },

      incrementCompletedJobs: (driverId) => {
        set(state => ({
          drivers: state.drivers.map(driver =>
            driver.id === driverId 
              ? { ...driver, completedJobs: driver.completedJobs + 1 }
              : driver
          )
        }));
      },

      addEarnings: (driverId, amount) => {
        set(state => ({
          drivers: state.drivers.map(driver =>
            driver.id === driverId 
              ? { ...driver, totalEarnings: driver.totalEarnings + amount }
              : driver
          )
        }));
      },

      getPremiumDrivers: () => {
        return get().drivers.filter(driver => driver.isPremium && driver.premiumSubscription?.isActive);
      },

      getDriversByRoute: (route) => {
        const allDrivers = get().drivers.filter(driver => driver.isAvailable);
        // Sort premium drivers first, then by rating
        return allDrivers.sort((a, b) => {
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          return b.rating - a.rating;
        });
      },

      upgradeToPremium: (driverId, plan, paymentId) => {
        const now = new Date();
        const duration = plan === 'premium_3m' ? 3 : plan === 'premium_6m' ? 6 : 12;
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + duration);

        set(state => ({
          drivers: state.drivers.map(driver =>
            driver.id === driverId 
              ? { 
                  ...driver, 
                  isPremium: true,
                  premiumSubscription: {
                    plan,
                    startDate: now,
                    endDate,
                    isActive: true,
                    paymentId
                  }
                }
              : driver
          )
        }));
      },

      checkPremiumStatus: (driverId) => {
        const driver = get().drivers.find(d => d.id === driverId);
        if (!driver || !driver.isPremium || !driver.premiumSubscription) return false;
        
        const now = new Date();
        const isExpired = now > driver.premiumSubscription.endDate;
        
        if (isExpired && driver.premiumSubscription.isActive) {
          // Auto-expire the subscription
          set(state => ({
            drivers: state.drivers.map(d =>
              d.id === driverId 
                ? { 
                    ...d, 
                    isPremium: false,
                    premiumSubscription: {
                      ...d.premiumSubscription!,
                      isActive: false
                    }
                  }
                : d
            )
          }));
          return false;
        }
        
        return driver.premiumSubscription.isActive;
      }
    }),
    {
      name: 'drivers-storage',
      partialize: (state) => ({
        drivers: state.drivers
      })
    }
  )
);
