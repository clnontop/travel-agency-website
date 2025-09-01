export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'driver' | 'customer';
  avatar?: string;
  wallet: Wallet;
  rating: number;
  completedJobs: number;
  createdAt: Date;
  premiumSubscription?: PremiumSubscription;
}

export interface PremiumSubscription {
  id: string;
  userId: string;
  plan: 'premium_3m' | 'premium_6m' | 'premium_1y';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  paymentId: string;
  autoRenew: boolean;
}

export interface PremiumPlan {
  id: string;
  name: string;
  duration: number; // in months
  price: number; // in INR
  features: string[];
  popular?: boolean;
}

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface Job {
  id: string;
  title: string;
  description: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  cargo: Cargo;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  customer: User;
  driver?: User;
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  bids: Bid[];
  createdAt: Date;
  deadline: Date;
  distance: number;
  estimatedDuration: number;
}

export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Cargo {
  type: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  specialRequirements: string[];
  isFragile: boolean;
  isHazardous: boolean;
}

export interface Bid {
  id: string;
  jobId: string;
  driver: User;
  amount: number;
  estimatedDuration: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Tracking {
  jobId: string;
  currentLocation: Location;
  status: 'pickup' | 'in-transit' | 'delivered';
  estimatedArrival: Date;
  lastUpdated: Date;
  route: Location[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  userId: string;
  subscriptionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}