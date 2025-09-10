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
  Wallet,
  Search,
  Plus,
  MessageCircle,
  Filter,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Users
} from 'lucide-react';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import { useRouter } from 'next/navigation';
import TestDataCreator from '@/components/TestDataCreator';
import JobSyncListener from '@/components/JobSyncListener';

export default function CustomerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { jobs } = useJobs();
  const router = useRouter();

  if (!user || user.type !== 'customer') {
    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
    return null;
  }

  // Get jobs for the current customer
  const allCustomerJobs = jobs.filter(job => job.customerId === user.id);
  const activeJobs = allCustomerJobs.filter(job => job.status === 'open' || job.status === 'in-progress');
  const completedJobs = allCustomerJobs.filter(job => job.status === 'completed');
  
  // Calculate total spent
  const totalSpent = completedJobs.reduce((sum, job) => sum + (job.budget || 0), 0);

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
                <button className="text-gray-300 hover:text-white">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="text-gray-300 hover:text-white">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{user.name}</span>
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">C</span>
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
            <p className="text-gray-400">Here's what's happening with your shipments today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Posted Jobs</p>
                  <p className="text-2xl font-bold text-white">{allCustomerJobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-white">{formatINR(totalSpent)}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Jobs</p>
                  <p className="text-2xl font-bold text-white">{activeJobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedJobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* My Jobs Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">My Jobs</h2>
                  <button 
                    onClick={() => router.push('/customer/jobs/create')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Job</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search my jobs..."
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

                {allCustomerJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No jobs posted yet</h3>
                    <p className="text-gray-400 mb-4">Post your first job to get started</p>
                    <button 
                      onClick={() => router.push('/customer/jobs/create')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allCustomerJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-white">{job.title}</h3>
                            <p className="text-gray-400 text-sm">{job.pickup} → {job.delivery}</p>
                            <p className="text-green-400 font-semibold">{formatINR(job.budget)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            job.status === 'open' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {job.status}
                          </span>
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
                    <p className="text-red-200 text-sm">Available for payments</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-red-200" />
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => router.push('/customer/wallet')}
                    className="flex-1 bg-red-700 hover:bg-red-800 py-2 px-4 rounded text-sm font-medium"
                  >
                    Withdraw
                  </button>
                  <button 
                    onClick={() => router.push('/customer/wallet')}
                    className="flex-1 bg-white hover:bg-gray-100 text-red-600 py-2 px-4 rounded text-sm font-medium"
                  >
                    Add Funds
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/customer/jobs/create')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <Plus className="w-5 h-5 text-red-500" />
                    <span>Post New Job</span>
                  </button>
                  <button 
                    onClick={() => router.push('/customer/track')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span>Track Shipment</span>
                  </button>
                  <button 
                    onClick={() => router.push('/customer/drivers')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <Users className="w-5 h-5 text-red-500" />
                    <span>Find Drivers</span>
                  </button>
                  <button 
                    onClick={() => router.push('/map')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <Navigation className="w-5 h-5 text-red-500" />
                    <span>Driver Map</span>
                  </button>
                  <button 
                    onClick={() => router.push('/chat')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <MessageCircle className="w-5 h-5 text-red-500" />
                    <span>Messages</span>
                  </button>
                  <button 
                    onClick={() => router.push('/customer/social')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <MessageSquare className="w-5 h-5 text-red-500" />
                    <span>Customer Social</span>
                  </button>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white">2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white">Not set</span>
                  </div>
                </div>
              </div>

              {/* Account */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/customer/profile')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <User className="w-5 h-5 text-red-500" />
                    <span>Edit Profile</span>
                  </button>
                  <button 
                    onClick={() => router.push('/customer/settings')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <Settings className="w-5 h-5 text-red-500" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={() => {
                      // Add logout functionality
                      router.push('/');
                    }}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span>Logout</span>
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
