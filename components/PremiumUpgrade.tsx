'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Truck, 
  Star, 
  Zap,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { toast } from 'react-hot-toast';

interface PremiumPlan {
  duration: '3months' | '6months' | '1year';
  price: number;
  originalPrice?: number;
  popular?: boolean;
  savings?: string;
}

const premiumPlans: PremiumPlan[] = [
  {
    duration: '3months',
    price: 1500,
    originalPrice: 1800,
    savings: 'Save ₹300'
  },
  {
    duration: '6months',
    price: 2500,
    originalPrice: 3600,
    popular: true,
    savings: 'Save ₹1100'
  },
  {
    duration: '1year',
    price: 4000,
    originalPrice: 7200,
    savings: 'Save ₹3200'
  }
];

export default function PremiumUpgrade() {
  const { user, upgradeToPremium } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'3months' | '6months' | '1year'>('6months');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const result = await upgradeToPremium(selectedPlan);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!user) return null;

  const driverBenefits = [
    { icon: Truck, text: 'Add up to 3 trucks per account' },
    { icon: TrendingUp, text: 'Higher visibility in job searches' },
    { icon: Star, text: 'Premium badge on profile' },
    { icon: Zap, text: 'Priority customer support' }
  ];

  const customerBenefits = [
    { icon: Star, text: 'Priority job posting visibility' },
    { icon: Users, text: 'Get suggestions from drivers first' },
    { icon: Crown, text: 'Premium badge on profile' },
    { icon: Zap, text: 'Priority customer support' }
  ];

  const benefits = user.type === 'driver' ? driverBenefits : customerBenefits;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
        </div>
        <p className="text-gray-300">
          {user.type === 'driver' 
            ? 'Manage multiple trucks and get more job opportunities'
            : 'Get priority visibility and faster responses from drivers'
          }
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg"
          >
            <benefit.icon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <span className="text-gray-300">{benefit.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {premiumPlans.map((plan) => (
          <motion.div
            key={plan.duration}
            whileHover={{ scale: 1.02 }}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPlan === plan.duration
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
            } ${plan.popular ? 'ring-2 ring-yellow-500/50' : ''}`}
            onClick={() => setSelectedPlan(plan.duration)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2 capitalize">
                {plan.duration.replace('months', ' Months').replace('year', ' Year')}
              </h3>
              
              <div className="mb-3">
                <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                {plan.originalPrice && (
                  <div className="text-sm text-gray-400">
                    <span className="line-through">₹{plan.originalPrice}</span>
                    <span className="text-green-400 ml-2">{plan.savings}</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-400 mb-4">
                ₹{Math.round(plan.price / (plan.duration === '1year' ? 12 : parseInt(plan.duration)))} per month
              </div>

              {selectedPlan === plan.duration && (
                <Check className="h-6 w-6 text-yellow-500 mx-auto" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current Balance */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Current Wallet Balance:</span>
          <span className="text-xl font-semibold text-white">₹{user.wallet.balance}</span>
        </div>
        {user.wallet.balance < premiumPlans.find(p => p.duration === selectedPlan)!.price && (
          <p className="text-red-400 text-sm mt-2">
            Insufficient balance. Please add funds to your wallet first.
          </p>
        )}
      </div>

      {/* Upgrade Button */}
      <button
        onClick={handleUpgrade}
        disabled={isUpgrading || user.wallet.balance < premiumPlans.find(p => p.duration === selectedPlan)!.price}
        className="w-full py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 text-black font-semibold rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isUpgrading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
            Upgrading...
          </>
        ) : (
          <>
            <Crown className="h-5 w-5" />
            Upgrade to Premium - ₹{premiumPlans.find(p => p.duration === selectedPlan)!.price}
          </>
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-gray-400 text-center mt-4">
        Premium benefits activate immediately after payment. 
        {user.type === 'driver' && ' You can add trucks right after upgrading.'}
      </p>
    </div>
  );
}
