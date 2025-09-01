'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  driverName: string;
  defaultAmount?: number;
  description?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  driverId,
  driverName,
  defaultAmount = 0,
  description = 'Service payment'
}: PaymentModalProps) {
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [paymentDescription, setPaymentDescription] = useState(description);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, payDriver } = useAuth();

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!user || user.wallet.balance < paymentAmount) {
      toast.error('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = await payDriver(driverId, paymentAmount, paymentDescription);
      
      if (result.success) {
        toast.success(result.message);
        onClose();
        setAmount('');
        setPaymentDescription(description);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">Pay Driver</h3>
                  <p className="text-blue-100 text-sm">Send payment to {driverName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Wallet Balance */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-600">Available Balance</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {formatINR(user?.wallet.balance || 0)}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="flex space-x-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="flex-1 py-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ₹{quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Payment description"
                />
              </div>

              {/* Payment Summary */}
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment Amount</span>
                    <span className="font-medium">{formatINR(parseFloat(amount))}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining Balance</span>
                    <span className="font-medium">
                      {formatINR((user?.wallet.balance || 0) - parseFloat(amount))}
                    </span>
                  </div>
                </div>
              )}

              {/* Warning for insufficient balance */}
              {amount && parseFloat(amount) > (user?.wallet.balance || 0) && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Insufficient balance for this payment</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={
                    isProcessing || 
                    !amount || 
                    parseFloat(amount) <= 0 || 
                    parseFloat(amount) > (user?.wallet.balance || 0)
                  }
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Now</span>
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
