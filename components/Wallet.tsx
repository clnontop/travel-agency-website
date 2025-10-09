'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '../utils/currency';
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
  Calendar
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState('all');

// Use real wallet and transaction state from Zustand
const { user, updateWallet, transactions } = useAuth();
const wallet = user?.wallet || { balance: 0, currency: 'INR', pending: 0, totalEarned: 0, totalSpent: 0 };

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
      case 'Job Payment': return <DollarSign className="h-4 w-4" />;
      case 'Platform Fee': return <Minus className="h-4 w-4" />;
      case 'Withdrawal': return <ArrowDownLeft className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
            <p className="text-gray-600">Manage your earnings and transactions</p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Funds</span>
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Balance</h3>
              <DollarSign className="h-6 w-6" />
            </div>
            <p className="text-3xl font-bold">{formatINR(wallet.balance)}</p>
            <p className="text-primary-100 text-sm">Ready for withdrawal</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 text-gray-900"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatINR(wallet.pending)}</p>
            <p className="text-gray-600 text-sm">Awaiting clearance</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 text-gray-900"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Earned</h3>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatINR(wallet.totalEarned)}</p>
            <p className="text-gray-600 text-sm">All time earnings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 text-gray-900"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatINR(1247)}</p>
            <p className="text-gray-600 text-sm">+12% from last month</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 text-gray-900"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ArrowDownLeft className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Withdraw</p>
                <p className="text-sm text-gray-600">Transfer to bank</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CreditCard className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Add Funds</p>
                <p className="text-sm text-gray-600">Top up wallet</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Banknote className="h-6 w-6 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Payment History</p>
                <p className="text-sm text-gray-600">View all transactions</p>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 text-gray-900"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {transactions
              .filter(t => filter === 'all' || t.type === filter || t.status === filter)
              .map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownLeft className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getCategoryIcon(transaction.category)}
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatINR(transaction.amount)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </motion.div>
              ))}
          </div>

          <div className="mt-6 text-center">
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              View All Transactions
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 