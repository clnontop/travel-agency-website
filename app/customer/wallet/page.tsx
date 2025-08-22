'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '../../../utils/currency';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Banknote,
  Download,
  Filter,
  Search,
  Plus,
  Minus,
  Clock,
  TrendingUp,
  Calendar,
  Wallet,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import WalletBalanceCard from '@/components/WalletBalanceCard';
import TestDataCreator from '@/components/TestDataCreator';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

export default function CustomerWallet() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const { user, updateWallet, addTransaction, transactions } = useAuth();
  const [currentWallet, setCurrentWallet] = useState(user?.wallet || { balance: 0, currency: 'INR', pending: 0, totalSpent: 0, totalEarned: 0 });
  
  // Track wallet changes and update local state
  useEffect(() => {
    if (user?.wallet) {
      setCurrentWallet(user.wallet);
      console.log('Wallet state updated:', user.wallet);
    }
  }, [user?.wallet]);
  
  const wallet = currentWallet;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Driver Payment': return <ArrowDownLeft className="h-4 w-4" />;
      case 'Add Funds': return <ArrowUpRight className="h-4 w-4" />;
      case 'Withdrawal': return <ArrowDownLeft className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const amt = parseFloat(amount);
      
      // Get current wallet state to ensure we have the latest values
      const latestWallet = user?.wallet || currentWallet;
      
      // Update wallet: balance and totalEarned with current values
      const newBalance = latestWallet.balance + amt;
      const newTotalEarned = (latestWallet.totalEarned || 0) + amt;
      
      console.log('Adding funds:', {
        currentBalance: latestWallet.balance,
        amountToAdd: amt,
        newBalance: newBalance
      });
      
      updateWallet({
        balance: newBalance,
        totalEarned: newTotalEarned
      });
      
      // Add transaction first
      addTransaction({
        id: `txn-${Date.now()}`,
        type: 'credit',
        amount: amt,
        description: 'Added funds via wallet',
        timestamp: new Date(),
        status: 'completed',
        category: 'Add Funds'
      });
      
      // Update local state immediately
      setCurrentWallet(prev => ({
        ...prev,
        balance: newBalance,
        totalEarned: newTotalEarned
      }));
      
      // Force component re-render to ensure balance updates are visible
      setRefreshKey(prev => prev + 1);
      
      // Show success message
      toast.success(`Successfully added ₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to your wallet! New balance: ₹${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      setShowAddFunds(false);
      setAmount('');
      
      // Log for debugging
      console.log('Wallet updated successfully:', {
        oldBalance: latestWallet.balance,
        newBalance: newBalance,
        amountAdded: amt,
        userWallet: user?.wallet
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds. Please try again.');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > wallet.balance) {
      toast.error('Insufficient funds in wallet');
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const amt = parseFloat(amount);
      
      // Get current wallet state to ensure we have the latest values
      const latestWallet = user?.wallet || currentWallet;
      
      // Update wallet: balance and totalSpent with current values
      const newBalance = latestWallet.balance - amt;
      const newTotalSpent = (latestWallet.totalSpent || 0) + amt;
      
      console.log('Withdrawing funds:', {
        currentBalance: latestWallet.balance,
        amountToWithdraw: amt,
        newBalance: newBalance
      });
      
      updateWallet({
        balance: newBalance,
        totalSpent: newTotalSpent
      });
      
      // Update local state immediately
      setCurrentWallet(prev => ({
        ...prev,
        balance: newBalance,
        totalSpent: newTotalSpent
      }));
      
      // Add transaction
      addTransaction({
        id: `txn-${Date.now()}`,
        type: 'debit',
        amount: amt,
        description: 'Withdrew funds from wallet',
        timestamp: new Date(),
        status: 'completed',
        category: 'Withdrawal'
      });
      toast.success(`Successfully withdrew ₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} from your wallet!`);
      setShowWithdraw(false);
      setAmount('');
    } catch (error) {
      toast.error('Failed to withdraw funds. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Wallet className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Customer Wallet</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Wallet</h1>
              <p className="text-gray-300">Manage your funds and payment history</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => router.push('/customer/pay')}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay Drivers</span>
              </button>
              <button 
                onClick={() => setShowAddFunds(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Funds</span>
              </button>
              <button 
                onClick={() => setShowWithdraw(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Minus className="h-4 w-4" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* Enhanced Wallet Balance Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WalletBalanceCard
                balance={wallet.balance}
                currency={wallet.currency}
                totalSpent={wallet.totalSpent}
                totalEarned={wallet.totalEarned}
                key={`wallet-${refreshKey}`}
              />
            </div>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Pending</h3>
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-white">{formatINR(wallet.pending)}</p>
                <p className="text-gray-300 text-sm">Awaiting clearance</p>
              </motion.div>
            </div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowAddFunds(true)}
                className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowUpRight className="h-6 w-6 text-red-500" />
                <div className="text-left">
                  <p className="font-medium text-white">Add Funds</p>
                  <p className="text-sm text-gray-300">Top up wallet</p>
                </div>
              </button>
              <button 
                onClick={() => setShowWithdraw(true)}
                className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowDownLeft className="h-6 w-6 text-red-500" />
                <div className="text-left">
                  <p className="font-medium text-white">Withdraw</p>
                  <p className="text-sm text-gray-300">Transfer to bank</p>
                </div>
              </button>
              <button 
                onClick={() => toast.success('Payment history feature coming soon!')}
                className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <CreditCard className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-white">Payment History</p>
                  <p className="text-sm text-gray-300">View all transactions</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Add Funds Modal */}
          {showAddFunds && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Add Funds</h3>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-400 rounded-lg mb-4"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleAddFunds}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add Funds
                  </button>
                  <button
                    onClick={() => setShowAddFunds(false)}
                    className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Withdraw Modal */}
          {showWithdraw && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Withdraw Funds</h3>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-3 border border-gray-400 rounded-lg mb-4"
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleWithdraw}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => setShowWithdraw(false)}
                    className="px-6 py-2 border border-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700 mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(tx.timestamp).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatINR(tx.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{tx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Test Data Creator for Development */}
      <TestDataCreator />
    </div>
  );
}
