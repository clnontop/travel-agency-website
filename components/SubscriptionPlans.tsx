'use client';

import React, { useState, useEffect } from 'react';
import { useSubscription, SubscriptionPlan } from '@/store/useSubscription';
import { useAuth } from '@/store/useAuth';
import { Check, Crown, Star, Zap, Shield, Truck, BarChart3, Headphones } from 'lucide-react';

interface SubscriptionPlansProps {
  onClose?: () => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onClose }) => {
  const { plans, purchaseSubscription, userSubscription, getActivePlan } = useSubscription();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activePlan = getActivePlan();
  const hasActiveSubscription = userSubscription?.isActive;

  const handlePurchase = async (planId: string) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please login to purchase a subscription.' });
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(planId);

    try {
      const result = await purchaseSubscription(planId, user.id);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        // Show more detailed error feedback
        if (result.message.includes('Insufficient balance')) {
          setMessage({ type: 'error', text: result.message + ' Please add funds to your wallet.' });
        } else if (result.message.includes('User not authenticated')) {
          setMessage({ type: 'error', text: 'You must be logged in to purchase a subscription.' });
        } else {
          setMessage({ type: 'error', text: result.message || 'Failed to process subscription. Please try again.' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process subscription. Please try again.' });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const getFeatureIcon = (feature: string) => {
    const featureLower = feature.toLowerCase();
    if (featureLower.includes('priority')) return <Star className="w-4 h-4" />;
    if (featureLower.includes('analytics')) return <BarChart3 className="w-4 h-4" />;
    if (featureLower.includes('truck')) return <Truck className="w-4 h-4" />;
    if (featureLower.includes('support')) return <Headphones className="w-4 h-4" />;
    if (featureLower.includes('tracking')) return <Zap className="w-4 h-4" />;
    if (featureLower.includes('security') || featureLower.includes('api')) return <Shield className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  const getSavingsPercentage = (plan: any) => {
    const monthlyEquivalent = plan.price / (plan.duration === '3months' ? 3 : plan.duration === '6months' ? 6 : 12);
    const basePricePerMonth = 600; // Base price per month
    const savings = ((basePricePerMonth - monthlyEquivalent) / basePricePerMonth) * 100;
    return Math.round(savings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-yellow-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Premium Subscription Plans
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Unlock powerful features and take your trucking business to the next level with our premium plans
          </p>
          
          {hasActiveSubscription && activePlan && (
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <Crown className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 font-medium">
                Currently subscribed to {activePlan.name} 
                {userSubscription && ` (expires ${userSubscription.expiryDate.toLocaleDateString()})`}
              </span>
            </div>
          )}
        </div>

        {/* Current Balance */}
        {user && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg">
              <span className="text-gray-300 mr-2">Wallet Balance:</span>
              <span className="text-2xl font-bold text-green-400">₹{user.wallet.balance.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}>
            <p className="text-center font-medium">{message.text}</p>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const savings = getSavingsPercentage(plan);
            const isCurrentPlan = activePlan?.id === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-red-500/50 bg-gradient-to-b from-red-500/10 to-slate-800/50 shadow-xl shadow-red-500/20' 
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                } backdrop-blur-sm`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Crown className="w-4 h-4 mr-1" />
                      Active
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-4xl font-bold text-white">₹{plan.price.toLocaleString()}</span>
                      <span className="text-gray-400 ml-2">/{plan.duration}</span>
                    </div>
                    {savings > 0 && (
                      <div className="text-green-400 text-sm font-medium">
                        Save {savings}% compared to monthly
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature: any, index: any) => (
                      <div key={index} className="flex items-start">
                        <div className="text-green-400 mr-3 mt-0.5">
                          {getFeatureIcon(feature)}
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isProcessing || isCurrentPlan || !user}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                      isCurrentPlan
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/25'
                        : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                    } ${isProcessing && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : !user ? (
                      'Login Required'
                    ) : (
                      'Subscribe Now'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Why Go Premium?</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Priority Visibility</h4>
              <p className="text-gray-400 text-sm">Your jobs get seen first by drivers</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Multiple Trucks</h4>
              <p className="text-gray-400 text-sm">Manage up to 3 trucks per account</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h4>
              <p className="text-gray-400 text-sm">Detailed insights and reports</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Premium Support</h4>
              <p className="text-gray-400 text-sm">24/7 dedicated customer support</p>
            </div>
          </div>
        </div>

        {/* Wallet Funding Button */}
        {user && (
          <div className="text-center mb-8">
            <button
              onClick={() => {
                // Add ₹5000 to wallet for testing/demo
                user.wallet.balance += 5000;
                user.wallet.totalEarned += 5000;
                window.localStorage.setItem('users', JSON.stringify(new Map([[user.id, user]])));
                window.location.reload();
              }}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors mt-4"
            >
              Add ₹5000 to Wallet (Demo)
            </button>
          </div>
        )}
        
        {/* Close Button */}
        {onClose && (
          <div className="text-center mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
