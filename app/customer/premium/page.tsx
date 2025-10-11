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
  Gift,
  User,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CustomerPremiumPage() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    </div>;
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (user.type !== 'customer') {
    router.push('/auth/login');
    return null;
  }

  const plans = [
    {
      id: 'basic',
      name: 'Basic Premium',
      price: 999,
      duration: 1,
      popular: false,
      features: [
        'Priority customer support',
        'Advanced job tracking',
        'Premium driver access',
        'Extended job history',
        'Basic analytics'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Premium',
      price: 2499,
      duration: 3,
      popular: true,
      features: [
        'All Basic features',
        'Priority job placement',
        'Dedicated account manager',
        'Advanced analytics dashboard',
        'Custom delivery preferences',
        'Bulk job posting',
        'API access'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 4999,
      duration: 6,
      popular: false,
      features: [
        'All Pro features',
        'White-label solutions',
        'Custom integrations',
        'Advanced reporting',
        'Priority driver network',
        'SLA guarantees',
        '24/7 phone support'
      ]
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Priority Listing',
      description: '',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Premium Customer Badge',
      description: 'Stand out with a premium verification badge on your profile',
      color: 'purple'
    },
    {
      icon: Zap,
      title: '24/7 Esistances',
      description: '',
      color: 'yellow'
    },
    {
      icon: Users,
      title: 'Extra Easurance Money Incase of Thievery or Mishab',
      description: '',
      color: 'green'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Crown className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-white">Premium Membership</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/customer')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Premium Customer Program
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get priority access, enhanced features, and exclusive benefits for your shipping needs
          </p>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white text-center mb-12"
        >
          <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-3xl font-bold mb-4">Ready to Go Premium?</h2>
          <p className="text-xl opacity-90 mb-6">
            Join thousands of premium customers enjoying priority service and exclusive benefits
          </p>
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="inline-flex items-center px-8 py-4 bg-white text-red-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors space-x-2"
          >
            <Crown className="w-6 h-6" />
            <span>Upgrade Now</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Benefits Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Why Choose Premium?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className={`w-12 h-12 bg-${benefit.color}-500/20 rounded-lg flex items-center justify-center mb-4`}>
                  <benefit.icon className={`w-6 h-6 text-${benefit.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-gray-800 rounded-2xl p-8 border-2 ${
                  plan.popular 
                    ? 'border-yellow-400 transform scale-105' 
                    : 'border-gray-700'
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
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">{formatINR(plan.price)}</span>
                  </div>
                  <div className="text-gray-400">
                    {formatINR(Math.round(plan.price / plan.duration))}/month
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Choose Plan
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
        >
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">50% Faster Delivery</h3>
              <p className="text-gray-300">
                Premium customers get 50% faster delivery times with priority driver matching
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Support</h3>
              <p className="text-gray-300">
                Get dedicated support with 24/7 availability and priority response times
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Simple Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Premium Subscription</h3>
            <p className="text-gray-300 mb-6">
              Premium features are coming soon! We'll notify you when they're available.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success('We\'ll notify you when premium features are available!');
                  setShowSubscriptionModal(false);
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Notify Me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
