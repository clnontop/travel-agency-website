'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Crown, Calendar } from 'lucide-react';
import { useSubscription } from '@/store/useSubscription';
import { useAuth } from '@/store/useAuth';

const SubscriptionExpiryNotification: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'warning' | 'expired'>('warning');
  const { userSubscription, getActivePlan } = useSubscription();
  const { user } = useAuth();

  useEffect(() => {
    // Check for subscription expiry notifications
    const checkExpiryNotifications = () => {
      if (!userSubscription || !user?.isPremium) return;

      const now = new Date();
      const expiryDate = new Date(userSubscription.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Show warning 7 days before expiry
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        setNotificationType('warning');
        setShowNotification(true);
      }

      // Check for expired notification from localStorage
      const expiredNotification = localStorage.getItem('subscription-expired');
      if (expiredNotification) {
        const expiredData = JSON.parse(expiredNotification);
        // Show notification if it's recent (within 24 hours)
        if (Date.now() - expiredData.timestamp < 24 * 60 * 60 * 1000) {
          setNotificationType('expired');
          setShowNotification(true);
        }
        localStorage.removeItem('subscription-expired');
      }
    };

    // Listen for subscription expired events
    const handleSubscriptionExpired = (event: CustomEvent) => {
      setNotificationType('expired');
      setShowNotification(true);
    };

    checkExpiryNotifications();
    window.addEventListener('subscription-expired', handleSubscriptionExpired as EventListener);

    // Check every hour
    const interval = setInterval(checkExpiryNotifications, 60 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('subscription-expired', handleSubscriptionExpired as EventListener);
    };
  }, [userSubscription, user]);

  const handleClose = () => {
    setShowNotification(false);
  };

  const handleRenew = () => {
    // Redirect to subscription page
    window.location.href = '/subscription';
  };

  if (!showNotification) return null;

  const activePlan = getActivePlan();
  const daysUntilExpiry = userSubscription 
    ? Math.ceil((new Date(userSubscription.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`rounded-lg border backdrop-blur-sm shadow-lg p-4 ${
        notificationType === 'expired'
          ? 'bg-red-500/20 border-red-500/50 text-red-100'
          : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className={`mr-3 mt-0.5 ${
              notificationType === 'expired' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {notificationType === 'expired' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <Calendar className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {notificationType === 'expired' ? (
                  'Premium Subscription Expired'
                ) : (
                  'Premium Subscription Expiring Soon'
                )}
              </h4>
              
              <p className="text-sm opacity-90 mb-3">
                {notificationType === 'expired' ? (
                  'Your premium features have been disabled. Renew your subscription to restore access.'
                ) : (
                  `Your ${activePlan?.name} subscription expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Renew now to continue enjoying premium features.`
                )}
              </p>

              {notificationType === 'expired' && (
                <div className="text-xs opacity-75 mb-3">
                  <p>• Multiple truck management disabled</p>
                  <p>• Priority job visibility removed</p>
                  <p>• Advanced features locked</p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleRenew}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  {notificationType === 'expired' ? 'Renew Now' : 'Extend Subscription'}
                </button>
                
                <button
                  onClick={handleClose}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiryNotification;
