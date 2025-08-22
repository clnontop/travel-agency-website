'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight,
  User,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useDriverWallets } from '@/store/useDriverWallets';
import { formatINR } from '@/utils/currency';
import WalletBalanceCard from '@/components/WalletBalanceCard';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DriverWallet() {
  const { user } = useAuth();
  const { getDriverWallet, getDriverTransactions, addPaymentToDriver } = useDriverWallets();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Test function to add a payment manually
  const addTestPayment = () => {
    if (!user) return;
    
    const testAmount = 500;
    const testDescription = 'Test payment from customer';
    addPaymentToDriver(
      user.id,
      testAmount,
      testDescription,
      'test-customer-id',
      'Test Customer'
    );
    toast.success(`Added test payment of ₹${testAmount}`);
    setRefreshKey(prev => prev + 1);
  };

  if (!user || user.type !== 'driver') {
    router.push('/auth/login');
    return null;
  }

  // Debug: Check for payments to different driver IDs
  const currentDriverWallet = getDriverWallet(user.id);
  const rahulDriverWallet = getDriverWallet('rahul-sharma');
  const currentDriverTransactions = getDriverTransactions(user.id);
  const rahulDriverTransactions = getDriverTransactions('rahul-sharma');
  
  // Use Rahul's wallet if current user has no transactions but Rahul does
  const driverWallet = currentDriverTransactions.length > 0 ? currentDriverWallet : rahulDriverWallet;
  const driverTransactions = currentDriverTransactions.length > 0 ? currentDriverTransactions : rahulDriverTransactions;
  
  console.log('Driver Wallet Debug Info:', {
    currentUserId: user.id,
    currentUserWallet: currentDriverWallet,
    currentUserTransactions: currentDriverTransactions.length,
    rahulWallet: rahulDriverWallet,
    rahulTransactions: rahulDriverTransactions.length,
    usingWallet: driverWallet,
    usingTransactions: driverTransactions.length
  });

  // Force refresh every few seconds to show new payments
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownLeft className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Wallet</h1>
              <p className="text-gray-600 mt-2">
                Manage your earnings and track payments from customers
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={addTestPayment}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors space-x-2"
              >
                <DollarSign className="w-4 h-4" />
                <span>Add Test Payment</span>
              </button>
              <button
                onClick={() => router.push('/driver')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            key={`balance-${refreshKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatINR(driverWallet.balance)}</p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900">{formatINR(driverWallet.totalEarned)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
                <p className="text-2xl font-bold text-gray-900">{formatINR(driverWallet.totalWithdrawn)}</p>
              </div>
              <Download className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payments Received</p>
                <p className="text-2xl font-bold text-gray-900">{driverTransactions.filter(t => t.type === 'credit').length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-indigo-500" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Wallet Balance Card */}
          <div className="lg:col-span-2">
            <WalletBalanceCard
              balance={driverWallet.balance}
              currency={driverWallet.currency}
              totalSpent={driverWallet.totalWithdrawn}
              totalEarned={driverWallet.totalEarned}
              key={`driver-wallet-${refreshKey}`}
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Today's Earnings</span>
                  <span className="font-semibold text-green-600">
                    {formatINR(
                      driverTransactions
                        .filter(t => 
                          t.type === 'credit' && 
                          new Date(t.timestamp).toDateString() === new Date().toDateString()
                        )
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold text-green-600">
                    {formatINR(
                      driverTransactions
                        .filter(t => {
                          const transactionDate = new Date(t.timestamp);
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return t.type === 'credit' && transactionDate >= weekAgo;
                        })
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Average per Payment</span>
                  <span className="font-semibold text-blue-600">
                    {driverTransactions.filter(t => t.type === 'credit').length > 0
                      ? formatINR(driverWallet.totalEarned / driverTransactions.filter(t => t.type === 'credit').length)
                      : formatINR(0)
                    }
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
            <p className="text-sm text-gray-600 mt-1">Track all payments received from customers</p>
          </div>

          <div className="overflow-x-auto">
            {driverTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Payments Yet</h4>
                <p className="text-gray-500">
                  Payments from customers will appear here once you start receiving them.
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      From Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {driverTransactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.fromCustomerName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {transaction.fromCustomerId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatINR(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(transaction.timestamp).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
