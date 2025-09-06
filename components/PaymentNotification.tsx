'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, DollarSign, X } from 'lucide-react';
import { formatINR } from '@/utils/currency';

interface PaymentNotification {
  id: string;
  type: 'payment_received' | 'payment_sent';
  driverId?: string;
  amount: number;
  from: string;
  timestamp: number;
}

export default function PaymentNotification() {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'payment-broadcast' && e.newValue) {
        const paymentData = JSON.parse(e.newValue);
        const notification: PaymentNotification = {
          id: `notification-${Date.now()}`,
          ...paymentData
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 2)]); // Keep max 3 notifications
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-80 max-w-sm text-gray-900"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Payment Received
                  </h4>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      {formatINR(notification.amount)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    From: {notification.from}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
