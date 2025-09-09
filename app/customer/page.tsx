'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Truck,
  User,
  Phone,
  Star,
  Package,
  Navigation,
  Flag,
  Wallet,
  Search,
  Plus
} from 'lucide-react';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('active');
  const { jobs, createJob } = useJobs();
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.type !== 'customer') {
    router.push('/auth/login');
    return null;
  }

  // Get jobs based on customer's involvement
  const activeJobs = jobs.filter(job => 
    job.customerId === user.id && 
    (job.status === 'open' || job.status === 'in-progress')
  );

  const completedJobs = jobs.filter(job => 
    job.customerId === user.id && 
    job.status === 'completed'
  );

  const allCustomerJobs = jobs.filter(job => job.customerId === user.id);

  const getJobsForTab = () => {
    switch (activeTab) {
      case 'active':
        return activeJobs;
      case 'completed':
        return completedJobs;
      case 'all':
        return allCustomerJobs;
      default:
        return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">TRINK</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-2">Welcome back, {user.name}!</h1>
              <p className="text-gray-600 text-lg">
                Manage your shipments and track deliveries with ease.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/customer/jobs/create')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl hover:from-red-600 hover:to-red-800 transition-all space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Job</span>
                </button>
                <button
                  onClick={() => router.push('/map')}
                  className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-md text-gray-700 rounded-xl hover:bg-white/90 transition-all space-x-2 shadow-lg border border-white/20 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Drivers</span>
                </button>
                <button
                  onClick={() => router.push('/customer/wallet')}
                  className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-md text-gray-700 rounded-xl hover:bg-white/90 transition-all space-x-2 shadow-lg border border-white/20"
                >
                  <Wallet className="w-4 h-4" />
                  <span>My Wallet</span>
                </button>
                <button
                  onClick={() => router.push('/driver')}
                  className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-md text-gray-700 rounded-xl hover:bg-white/90 transition-all space-x-2 shadow-lg border border-white/20"
                >
                  <Truck className="w-4 h-4" />
                  <span>Switch to Driver</span>
                </button>
              </div>
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{user.name}</span>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{user.rating || 4.5}</span>
                      <span className="mx-2">•</span>
                      <span>{allCustomerJobs.length} jobs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{allCustomerJobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatINR(user.wallet?.balance || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'active', label: 'Active Jobs', count: activeJobs.length },
                { key: 'completed', label: 'Completed', count: completedJobs.length },
                { key: 'all', label: 'All Jobs', count: allCustomerJobs.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.key 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Jobs List */}
          <div className="p-6">
            {getJobsForTab().length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} jobs
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'active' 
                    ? 'You don\'t have any active jobs at the moment'
                    : `You don't have any ${activeTab} jobs`
                  }
                </p>
                <button
                  onClick={() => router.push('/customer/jobs/create')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg hover:from-red-600 hover:to-red-800 transition-all space-x-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Your First Job</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {getJobsForTab().map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:shadow-lg transition-all hover:bg-white/90"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {job.title}
                        </h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-green-500" />
                            <span className="font-medium">Pickup:</span>
                            <span className="ml-1">{job.pickup}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            <span className="font-medium">Delivery:</span>
                            <span className="ml-1">{job.delivery}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{job.distance}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {formatINR(job.budget)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          <span className="capitalize">{job.status}</span>
                        </span>
                      </div>
                    </div>

                    {job.description && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700">{job.description}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {job.vehicleType && (
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            <Truck className="w-3 h-3 mr-1" />
                            {job.vehicleType}
                          </span>
                        )}
                        {job.appliedDrivers && job.appliedDrivers.length > 0 && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            <User className="w-3 h-3 mr-1" />
                            {job.appliedDrivers.length} applications
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => router.push(`/customer/track-shipment?jobId=${job.id}`)}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all space-x-2 shadow-lg"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Track</span>
                        </button>
                        
                        {job.status === 'completed' && (
                          <button
                            onClick={() => router.push(`/customer/pay?jobId=${job.id}`)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all space-x-2 shadow-lg"
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
