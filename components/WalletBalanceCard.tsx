'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatINR } from '@/utils/currency';

interface WalletBalanceCardProps {
  balance: number;
  currency: string;
  totalSpent: number;
  totalEarned: number;
  className?: string;
}

interface BalanceAnimation {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  timestamp: number;
}

export default function WalletBalanceCard({
  balance,
  currency,
  totalSpent,
  totalEarned,
  className = ''
}: WalletBalanceCardProps) {
  const [previousBalance, setPreviousBalance] = useState(balance);
  const [balanceAnimations, setBalanceAnimations] = useState<BalanceAnimation[]>([]);
  const [showBalanceChange, setShowBalanceChange] = useState(false);

  // Detect balance changes and trigger animations
  useEffect(() => {
    if (balance !== previousBalance && previousBalance !== 0) {
      const difference = balance - previousBalance;
      const animationType = difference > 0 ? 'credit' : 'debit';
      
      // Add new animation
      const newAnimation: BalanceAnimation = {
        id: `${Date.now()}-${Math.random()}`,
        type: animationType,
        amount: Math.abs(difference),
        timestamp: Date.now()
      };
      
      setBalanceAnimations(prev => [...prev, newAnimation]);
      setShowBalanceChange(true);
      
      // Remove animation after 3 seconds
      setTimeout(() => {
        setBalanceAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id));
      }, 3000);
      
      // Hide balance change indicator after 2 seconds
      setTimeout(() => {
        setShowBalanceChange(false);
      }, 2000);
    }
    
    setPreviousBalance(balance);
  }, [balance, previousBalance]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl overflow-hidden"
        animate={showBalanceChange ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Wallet Balance</h3>
                <p className="text-blue-100 text-sm">Available funds</p>
              </div>
            </div>
            
            {/* Balance change indicator */}
            <AnimatePresence>
              {showBalanceChange && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1"
                >
                  {balance > previousBalance ? (
                    <TrendingUp className="w-4 h-4 text-green-300" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300" />
                  )}
                  <span className="text-sm font-medium">Updated</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Balance */}
          <div className="mb-6">
            <motion.div
              key={balance}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-4xl font-bold mb-2"
            >
              {formatINR(balance)}
            </motion.div>
            <p className="text-blue-100">Current balance in {currency}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowUpRight className="w-4 h-4 text-green-300" />
                <span className="text-sm text-blue-100">Total Earned</span>
              </div>
              <div className="text-xl font-semibold">{formatINR(totalEarned)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowDownLeft className="w-4 h-4 text-red-300" />
                <span className="text-sm text-blue-100">Total Spent</span>
              </div>
              <div className="text-xl font-semibold">{formatINR(totalSpent)}</div>
            </div>
          </div>
        </div>

        {/* Floating Animations */}
        <AnimatePresence>
          {balanceAnimations.map((animation) => (
            <motion.div
              key={animation.id}
              initial={{ 
                opacity: 1, 
                y: 0, 
                x: animation.type === 'debit' ? 0 : 0,
                scale: 1 
              }}
              animate={{ 
                opacity: 0, 
                y: animation.type === 'debit' ? 50 : -50,
                x: animation.type === 'debit' ? 50 : -50,
                scale: 0.8 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 ${
                animation.type === 'debit' ? 'text-red-300' : 'text-green-300'
              }`}
            >
              <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1 text-sm font-semibold">
                {animation.type === 'debit' ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <ArrowUpRight className="w-4 h-4" />
                )}
                <span>
                  {animation.type === 'debit' ? '-' : '+'}
                  {formatINR(animation.amount)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
