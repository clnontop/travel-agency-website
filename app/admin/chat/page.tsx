'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Ban, 
  Eye, 
  Clock,
  MessageSquare,
  UserX,
  CheckCircle,
  XCircle,
  Calendar,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { chatModerationService, UserViolation, UserBan, ModerationStats } from '@/utils/chatModeration';
import toast from 'react-hot-toast';

export default function AdminChatPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'violations' | 'bans' | 'users'>('overview');
  const [violations, setViolations] = useState<UserViolation[]>([]);
  const [bans, setBans] = useState<UserBan[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'phone_number' | 'spam' | 'inappropriate'>('all');
  const { user } = useAuth();
  const router = useRouter();

  // Check if user is admin (you can implement your own admin check logic)
  const isAdmin = user?.type === 'admin' || user?.email === 'admin@gotrink.com';

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    loadData();
  }, [user, isAdmin, router]);

  const loadData = () => {
    setViolations(chatModerationService.getAllViolations());
    setBans(chatModerationService.getAllBans());
    setStats(chatModerationService.getModerationStats());
  };

  const handleUnbanUser = (userId: string) => {
    const success = chatModerationService.unbanUser(userId);
    if (success) {
      toast.success('User unbanned successfully');
      loadData();
    } else {
      toast.error('Failed to unban user');
    }
  };

  const handleManualBan = (userId: string, userName: string, reason: string, days: number) => {
    chatModerationService.manualBanUser(userId, userName, reason, days);
    toast.success(`User ${userName} banned for ${days} days`);
    loadData();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const filteredViolations = violations.filter(violation => {
    const matchesSearch = violation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         violation.originalMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || violation.violationType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Chat Administration</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'violations', label: 'Violations', icon: AlertTriangle },
              { id: 'bans', label: 'Banned Users', icon: Ban },
              { id: 'users', label: 'User Management', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Violations</p>
                    <p className="text-2xl font-bold text-white">{stats.totalViolations}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
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
                    <p className="text-gray-400 text-sm">Active Bans</p>
                    <p className="text-2xl font-bold text-white">{stats.activeBans}</p>
                  </div>
                  <Ban className="h-8 w-8 text-red-500" />
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
                    <p className="text-gray-400 text-sm">Phone Number Attempts</p>
                    <p className="text-2xl font-bold text-white">{stats.phoneNumberAttempts}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
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
                    <p className="text-gray-400 text-sm">Recent Activity</p>
                    <p className="text-2xl font-bold text-white">{stats.recentViolations.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </motion.div>
            </div>

            {/* Recent Violations */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Recent Violations</h3>
              </div>
              <div className="p-6">
                {stats.recentViolations.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentViolations.map((violation) => (
                      <div key={violation.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-white">{violation.userName}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              violation.violationType === 'phone_number' ? 'bg-red-600 text-white' :
                              violation.violationType === 'spam' ? 'bg-yellow-600 text-white' :
                              'bg-orange-600 text-white'
                            }`}>
                              {violation.violationType.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
                            Original: "{violation.originalMessage}"
                          </p>
                          <p className="text-sm text-gray-400">
                            Filtered: "{violation.filteredMessage}"
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{formatDate(violation.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No recent violations</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Violations Tab */}
        {activeTab === 'violations' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search violations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Types</option>
                    <option value="phone_number">Phone Numbers</option>
                    <option value="spam">Spam</option>
                    <option value="inappropriate">Inappropriate</option>
                  </select>
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Violations List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">
                  All Violations ({filteredViolations.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Original Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Filtered Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredViolations.map((violation) => (
                      <tr key={violation.id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{violation.userName}</div>
                          <div className="text-sm text-gray-400">{violation.userId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            violation.violationType === 'phone_number' ? 'bg-red-600 text-white' :
                            violation.violationType === 'spam' ? 'bg-yellow-600 text-white' :
                            'bg-orange-600 text-white'
                          }`}>
                            {violation.violationType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs truncate">
                            {violation.originalMessage}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-400 max-w-xs truncate">
                            {violation.filteredMessage}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(violation.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleManualBan(violation.userId, violation.userName, 'Manual ban from admin', 7)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Ban User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bans Tab */}
        {activeTab === 'bans' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Banned Users ({bans.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-750">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Banned Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Expires
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
                    {bans.map((ban) => (
                      <tr key={ban.id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{ban.userName}</div>
                          <div className="text-sm text-gray-400">{ban.userId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs">
                            {ban.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(ban.bannedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(ban.expiresAt)}
                          <div className="text-xs text-gray-500">
                            ({formatTimeRemaining(ban.expiresAt)} remaining)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {ban.isActive && new Date() < ban.expiresAt ? (
                            <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded-full">
                              Expired
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ban.isActive && new Date() < ban.expiresAt && (
                            <button
                              onClick={() => handleUnbanUser(ban.userId)}
                              className="text-green-400 hover:text-green-300"
                            >
                              Unban
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Management Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-white">Manual Ban User</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="User ID"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="User Name"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option value="1">1 Day</option>
                    <option value="3">3 Days</option>
                    <option value="7">1 Week</option>
                    <option value="30">1 Month</option>
                  </select>
                  <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                    Ban User
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-md font-medium text-white">System Actions</h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      chatModerationService.clearOldViolations(30);
                      toast.success('Old violations cleared');
                      loadData();
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Clear Old Violations (30+ days)
                  </button>
                  <button 
                    onClick={loadData}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Refresh Data
                  </button>
                  <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">
                    Export All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
