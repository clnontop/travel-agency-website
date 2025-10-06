'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Minus, 
  Search, 
  RefreshCw,
  User,
  Truck,
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface WalletUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export default function WalletManagement() {
  const [users, setUsers] = useState<WalletUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<WalletUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<WalletUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch all users with wallets
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token') || 'admin_token';
      const response = await fetch('/api/admin/wallet', {
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.wallets);
        setFilteredUsers(data.wallets);
      } else {
        toast.error('Failed to fetch wallets');
      }
    } catch (error) {
      toast.error('Error loading wallet data');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (filterRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterRole, users]);

  // Load wallets on mount
  useEffect(() => {
    fetchWallets();
  }, []);

  // Handle transaction
  const handleTransaction = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('admin_token') || 'admin_token';
      const response = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(amount),
          type: transactionType,
          description: description || undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        setAmount('');
        setDescription('');
        fetchWallets(); // Refresh the list
      } else {
        toast.error(data.error || 'Transaction failed');
      }
    } catch (error) {
      toast.error('Error processing transaction');
    } finally {
      setProcessing(false);
    }
  };

  // Open modal for transaction
  const openTransactionModal = (user: WalletUser, type: 'credit' | 'debit') => {
    setSelectedUser(user);
    setTransactionType(type);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Wallet Management</h2>
        <p className="text-gray-400">Manage user wallets and transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterRole('ALL')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRole === 'ALL' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRole('CUSTOMER')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRole === 'CUSTOMER' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <User className="w-4 h-4 inline mr-1" />
              Customers
            </button>
            <button
              onClick={() => setFilterRole('DRIVER')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRole === 'DRIVER' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-1" />
              Drivers
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchWallets}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <p className="text-2xl font-bold text-white">
                ₹{users.reduce((sum, user) => sum + user.balance, 0).toLocaleString()}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Users</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Balance</p>
              <p className="text-2xl font-bold text-white">
                ₹{users.length > 0 
                  ? Math.round(users.reduce((sum, user) => sum + user.balance, 0) / users.length).toLocaleString()
                  : 0}
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'DRIVER' 
                          ? 'bg-blue-900 text-blue-300' 
                          : user.role === 'CUSTOMER'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-purple-900 text-purple-300'
                      }`}>
                        {user.role === 'DRIVER' && <Truck className="w-3 h-3 inline mr-1" />}
                        {user.role === 'CUSTOMER' && <User className="w-3 h-3 inline mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                        ₹{user.balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openTransactionModal(user, 'credit')}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                          title="Add Money"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openTransactionModal(user, 'debit')}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                          title="Deduct Money"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              {transactionType === 'credit' ? 'Add Money' : 'Deduct Money'}
            </h3>

            <div className="mb-4">
              <p className="text-gray-400 text-sm">User</p>
              <p className="text-white font-medium">{selectedUser.name}</p>
              <p className="text-gray-400 text-sm">{selectedUser.email}</p>
            </div>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-white">₹{selectedUser.balance.toLocaleString()}</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Amount</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter amount"
                  min="1"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Add a note..."
                rows={3}
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="mb-6 p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">New Balance</p>
                <p className="text-xl font-bold text-white">
                  ₹{transactionType === 'credit' 
                    ? (selectedUser.balance + parseFloat(amount)).toLocaleString()
                    : Math.max(0, selectedUser.balance - parseFloat(amount)).toLocaleString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleTransaction}
                disabled={processing || !amount || parseFloat(amount) <= 0}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  processing || !amount || parseFloat(amount) <= 0
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : transactionType === 'credit'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {processing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  transactionType === 'credit' ? 'Add Money' : 'Deduct Money'
                )}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setAmount('');
                  setDescription('');
                }}
                disabled={processing}
                className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
