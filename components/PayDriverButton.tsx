'use client';

import { useState } from 'react';
import { CreditCard, Wallet } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import PaymentModal from './PaymentModal';

interface PayDriverButtonProps {
  driverId: string;
  driverName: string;
  amount?: number;
  description?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function PayDriverButton({
  driverId,
  driverName,
  amount,
  description = 'Service payment',
  className = '',
  variant = 'primary',
  size = 'md'
}: PayDriverButtonProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();

  // Don't show the button if user is not a customer or not authenticated
  if (!user || user.type !== 'customer') {
    return null;
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm space-x-1',
    md: 'px-4 py-2.5 text-sm space-x-2',
    lg: 'px-6 py-3 text-base space-x-2'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <>
      <button
        onClick={() => setShowPaymentModal(true)}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        <CreditCard className={iconSizes[size]} />
        <span>Pay Driver</span>
        {amount && (
          <span className="ml-1 font-semibold">
            ₹{amount}
          </span>
        )}
      </button>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        driverId={driverId}
        driverName={driverName}
        defaultAmount={amount}
        description={description}
      />
    </>
  );
}
