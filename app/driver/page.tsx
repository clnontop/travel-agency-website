'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Truck,
  User,
  Phone,
  Star,
  Package,
  Navigation,
  Flag,
  Search,
  Filter,
  Bell,
  MessageSquare,
  MessageCircle,
  Settings,
  LogOut,
  Users,
  Zap,
  Crown,
  Wallet
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import { useJobs } from '@/store/useJobs';
import { formatINR } from '@/utils/currency';
import toast from 'react-hot-toast';
import TestDataCreator from '@/components/TestDataCreator';
import JobSyncListener from '@/components/JobSyncListener';

export default function DriverDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const { jobs, applyForJob, completeJob } = useJobs();
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.type !== 'driver') {
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

  // Calculate total earnings
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.budget || 0), 0);

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
    } catch (error) {
      toast.error('Failed to complete job');
    }
  };

  return (
    <>
      <JobSyncListener />
      <TestDataCreator />
      <div className="min-h-screen bg-gray-900">
        {/* Navigation Header */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-bold text-xl">TRINK</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/driver/location" className="text-gray-300 hover:text-white flex items-center space-x-1">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">Share Location</span>
                </Link>
                <button className="text-gray-300 hover:text-white">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="text-gray-300 hover:text-white">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{user.name}</span>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">D</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h1>
            <p className="text-gray-400">Find jobs, manage applications, and complete deliveries.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Available Jobs</p>
                  <p className="text-2xl font-bold text-white">{availableJobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Applied Jobs</p>
                  <p className="text-2xl font-bold text-white">{appliedJobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Jobs</p>
                  <p className="text-2xl font-bold text-white">{activeJobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">{formatINR(totalEarnings)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Available Jobs Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Available Jobs</h2>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search available jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </button>
                </div>

                {availableJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No available jobs</h3>
                    <p className="text-gray-400 mb-4">Check back later for new job opportunities</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-white">{job.title}</h3>
                            <p className="text-gray-400 text-sm">{job.pickup} → {job.delivery}</p>
                            <p className="text-green-400 font-semibold">{formatINR(job.budget)}</p>
                          </div>
                          <button
                            onClick={() => handleApplyForJob(job.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No recent activity</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Wallet Balance */}
              <div className="bg-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-red-100 text-sm">Wallet Balance</p>
                    <p className="text-2xl font-bold">{formatINR(user.wallet?.balance || 0)}</p>
                    <p className="text-red-200 text-sm">Available for withdrawal</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-200" />
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => router.push('/driver/wallet')}
                    className="flex-1 bg-red-700 hover:bg-red-800 py-2 px-4 rounded text-sm font-medium"
                  >
                    Withdraw
                  </button>
                  <button 
                    onClick={() => router.push('/driver/wallet')}
                    className="flex-1 bg-white hover:bg-gray-100 text-red-600 py-2 px-4 rounded text-sm font-medium"
                  >
                    View History
                  </button>
                </div>
              </div>

              {/* Mobile App Download */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 text-blue-200 mr-2" />
                    <h3 className="text-lg font-semibold">Driver Mobile App</h3>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-blue-100 text-sm mb-4">
                  Download our mobile app for real-time GPS tracking, job notifications, and seamless customer communication.
                </p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => router.push('/driver/profile')}
                    className="flex-1 bg-white text-blue-600 py-2 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm"
                  >
                    Get QR Code
                  </button>
                  <button 
                    onClick={() => window.open('/driver-app/', '_blank')}
                    className="flex-1 bg-blue-800 hover:bg-blue-900 py-2 px-4 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Open App
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/customer/jobs')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30">
                      <Search className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <span className="font-medium">Browse Jobs</span>
                  </button>
                  <button 
                    onClick={() => router.push('/driver/profile')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30">
                      <User className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                    </div>
                    <span className="font-medium">Update Profile</span>
                  </button>
                  <button 
                    onClick={() => router.push('/map')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30">
                      <MapPin className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                    </div>
                    <span className="font-medium">Driver Map</span>
                  </button>
                  <button 
                    onClick={() => router.push('/chat')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-indigo-600 hover:to-indigo-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/30">
                      <MessageCircle className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                    </div>
                    <span className="font-medium">Messages</span>
                  </button>
                  <button 
                    onClick={() => router.push('/driver/wallet')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-emerald-600 hover:to-emerald-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30">
                      <DollarSign className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                    </div>
                    <span className="font-medium">View Earnings</span>
                  </button>
                  <button 
                    onClick={() => router.push('/driver/location')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center group-hover:bg-gray-500/30">
                      <MapPin className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                    </div>
                    <span className="font-medium">Location Settings</span>
                  </button>
                </div>
              </div>

              {/* Driver Stats */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Driver Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-white">{user.rating || '4.5'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed Jobs</span>
                    <span className="text-white">{completedJobs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white">2025</span>
                  </div>
                </div>
              </div>

              {/* Premium Upgrade */}
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Crown className="w-6 h-6 text-yellow-200 mr-2" />
                    <h3 className="text-lg font-semibold">Go Premium</h3>
                  </div>
                  <Star className="w-5 h-5 text-yellow-200" />
                </div>
                <p className="text-yellow-100 text-sm mb-4">
                  Get priority placement, verified badge, and earn more with premium!
                </p>
                <button 
                  onClick={() => router.push('/driver/premium')}
                  className="w-full bg-white text-orange-600 py-2 px-4 rounded-lg font-semibold hover:bg-yellow-50 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>

              {/* Account */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 text-blue-400 mr-2" />
                  Account
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push('/driver/profile')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30">
                      <User className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <span className="font-medium">Edit Profile</span>
                  </button>
                  <button 
                    onClick={() => router.push('/driver/wallet')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center group-hover:bg-gray-500/30">
                      <Wallet className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
                    </div>
                    <span className="font-medium">Wallet</span>
                  </button>
                  <button 
                    onClick={() => {
                      router.push('/');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30">
                      <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
