'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import React from 'react';
import { 
  Shield, 
  Users, 
  Truck, 
  MapPin, 
  DollarSign, 
  Activity,
  Eye,
  EyeOff,
  LogOut,
  Settings,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import WalletManagement from '@/components/admin/WalletManagement';

interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  activeJobs: number;
  totalRevenue: number;
  onlineDrivers: number;
  pendingVerifications: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 1247,
    totalDrivers: 89,
    activeJobs: 23,
    totalRevenue: 125000,
    onlineDrivers: 34,
    pendingVerifications: 7
  });

  // Check for existing admin session on page load
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const adminUser = localStorage.getItem('admin_user');
    
    if (adminToken === 'admin_authenticated' && adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setIsAuthenticated(true);
        setUsername(user.username || user.email);
      } catch (error) {
        // Clear invalid session
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simple admin authentication
      const adminCredentials = {
        'admin@trinck.com': 'admin123',
        'admin': 'admin123',
        'superadmin': 'super123'
      };

      const email = username.includes('@') ? username : `${username}@trinck.com`;
      const isValidAdmin = adminCredentials[email as keyof typeof adminCredentials] === password || 
                          adminCredentials[username as keyof typeof adminCredentials] === password;

      if (isValidAdmin) {
        setIsAuthenticated(true);
        toast.success('Welcome to Admin Dashboard!');
        
        // Store admin session
        localStorage.setItem('admin_token', 'admin_authenticated');
        localStorage.setItem('admin_user', JSON.stringify({
          email: email,
          username: username,
          role: 'ADMIN',
          loginTime: new Date().toISOString()
        }));
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setActiveSection('dashboard');
    
    // Clear admin session
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    toast.success('Logged out successfully');
  };

  const fetchUsers = async () => {
    try {
      // Get users from localStorage (same as the auth system uses)
      const storedUsers = localStorage.getItem('trinck-registered-users');
      if (storedUsers) {
        const usersData = JSON.parse(storedUsers);
        const formattedUsers = usersData.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          isActive: true,
          isBanned: user.isBanned || false,
          lastLogin: user.lastLogin || null,
          createdAt: user.createdAt
        }));
        
        setUsers(formattedUsers);
        setStats(prev => ({ 
          ...prev, 
          totalUsers: formattedUsers.length,
          totalDrivers: formattedUsers.filter((u: any) => u.type === 'driver').length
        }));
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const storedUsers = localStorage.getItem('trinck-registered-users');
      if (storedUsers) {
        const usersData = JSON.parse(storedUsers);
        const updatedUsers = usersData.filter((user: any) => user.id !== userId);
        localStorage.setItem('trinck-registered-users', JSON.stringify(updatedUsers));
        
        toast.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleBanUser = async (userId: string, action: 'ban' | 'unban') => {
    try {
      const storedUsers = localStorage.getItem('trinck-registered-users');
      if (storedUsers) {
        const usersData = JSON.parse(storedUsers);
        const updatedUsers = usersData.map((user: any) => {
          if (user.id === userId) {
            return { ...user, isBanned: action === 'ban' };
          }
          return user;
        });
        localStorage.setItem('trinck-registered-users', JSON.stringify(updatedUsers));
        
        toast.success(`User ${action}ned successfully`);
        fetchUsers();
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  // Fetch users when switching to user management
  React.useEffect(() => {
    if (activeSection === 'users' && isAuthenticated) {
      fetchUsers();
    }
  }, [activeSection, isAuthenticated]);

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="h-8 w-8 text-red-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-300">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email or Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white"
                placeholder="admin@trinck.com or admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-lg font-semibold rounded-lg transition-all ${
                isLoading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Admin Credentials:</strong><br />
              Email: admin@trinck.com<br />
              Password: admin123
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Welcome back, {username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'dashboard' ? (
          <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Drivers</p>
                <p className="text-3xl font-bold text-white">{stats.totalDrivers}</p>
                <p className="text-green-400 text-sm">{stats.onlineDrivers} online</p>
              </div>
              <Truck className="h-12 w-12 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-3xl font-bold text-white">{stats.activeJobs}</p>
              </div>
              <MapPin className="h-12 w-12 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-12 w-12 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">System Status</p>
                <p className="text-2xl font-bold text-green-400">Operational</p>
              </div>
              <Activity className="h-12 w-12 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Verifications</p>
                <p className="text-3xl font-bold text-orange-400">{stats.pendingVerifications}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setActiveSection('users')}
                className="w-full flex items-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Users className="w-5 h-5 mr-3" />
                Manage Users
              </button>
              <button 
                onClick={() => setActiveSection('wallet')}
                className="w-full flex items-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Wallet className="w-5 h-5 mr-3" />
                Wallet Management
              </button>
              <button className="w-full flex items-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Truck className="w-5 h-5 mr-3" />
                Driver Management
              </button>
              <button className="w-full flex items-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5 mr-3" />
                Analytics
              </button>
              <button className="w-full flex items-center px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                <Settings className="w-5 h-5 mr-3" />
                System Settings
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">New driver registered</p>
                  <p className="text-gray-400 text-xs">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Job completed successfully</p>
                  <p className="text-gray-400 text-xs">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Payment processed</p>
                  <p className="text-gray-400 text-xs">12 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">System maintenance scheduled</p>
                  <p className="text-gray-400 text-xs">1 hour ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        </>
        ) : activeSection === 'users' ? (
          /* User Management Section */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <button
                onClick={() => setActiveSection('dashboard')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">All Users</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-gray-300 font-medium">Name</th>
                        <th className="pb-3 text-gray-300 font-medium">Email</th>
                        <th className="pb-3 text-gray-300 font-medium">Type</th>
                        <th className="pb-3 text-gray-300 font-medium">Status</th>
                        <th className="pb-3 text-gray-300 font-medium">Last Login</th>
                        <th className="pb-3 text-gray-300 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700">
                          <td className="py-4 text-white">{user.name}</td>
                          <td className="py-4 text-gray-300">{user.email}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.type === 'driver' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.type}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isBanned 
                                ? 'bg-red-100 text-red-800' 
                                : user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 text-gray-300">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              {user.isBanned ? (
                                <button
                                  onClick={() => handleBanUser(user.id, 'unban')}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                >
                                  Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanUser(user.id, 'ban')}
                                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                                >
                                  Ban
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : activeSection === 'wallet' ? (
          /* Wallet Management Section */
          <WalletManagement />
        ) : null}
      </div>
    </div>
  );
}
