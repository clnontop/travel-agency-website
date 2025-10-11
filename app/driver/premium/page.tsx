'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Star, 
  Check, 
  ArrowRight, 
  Shield, 
  TrendingUp,
  Users,
  Award,
  Zap,
  CreditCard,
  Calendar,
  Gift
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { usePremium } from '@/store/usePremium';
import { useDrivers } from '@/store/useDrivers';
import { formatINR } from '@/utils/currency';
import PremiumBadge from '@/components/PremiumBadge';
import PremiumSubscriptionModal from '@/components/PremiumSubscriptionModal';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DriverPremiumPage() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { plans, getSubscription, isUserPremium } = usePremium();
  const { getDriver, checkPremiumStatus } = useDrivers();
  const router = useRouter();

  useEffect(() => {
    // Ensure client-side hydration is complete
    setIsLoading(false);
  }, []);

  // Prevent hydration mismatch
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>;
  }

  // Debug user state
  console.log('🔍 Premium page - User state:', { 
    user: user ? { id: user.id, name: user.name, type: user.type, email: user.email } : null,
    hasUser: !!user,
    userType: user?.type
  });

  // Redirect to login if not authenticated or not a driver (use effect to avoid render-time routing)
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user && user.type !== 'driver') {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  if (!user || user.type !== 'driver') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  console.log('✅ Driver user authenticated, loading premium page');

  let driver, userSubscription, isPremium;
  
  try {
    driver = getDriver(user.id);
    userSubscription = getSubscription(user.id);
    isPremium = isUserPremium(user.id);
  } catch (error) {
    console.error('Error loading premium data:', error);
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600">Error loading premium data. Please refresh the page.</p>
      </div>
    </div>;
  }

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Priorit Listing',
      description: '',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Verified Premium Badge',
      description: 'Stand out with a premium verification tag on your profile',
      color: 'purple'
    },
    {
      icon: Users,
      title: '24/7 Esistances',
      description: '',
      color: 'yellow'
    },
    {
      icon: Zap,
      title: 'RSA incse of an Emergency',
      description: 'Incase of an Emergency such as an breakdown , accident we will help them to get assistance form the Government or Private Inctitutions',
      color: 'green'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Premium Driver Program
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get verified, gain priority placement, and earn more with our premium driver program
          </p>
        </motion.div>

        {/* Current Status */}
        {isPremium && userSubscription ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 text-white mb-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Crown className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">You're Premium!</h2>
                </div>
                <p className="text-lg opacity-90 mb-4">
                  Your premium subscription is active and working
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="opacity-80">Plan:</span>
                    <span className="ml-2 font-semibold">{plans.find(p => p.id === userSubscription.plan)?.name}</span>
                  </div>
                  <div>
                    <span className="opacity-80">Expires:</span>
                    <span className="ml-2 font-semibold">{new Date(userSubscription.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <PremiumBadge size="lg" variant="full" />
              </div>
            </div>
          </motion.div>
        ) : (
          /* Upgrade CTA */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-12"
          >
            <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-3xl font-bold mb-4">Ready to Go Premium?</h2>
            <p className="text-xl opacity-90 mb-6">
              Join thousands of verified drivers earning more with priority placement
            </p>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors space-x-2"
            >
              <Crown className="w-6 h-6" />
              <span>Upgrade Now</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {/* Benefits Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Why Choose Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-gray-900"
              >
                <div className={`w-12 h-12 bg-${benefit.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <benefit.icon className={`w-6 h-6 text-${benefit.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl p-8 shadow-lg border-2 ${
                  plan.popular 
                    ? 'border-yellow-400 transform scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{formatINR(plan.price)}</span>
                  </div>
                  <div className="text-gray-600">
                    {formatINR(Math.round(plan.price / plan.duration))}/month
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  disabled={isPremium}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                      : isPremium
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isPremium ? 'Already Premium' : 'Choose Plan'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-gray-900"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3x More Job Offers</h3>
              <p className="text-gray-600">
                Premium drivers receive 3 times more job applications compared to regular drivers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Higher Ratings</h3>
              <p className="text-gray-600">
                Premium drivers maintain 15% higher average ratings due to quality assurance
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Premium Subscription Modal */}
      <PremiumSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        driverId={user.id}
        driverName={user.name}
      />
    </div>
  );
}
