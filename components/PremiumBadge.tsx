'use client';

import { Crown, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'tag' | 'full';
  showText?: boolean;
  className?: string;
}

export default function PremiumBadge({ 
  size = 'md', 
  variant = 'badge', 
  showText = true,
  className = '' 
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'badge') {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`inline-flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full ${textSizeClasses[size]} font-medium ${className}`}
      >
        <Crown className={sizeClasses[size]} />
        {showText && <span>Premium</span>}
      </motion.div>
    );
  }

  if (variant === 'tag') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-lg ${textSizeClasses[size]} font-semibold shadow-lg ${className}`}
      >
        <Shield className={sizeClasses[size]} />
        {showText && <span>Verified Premium</span>}
      </motion.div>
    );
  }

  if (variant === 'full') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-xl ${textSizeClasses[size]} font-bold shadow-xl ${className}`}
      >
        <div className="flex items-center space-x-1">
          <Crown className={sizeClasses[size]} />
          <Star className={`${sizeClasses[size]} fill-current`} />
        </div>
        {showText && (
          <div className="flex flex-col items-center">
            <span>PREMIUM</span>
            <span className="text-xs opacity-90">VERIFIED</span>
          </div>
        )}
      </motion.div>
    );
  }

  return null;
}

// Premium status indicator for driver cards
export function PremiumStatusIndicator({ isPremium, className = '' }: { isPremium: boolean; className?: string }) {
  if (!isPremium) return null;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`absolute -top-2 -right-2 ${className}`}
    >
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <Crown className="w-4 h-4 text-white" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-30"
        />
      </div>
    </motion.div>
  );
}

// Premium priority indicator for search results
export function PremiumPriorityTag({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-md text-xs font-semibold ${className}`}
    >
      <Star className="w-3 h-3 fill-current" />
      <span>TOP PRIORITY</span>
    </motion.div>
  );
}
