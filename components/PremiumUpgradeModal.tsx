'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Star, 
  Shield, 
  Zap, 
  X, 
  Check, 
  CreditCard,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import toast from 'react-hot-toast';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumUpgradeModal({ isOpen, onClose }: PremiumUpgradeModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user, upgradeToPremium } = useAuth();

  const premiumFeatures = [
    {
      icon: Crown,
      title: 'Premium Badge',
      description: 'Beautiful checkmark and premium badge next to your name',
      color: 'text-yellow-500'
    },
    {
      icon: TrendingUp,
      title: 'Priority Listings',
      description: 'Your jobs appear at the top of search results',
      color: 'text-green-500'
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Get notified immediately when drivers apply',
      color: 'text-blue-500'
    },
    {
      icon: Shield,
      title: 'Verified Status',
      description: 'Trusted premium member verification',
      color: 'text-purple-500'
    },
    {
      icon: MessageSquare,
      title: 'Priority Support',
      description: '24/7 premium customer support',
      color: 'text-red-500'
    },
    {
      icon: Clock,
      title: 'Extended Features',
      description: 'Access to advanced booking and scheduling tools',
      color: 'text-indigo-500'
    }
  ];

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    
    try {
      const result = await upgradeToPremium();
      
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6 rounded-t-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4"
                >
                  <Crown className="h-8 w-8 text-white" />
                </motion.div>
                
                <h2 className="text-3xl font-bold text-white mb-2">
                  Upgrade to Premium
                </h2>
                <p className="text-white/90">
                  Unlock exclusive features and get priority access
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl mb-4">
                  <Sparkles className="h-5 w-5 mr-2" />
                  <span className="text-2xl font-bold">₹999</span>
                  <span className="text-sm ml-2 opacity-90">one-time</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Lifetime premium access • No recurring fees
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className={`flex-shrink-0 ${feature.color}`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Current Balance */}
              {user && (
                <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Current Wallet Balance:</span>
                    <span className="text-white font-semibold">
                      ₹{user.wallet.balance.toFixed(2)}
                    </span>
                  </div>
                  {user.wallet.balance < 999 && (
                    <p className="text-red-400 text-sm mt-2">
                      Insufficient balance. Please add ₹{(999 - user.wallet.balance).toFixed(2)} to upgrade.
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Maybe Later
                </button>
                
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading || !user || user.wallet.balance < 999 || user.isPremium}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isUpgrading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Upgrading...</span>
                    </>
                  ) : user?.isPremium ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Already Premium</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Upgrade Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Premium Preview */}
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-lg border border-yellow-400/20">
                <h4 className="text-white font-semibold mb-2 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                  Preview: How your name will look
                </h4>
                <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{user?.name}</span>
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    <Crown className="w-3 h-3" />
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
