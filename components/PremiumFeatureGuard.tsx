'use client';

import React from 'react';
import { Crown, Lock, Star } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useSubscription } from '@/store/useSubscription';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({
  children,
  feature,
  fallback,
  showUpgrade = true
}) => {
  const { user } = useAuth();
  const { isPremiumFeatureAvailable, userSubscription } = useSubscription();

  // Check if user has premium access
  const hasPremiumAccess = user?.isPremium && userSubscription?.isActive;
  
  // Check specific feature if provided
  const hasFeatureAccess = feature ? isPremiumFeatureAvailable(feature) : hasPremiumAccess;

  if (hasFeatureAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
      <p className="text-gray-400 mb-4">
        {feature 
          ? `This feature requires a premium subscription with ${feature} access.`
          : 'This feature is only available to premium subscribers.'
        }
      </p>
      
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => window.location.href = '/subscription'}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"
        >
          <Star className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
};

export default PremiumFeatureGuard;
