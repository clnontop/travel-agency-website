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
  Crown,
  Shield
} from 'lucide-react';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { useDrivers } from '@/store/useDrivers';
import { usePremium } from '@/store/usePremium';
import { formatINR } from '@/utils/currency';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import TestDataCreator from '@/components/TestDataCreator';
import JobSyncListener from '@/components/JobSyncListener';
import PremiumBadge, { PremiumStatusIndicator } from '@/components/PremiumBadge';
import PremiumSubscriptionModal from '@/components/PremiumSubscriptionModal';
import DriverAppDownload from '@/components/DriverAppDownload';
import GPSTracker from '@/components/GPSTracker';

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('available');
  const { jobs, applyForJob, completeJob } = useJobs();
  const { user } = useAuth();
  const { getDriver, checkPremiumStatus } = useDrivers();
  const { isUserPremium } = usePremium();
  const router = useRouter();

  const driver = getDriver(user?.id || '');
  const isPremium = isUserPremium(user?.id || '');

  // Debug user state in driver dashboard
  console.log('🚛 Driver Dashboard - User state:', { 
    user: user ? { id: user.id, name: user.name, type: user.type, email: user.email } : null,
    hasUser: !!user,
    userType: user?.type
  });

  if (!user || user.type !== 'driver') {
    console.log('❌ Driver dashboard - Invalid user, redirecting to login');
    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
    return null;
  }

  // Get jobs based on driver's involvement
  const availableJobs = jobs.filter(job => 
    job.status === 'open' && 
    !job.appliedDrivers?.includes(user.id)
  );

  const appliedJobs = jobs.filter(job => 
    job.appliedDrivers?.includes(user.id) && 
    job.selectedDriver !== user.id
  );

  const activeJobs = jobs.filter(job => 
    job.selectedDriver === user.id && 
    job.status === 'in-progress'
  );

  const completedJobs = jobs.filter(job => 
    job.selectedDriver === user.id && 
    job.status === 'completed'
  );

  const handleApplyForJob = (jobId: string) => {
    try {
      applyForJob(jobId, user.id);
      toast.success('Applied for job successfully!');
    } catch (error) {
      toast.error('Failed to apply for job');
    }
  };

  const handleCompleteJob = (jobId: string) => {
    try {
      completeJob(jobId);
      toast.success('Job marked as completed! Customer will be notified for payment.');
      
      // In a real app, you would send a notification to the customer
      // For now, we'll just show a success message
    } catch (error) {
      toast.error('Failed to complete job');
    }
  };

  const getJobsForTab = () => {
    switch (activeTab) {
      case 'available':
        return availableJobs;
      case 'applied':
        return appliedJobs;
      case 'active':
        return activeJobs;
      case 'completed':
        return completedJobs;
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
    <>
      <JobSyncListener />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Find jobs, manage applications, and complete deliveries
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-3">
                {!isPremium && (
                  <button
                    onClick={() => router.push('/driver/premium')}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all space-x-2 shadow-lg"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Go Premium</span>
                  </button>
                )}
                <button
                  onClick={() => router.push('/driver/wallet')}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>My Wallet</span>
                </button>
                <button
                  onClick={() => router.push('/customer/wallet')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Switch to Customer</span>
                </button>
              </div>
              <div className={`rounded-xl p-4 shadow-sm border-2 ${isPremium ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    {isPremium && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{user.name}</span>
                      {isPremium && <PremiumBadge size="sm" variant="badge" />}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{user.rating || 4.5}</span>
                      <span className="mx-2">•</span>
                      <span>{user.completedJobs || 0} jobs</span>
                      {isPremium && (
                        <>
                          <span className="mx-2">•</span>
                          <Shield className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-600 font-medium">Verified</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{availableJobs.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applied</p>
                <p className="text-2xl font-bold text-gray-900">{appliedJobs.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
              </div>
              <Truck className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatINR(user.totalEarnings || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* GPS App Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <DriverAppDownload />
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 text-gray-900">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'available', label: 'Track Jobs', count: availableJobs.length },
                { key: 'applied', label: 'Applied', count: appliedJobs.length },
                { key: 'active', label: 'Active Jobs', count: activeJobs.length },
                { key: 'completed', label: 'Completed', count: completedJobs.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.key 
                        ? 'bg-blue-100 text-blue-600' 
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
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} jobs
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'available' 
                    ? 'Check back later for new job opportunities'
                    : `You don't have any ${activeTab} jobs at the moment`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getJobsForTab().map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
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
                            <User className="w-4 h-4 mr-1" />
                            <span>{job.customerName}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            <span>{job.customerPhone}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
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
                        <div className="text-sm text-gray-500 mt-1">
                          {job.distance}
                        </div>
                      </div>
                    </div>

                    {job.description && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{job.description}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {job.vehicleType && (
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            <Truck className="w-3 h-3 mr-1" />
                            {job.vehicleType}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        {activeTab === 'available' && (
                          <button
                            onClick={() => handleApplyForJob(job.id)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Apply Now</span>
                          </button>
                        )}
                        
                        {activeTab === 'active' && (
                          <button
                            onClick={() => handleCompleteJob(job.id)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all space-x-2"
                          >
                            <Flag className="w-4 h-4" />
                            <span>Mark Complete</span>
                          </button>
                        )}
                        
                        {activeTab === 'applied' && (
                          <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            Waiting for customer
                          </span>
                        )}
                        
                        {activeTab === 'completed' && (
                          <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </span>
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
      
      {/* Test Data Creator for Development */}
      <TestDataCreator />
      </div>
    </>
  );
}
