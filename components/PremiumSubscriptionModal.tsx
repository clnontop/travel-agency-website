'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Crown, 
  Star, 
  Check, 
  CreditCard, 
  Shield,
  Zap,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';
import { usePremium } from '@/store/usePremium';
import { useDrivers } from '@/store/useDrivers';
import { formatINR } from '@/utils/currency';
import toast from 'react-hot-toast';

interface PremiumSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  driverName: string;
}

export default function PremiumSubscriptionModal({
  isOpen,
  onClose,
  driverId,
  driverName
}: PremiumSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('premium_6m');
  const [isProcessing, setIsProcessing] = useState(false);
  const { plans, createSubscription } = usePremium();
  const { upgradeToPremium } = useDrivers();

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentId = `pay_${Date.now()}_${driverId}`;
      
      // Create subscription
      const subscription = createSubscription(driverId, selectedPlan, paymentId);
      
      // Update driver status
      upgradeToPremium(driverId, selectedPlan as any, paymentId);
      
      toast.success(`🎉 ${driverName} is now a Premium Driver!`);
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-3 mb-4">
                <Crown className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
                  <p className="opacity-90">Get priority placement and verified status</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm opacity-90">
                <Shield className="w-4 h-4" />
                <span>Upgrading: {driverName}</span>
              </div>
            </div>

            <div className="p-6">
              {/* Benefits Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Benefits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Priority Search Placement</h4>
                      <p className="text-sm text-gray-600">Appear first in customer search results</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Verified Badge</h4>
                      <p className="text-sm text-gray-600">Premium verification tag on your profile</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <Zap className="w-6 h-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Enhanced Visibility</h4>
                      <p className="text-sm text-gray-600">Stand out with premium highlighting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Priority Support</h4>
                      <p className="text-sm text-gray-600">Get faster customer service response</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Plans */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose Your Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                            MOST POPULAR
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{plan.name}</h4>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-gray-900">{formatINR(plan.price)}</span>
                          <span className="text-gray-600">/{plan.duration}m</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatINR(Math.round(plan.price / plan.duration))}/month
                        </div>
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li className="text-sm text-gray-500">
                            +{plan.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                      
                      {selectedPlan === plan.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4"
                        >
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Selected Plan Summary */}
              {selectedPlanData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">Selected Plan Summary</h4>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">{selectedPlanData.name}</span>
                    <span className="font-bold text-xl">{formatINR(selectedPlanData.price)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Duration: {selectedPlanData.duration} months • 
                    Monthly cost: {formatINR(Math.round(selectedPlanData.price / selectedPlanData.duration))}
                  </div>
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2">Included Features:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedPlanData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Subscribe Now - {formatINR(selectedPlanData?.price || 0)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
