'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Settings, 
  User, 
  MapPin, 
  Package, 
  Truck, 
  Clock, 
  Star, 
  DollarSign, 
  Eye, 
  EyeOff, 
  Search, 
  Calendar, 
  Zap, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  CreditCard,
  MessageCircle,
  LogOut,
  Crown,
  Filter
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '../../utils/currency';
import { useJobs } from '@/store/useJobs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useNavigation } from '@/hooks/useNavigation';
import { useChat } from '@/store/useChat';
import NotificationSystem from '@/components/NotificationSystem';
import PremiumBadge from '@/components/PremiumBadge';
import PremiumUpgradeModal from '@/components/PremiumUpgradeModal';
import { useDrivers } from '@/store/useDrivers';

export default function Dashboard() {
  const [activeTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { user, logout } = useAuth();
  const { jobs, applyForJob, getAvailableJobs, getJobsByCustomer, selectDriver } = useJobs();
  const { getDriversByRoute } = useDrivers();
  const { createChat, getChatsByUserId } = useChat();
  const router = useRouter();
  const { navigateWithLoading } = useNavigation();

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  // Get relevant jobs based on user type
  const availableJobs = getAvailableJobs();
  const customerJobs = user.type === 'customer' ? getJobsByCustomer(user.id) : [];
  const driverJobs = user.type === 'driver' ? jobs.filter(job => job.selectedDriver === user.id) : [];
  const activeJobs = user.type === 'driver' ? driverJobs : availableJobs;
  
  // Get prioritized drivers for route-based search
  const prioritizedDrivers = getDriversByRoute('default');

  // Get user chats and calculate unread messages
  const userChats = getChatsByUserId(user.id);
  const totalUnreadMessages = userChats.reduce((total, chat) => total + chat.unreadCount, 0);

  const stats = user.type === 'driver' ? [
    { label: 'Jobs Taken', value: activeJobs.length.toString(), icon: Package, color: 'red' },
    { label: 'Total Earnings', value: (user.totalEarnings ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), icon: DollarSign, color: 'green' },
    { label: 'Rating', value: user.rating?.toString() || '0', icon: Star, color: 'yellow' },
    { label: 'Completed', value: user.completedJobs?.toString() || '0', icon: TrendingUp, color: 'purple' }
  ] : [
    { label: 'Posted Jobs', value: customerJobs.length.toString(), icon: Package, color: 'red' },
    { label: 'Total Spent', value: user.wallet.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }), icon: DollarSign, color: 'green' },
    { label: 'Active Jobs', value: customerJobs.filter(j => j.status === 'in-progress').length.toString(), icon: Star, color: 'yellow' },
    { label: 'Completed', value: customerJobs.filter(j => j.status === 'completed').length.toString(), icon: TrendingUp, color: 'purple' }
  ];

  const handleAction = async (action: string) => {
    switch (action) {
      case 'post-job':
        if (user.type === 'customer') {
          await navigateWithLoading('/jobs/post', 'Loading job posting...', 500);
        } else {
          toast.success('Job posting feature coming soon!');
        }
        break;
      case 'track-shipment':
        toast.success('Tracking feature coming soon!');
        break;
      case 'find-drivers':
        if (user.type === 'customer') {
          await navigateWithLoading('/customer/driver-map', 'Loading driver map...', 500);
        } else {
          await navigateWithLoading('/driver/profile', 'Loading profile...', 500);
        }
        break;
      case 'schedule-pickup':
        toast.success('Scheduling feature coming soon!');
        break;
      case 'withdraw':
        if (user.type === 'customer') {
          await navigateWithLoading('/customer/wallet', 'Opening wallet...', 500);
        } else {
          toast.success('Withdrawal feature coming soon!');
        }
        break;
      case 'add-funds':
        if (user.type === 'customer') {
          await navigateWithLoading('/customer/wallet', 'Opening wallet...', 500);
        } else {
          toast.success('Add funds feature coming soon!');
        }
        break;
      case 'logout':
        logout();
        toast.success('Logged out successfully');
        await navigateWithLoading('/', 'Logging out...', 400);
        break;
      case 'settings':
        toast.success('Settings page coming soon!');
        break;
      case 'profile':
        if (user.type === 'driver') {
          await navigateWithLoading('/driver/profile', 'Loading profile...', 500);
        } else {
          await navigateWithLoading('/customer/profile', 'Loading profile...', 500);
        }
        break;
      case 'wallet':
        await navigateWithLoading('/wallet', 'Opening wallet...', 500);
        break;
      case 'notifications':
        toast.success('Notifications panel coming soon!');
        break;
      case 'chat':
        await navigateWithLoading('/chat', 'Opening chat...', 500);
        break;
      case 'social':
        if (user.type === 'driver') {
          await navigateWithLoading('/driver/profile?tab=social', 'Loading social...', 500);
        } else {
          await navigateWithLoading('/customer/social', 'Loading social...', 500);
        }
        break;
      case 'upgrade-premium':
        await navigateWithLoading('/subscription', 'Loading subscription plans...', 500);
        break;
      default:
        break;
    }
  };

  const handleJobAction = async (jobId: string, action: string, driverId?: string) => {
    switch (action) {
      case 'view':
        toast.success(`Viewing job ${jobId}`);
        break;
      case 'message':
        toast.success(`Opening chat for job ${jobId}`);
        break;
      case 'apply':
        applyForJob(jobId, user.id);
        toast.success('Applied for job successfully!');
        break;
      case 'accept-driver':
        if (driverId) {
          selectDriver(jobId, driverId);
          const job = jobs.find(j => j.id === jobId);
          if (job) {
            createChat(jobId, user.id, driverId, user.name, 'Driver Name', job.title);
            toast.success('Driver accepted! Chat has been created.');
            await navigateWithLoading('/chat', 'Opening chat...', 500);
          }
        }
        break;
      case 'chat':
        await navigateWithLoading('/chat', 'Opening chat...', 500);
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // In the customer job view, add accept driver functionality
  const renderCustomerJob = (job: any, index: number) => (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-700"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-2">{job.title}</h3>
          <p className="text-gray-300 text-sm mb-3">{job.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{job.pickup} → {job.delivery}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">{job.distance}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
              {job.appliedDrivers && job.appliedDrivers.length > 0 && (
                <span className="text-sm text-blue-300">
                  {job.appliedDrivers.length} driver(s) applied
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">£{job.budget}</p>
              <p className="text-sm text-gray-300">Budget</p>
            </div>
          </div>
          
          {/* Show applied drivers for customer */}
          {job.appliedDrivers && job.appliedDrivers.length > 0 && job.status === 'open' && (
            <div className="mt-3 p-3 bg-gray-600 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Applied Drivers:</h4>
              <div className="space-y-2">
                {job.appliedDrivers.map((driverId: string, driverIndex: number) => (
                  <div key={driverIndex} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <Truck className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-300">Driver {driverIndex + 1}</span>
                    </div>
                    <button
                      onClick={() => handleJobAction(job.id, 'accept-driver', driverId)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                    >
                      Accept & Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button 
            onClick={() => handleJobAction(job.id, 'view')}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
          {job.status === 'in-progress' && (
            <button 
              onClick={() => handleJobAction(job.id, 'chat')}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Truck className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">TRINK</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleAction('chat')}
                className="relative p-2 text-gray-400 hover:text-gray-200 transition-colors"
                title={`Messages ${totalUnreadMessages > 0 ? `(${totalUnreadMessages} unread)` : ''}`}
              >
                <MessageSquare className="h-6 w-6" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                  </span>
                )}
              </button>
              <NotificationSystem />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-200">{user.name}</span>
                  {user.isPremium && (
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Crown className="w-3 h-3" />
                      <span>Premium</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-300">
            Here's what's happening with your {user.type === 'driver' ? 'transport business' : 'shipments'} today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {user.type === 'driver' ? 'Jobs Taken' : 'My Jobs'}
                </h2>
                {user.type === 'customer' && (
                  <button 
                    onClick={() => handleAction('post-job')}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Post Job</span>
                  </button>
                )}
              </div>
              
              <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={user.type === 'driver' ? "Search jobs taken..." : "Search my jobs..."}
                    className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-700 text-white"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 flex items-center space-x-2 text-gray-300">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>

              {/* Job List */}
              <div className="space-y-4">
                {user.type === 'driver' ? (
                  // Driver view - Jobs taken (active jobs)
                  activeJobs.length > 0 ? (
                    activeJobs
                      .filter(job => 
                        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.delivery.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                            prioritizedDrivers.some(d => d.isPremium && job.appliedDrivers?.includes(d.id))
                              ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50'
                              : 'border-gray-700 bg-gray-700'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-2">{job.title}</h3>
                              <p className="text-gray-300 text-sm mb-3">{job.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-300 mb-3">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.pickup} → {job.delivery}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDate(job.createdAt)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <span className="text-sm text-gray-300">{job.distance}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                    {job.status}
                                  </span>
                                  {job.vehicleType && (
                                    <span className="text-sm text-gray-300">Vehicle: {job.vehicleType}</span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-white">£{job.budget}</p>
                                  <p className="text-sm text-gray-300">Budget</p>
                                </div>
                              </div>
                              <div className="mt-3 text-sm text-gray-400">
                                <p>Posted by: {job.customerName}</p>
                                {job.specialRequirements && (
                                  <p className="mt-1">Requirements: {job.specialRequirements}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button 
                                onClick={() => handleJobAction(job.id, 'view')}
                                className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleJobAction(job.id, 'apply')}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No jobs taken at the moment</p>
                      <p className="text-gray-500 text-sm mt-2">Apply for jobs to see them here</p>
                    </div>
                  )
                ) : (
                  // Customer view - My jobs
                  customerJobs.length > 0 ? (
                    customerJobs
                      .filter(job => 
                        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.delivery.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((job, index) => renderCustomerJob(job, index))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No jobs posted yet</p>
                      <p className="text-gray-500 text-sm mt-2">Post your first job to get started</p>
                      <button 
                        onClick={() => handleAction('post-job')}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Post Your First Job
                      </button>
                    </div>
                  )
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {user.type === 'driver' ? (
                  // Driver activity
                  driverJobs.length > 0 ? (
                    driverJobs.slice(0, 3).map((job, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-white">{job.title}</p>
                          <p className="text-sm text-gray-300">{job.pickup} → {job.delivery}</p>
                          <p className="text-xs text-gray-400">{formatDate(job.createdAt)}</p>
                        </div>
                        <span className="font-semibold text-green-400">+₹0.00</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No recent activity</p>
                  )
                ) : (
                  // Customer activity
                  customerJobs.slice(0, 3).map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{job.title}</p>
                        <p className="text-sm text-gray-300">{job.pickup} → {job.delivery}</p>
                        <p className="text-xs text-gray-400">{formatDate(job.createdAt)}</p>
                      </div>
                      <span className={`font-semibold ${job.status === 'completed' ? 'text-green-400' : 'text-blue-400'}`}>
                        {job.status === 'completed' ? 'Completed' : job.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Wallet & Quick Actions */}
          <div className="space-y-6">
            {/* Wallet Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {user.type === 'driver' ? 'Earnings' : 'Wallet Balance'}
                </h3>
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold">£{user.wallet.balance.toFixed(2)}</p>
                <p className="text-red-100 text-sm">
                  {user.type === 'driver' ? 'Available for withdrawal' : 'Available for payments'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleAction('withdraw')}
                  className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  {user.type === 'driver' ? 'Withdraw' : 'Withdraw'}
                </button>
                <button 
                  onClick={() => handleAction('add-funds')}
                  className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-medium transition-colors"
                >
                  {user.type === 'driver' ? 'Add Funds' : 'Add Funds'}
                </button>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user.type === 'customer' ? (
                  <>
                    <button 
                      onClick={() => handleAction('post-job')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <Plus className="h-5 w-5 text-red-500" />
                      <span>Post New Job</span>
                    </button>
                    <button 
                      onClick={() => handleAction('track-shipment')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <MapPin className="h-5 w-5 text-red-500" />
                      <span>Track Shipment</span>
                    </button>
                    <button 
                      onClick={() => handleAction('find-drivers')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <Users className="h-5 w-5 text-red-500" />
                      <span>Find Drivers</span>
                    </button>
                    <button 
                      onClick={() => navigateWithLoading('/customer/driver-map', 'Loading driver map...', 500)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <MapPin className="h-5 w-5 text-red-500" />
                      <span>Driver Map</span>
                    </button>
                    <button 
                      onClick={() => handleAction('chat')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <MessageSquare className="h-5 w-5 text-red-500" />
                      <div className="flex items-center justify-between flex-1">
                        <span>Messages</span>
                        {totalUnreadMessages > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                            {totalUnreadMessages}
                          </span>
                        )}
                      </div>
                    </button>
                    <button 
                      onClick={() => handleAction('social')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <MessageCircle className="h-5 w-5 text-red-500" />
                      <span>Customer Social</span>
                    </button>
                    {!user.isPremium && (
                      <button 
                        onClick={() => handleAction('upgrade-premium')}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 hover:from-yellow-400/20 hover:to-orange-500/20 transition-all text-yellow-400"
                      >
                        <Crown className="h-5 w-5" />
                        <span>Upgrade to Premium</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleAction('find-drivers')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <User className="h-5 w-5 text-red-500" />
                      <span>Edit Profile</span>
                    </button>
                    <button 
                      onClick={() => handleAction('track-shipment')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <MapPin className="h-5 w-5 text-red-500" />
                      <span>Track Jobs</span>
                    </button>
                    <button 
                      onClick={() => handleAction('chat')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <MessageSquare className="h-5 w-5 text-red-500" />
                      <div className="flex items-center justify-between flex-1">
                        <span>Messages</span>
                        {totalUnreadMessages > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                            {totalUnreadMessages}
                          </span>
                        )}
                      </div>
                    </button>
                    <button 
                      onClick={() => handleAction('schedule-pickup')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <Calendar className="h-5 w-5 text-red-500" />
                      <span>My Schedule</span>
                    </button>
                    <button 
                      onClick={() => handleAction('wallet')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <CreditCard className="h-5 w-5 text-red-500" />
                      <div className="flex items-center justify-between flex-1">
                        <span>Wallet</span>
                        <span className="text-green-400 text-sm font-medium">
                          {formatINR(user.wallet.balance)}
                        </span>
                      </div>
                    </button>
                    <button 
                      onClick={() => handleAction('social')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                      <Truck className="h-5 w-5 text-red-500" />
                      <span>Driver Social</span>
                    </button>
                    {!user.isPremium && (
                      <button 
                        onClick={() => handleAction('upgrade-premium')}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 hover:from-yellow-400/20 hover:to-orange-500/20 transition-all text-yellow-400"
                      >
                        <Crown className="h-5 w-5" />
                        <span>Upgrade to Premium</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>

            {/* Profile Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Profile Stats</h3>
              <div className="space-y-4">
                {user.type === 'driver' && user.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-white">{user.rating}</span>
                    </div>
                  </div>
                )}
                {user.type === 'driver' && user.completedJobs && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Completed Jobs</span>
                    <span className="font-semibold text-white">{user.completedJobs}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Member Since</span>
                  <span className="font-semibold text-white">{user.memberSince}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Location</span>
                  <span className="font-semibold text-white">{user.location || 'Not set'}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Account Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleAction('profile')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <User className="h-5 w-5 text-red-500" />
                  <span>Edit Profile</span>
                </button>
                <button 
                  onClick={() => handleAction('settings')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <Settings className="h-5 w-5 text-red-500" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={() => handleAction('logout')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </div>
  );
}