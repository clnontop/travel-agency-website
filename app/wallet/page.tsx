'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  Send, 
  History, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  RefreshCw,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Download,
  Bell,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatINR } from '@/utils/currency';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [addFundAmount, setAddFundAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { user, updateWallet, addTransaction, transactions, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) return null;

  const handleAddFunds = async () => {
    const amount = parseFloat(addFundAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Simulate payment processing
      toast.loading('Processing payment...', { id: 'add-funds' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBalance = user.wallet.balance + amount;
      updateWallet({ balance: newBalance });

      const transaction = {
        id: `add_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'credit' as const,
        amount: amount,
        description: 'Funds added to wallet',
        timestamp: new Date(),
        status: 'completed' as const,
        category: 'deposit'
      };

      addTransaction(transaction);
      setAddFundAmount('');
      toast.success(`₹${amount} added successfully!`, { id: 'add-funds' });
    } catch (error) {
      toast.error('Failed to add funds', { id: 'add-funds' });
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!transferRecipient.trim()) {
      toast.error('Please enter recipient details');
      return;
    }

    if (amount > user.wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      toast.loading('Processing transfer...', { id: 'transfer' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBalance = user.wallet.balance - amount;
      const newTotalSpent = user.wallet.totalSpent + amount;
      
      updateWallet({ 
        balance: newBalance,
        totalSpent: newTotalSpent
      });

      const transaction = {
        id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'debit' as const,
        amount: amount,
        description: `Transfer to ${transferRecipient}`,
        timestamp: new Date(),
        status: 'completed' as const,
        category: 'transfer'
      };

      addTransaction(transaction);
      setTransferAmount('');
      setTransferRecipient('');
      toast.success(`₹${amount} transferred successfully!`, { id: 'transfer' });
    } catch (error) {
      toast.error('Transfer failed', { id: 'transfer' });
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? (
      <ArrowDownLeft className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-500" />
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-white">Wallet</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-200">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Wallet className="h-8 w-8 text-white" />
                <h2 className="text-2xl font-bold text-white">My Wallet</h2>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-white/80 text-sm mb-2">Available Balance</p>
                <p className="text-3xl font-bold text-white">
                  {showBalance ? formatINR(user.wallet.balance) : '••••••'}
                </p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-2">Total Spent</p>
                <p className="text-xl font-semibold text-white">
                  {showBalance ? formatINR(user.wallet.totalSpent) : '••••••'}
                </p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-2">Total Earned</p>
                <p className="text-xl font-semibold text-white">
                  {showBalance ? formatINR(user.wallet.totalEarned) : '••••••'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Plus className="h-6 w-6 text-green-500" />
              <h3 className="text-lg font-semibold">Add Funds</h3>
            </div>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Enter amount"
                value={addFundAmount}
                onChange={(e) => setAddFundAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 caret-gray-400"
                style={{ color: 'transparent' }}
              />
              <button
                onClick={handleAddFunds}
                disabled={!addFundAmount}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Add Funds
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Send className="h-6 w-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Transfer Money</h3>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Recipient (Driver ID or Name)"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="number"
                placeholder="Enter amount"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 caret-gray-400"
                style={{ color: 'transparent' }}
              />
              <button
                onClick={handleTransfer}
                disabled={!transferAmount || !transferRecipient}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Transfer
              </button>
            </div>
          </motion.div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <History className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Transaction History</h3>
            </div>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <Download className="h-4 w-4" />
              <span className="text-sm">Export</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Transactions</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
          </div>

          {/* Transaction List */}
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-600 rounded-full">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{transaction.description}</p>
                      <p className="text-sm text-gray-400">{formatDate(transaction.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                    </p>
                    <p className="text-sm text-gray-400 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No transactions found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter'
                    : 'Your transaction history will appear here'
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
