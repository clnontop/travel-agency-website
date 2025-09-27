export interface User {
  id: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  name?: string; // For compatibility with existing code
  phone: string;
  aadhaarNumber: string;
  aadhaarEmail: string; // Email from Aadhaar card
  type?: string; // user type (customer, driver, admin)
  isEmailVerified: boolean;
  isAadhaarVerified: boolean;
  isBanned?: boolean; // For admin user management
  isActive?: boolean; // For login status
  currentLocation?: string; // For driver location tracking
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  profilePicture?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface EmailVerification {
  id: string;
  userId: string;
  email: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

export interface AadhaarVerification {
  id: string;
  userId: string;
  aadhaarNumber: string;
  aadhaarEmail: string;
  otp?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  aadhaarNumber?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  aadhaarNumber: string;
  aadhaarEmail: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
  token?: string;
  requiresEmailVerification?: boolean;
  requiresAadhaarVerification?: boolean;
}
