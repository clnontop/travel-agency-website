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
  MessageSquare,
  Bell,
  Filter,
  Zap,
  Users,
  Crown,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/store/useAuth';
import { useJobs } from '@/store/useJobs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PaymentReceiptModal from '@/components/PaymentReceiptModal';
import { formatINR } from '@/utils/currency';
import TestDataCreator from '@/components/TestDataCreator';
import JobSyncListener from '@/components/JobSyncListener';
import JobApplicationsListener from '@/components/JobApplicationsListener';

export default function CustomerDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<any>(null);
  const { user } = useAuth();
  const { jobs, createJob } = useJobs();
  const router = useRouter();

  // SIMPLE AUTH CHECK - PREVENT HYDRATION ERROR
  if (!user) {
    // Always show loading during hydration to prevent mismatch
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading dashboard...</div>
    </div>;
  }

  // Get jobs for the current customer (user is guaranteed to exist here)
  const allCustomerJobs = jobs.filter(job => job.customerId === user!.id);
  const activeJobs = allCustomerJobs.filter(job => job.status === 'open' || job.status === 'in-progress');
  const completedJobs = allCustomerJobs.filter(job => job.status === 'completed');
  
  // Calculate total spent
  const totalSpent = completedJobs.reduce((sum, job) => sum + (job.budget || 0), 0);

  // Quick job posting function
  const handleQuickJobPost = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const jobData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      pickup: formData.get('pickup') as string,
      delivery: formData.get('delivery') as string,
      budget: parseInt(formData.get('budget') as string),
      distance: formData.get('distance') as string || 'TBD',
      customerId: user!.id,
      customerName: user!.name,
      customerPhone: user!.phone,
      vehicleType: formData.get('vehicleType') as string
    };

    createJob(jobData);
    setShowJobForm(false);
    
    // Reset form
    (e.target as HTMLFormElement).reset();
    
    toast.success('🎉 Job posted successfully! Drivers can now see and apply for your job.');
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
                <Link href="/customer/map" className="text-gray-300 hover:text-white flex items-center space-x-1">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">Find Drivers</span>
                </Link>
                <Link href="/customer/track-driver" className="text-gray-300 hover:text-white flex items-center space-x-1">
                  <Navigation className="w-5 h-5" />
                  <span className="text-sm">Track Driver</span>
                </Link>
                <button className="text-gray-300 hover:text-white">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="text-gray-300 hover:text-white">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{user!.name}</span>
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user!.name}!</h1>
                <p className="text-gray-400">Here's what's happening with your shipments today.</p>
              </div>
              <button
                onClick={() => setShowJobForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Post New Job</span>
              </button>
            </div>
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
                    onClick={() => router.push('/jobs/post')}
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
                      onClick={() => router.push('/jobs/post')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
                    >
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allCustomerJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-white">{job.title}</h3>
                            <p className="text-gray-400 text-sm">{job.pickup} → {job.delivery}</p>
                            <p className="text-green-400 font-semibold">{formatINR(job.budget)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            job.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                            job.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        
                        {/* Applied Drivers Section */}
                        {job.appliedDrivers && job.appliedDrivers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">
                              {job.appliedDrivers.length} driver(s) applied
                            </p>
                            <div className="flex space-x-2">
                              {job.status === 'open' && (
                                <button
                                  onClick={async () => {
                                    // Process payment with 2%+2% fees
                                    const { processJobPayment } = useAuth.getState();
                                    const { selectDriver } = useJobs.getState();
                                    
                                    const driverId = job.appliedDrivers![0];
                                    const result = await processJobPayment(job.budget, driverId, job.id);
                                    
                                    if (result.success) {
                                      // Hire the driver after successful payment
                                      selectDriver(job.id, driverId, `Driver ${driverId}`, '+91-9876543210');
                                      toast.success(result.message);
                                      
                                      // Show payment receipt
                                      if (result.receipt) {
                                        setPaymentReceipt(result.receipt);
                                        setShowReceiptModal(true);
                                      }
                                    } else {
                                      toast.error(result.message);
                                    }
                                  }}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                                >
                                  Pay & Hire (₹{Math.round(job.budget * 1.02)})
                                </button>
                              )}
                              {job.status === 'in-progress' && job.selectedDriverName && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-green-400">
                                    Driver: {job.selectedDriverName}
                                  </span>
                                  <button
                                    onClick={() => router.push('/customer/track-driver')}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                                  >
                                    Track Live
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
                
                {/* Low Balance Warning */}
                {(user.wallet?.balance || 0) < 5000 && (
                  <div className="mb-4 p-3 bg-red-700/50 rounded-lg border border-red-500/30">
                    <p className="text-red-100 text-sm">
                      ⚠️ Low balance! Add funds to hire drivers. Remember: you pay job amount + 2% platform fee.
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      const { addFunds } = useAuth.getState();
                      addFunds(10000);
                      toast.success('₹10,000 added to wallet!');
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 text-red-600 py-2 px-4 rounded text-sm font-medium"
                  >
                    Add ₹10K
                  </button>
                  <button 
                    onClick={() => {
                      const { addFunds } = useAuth.getState();
                      addFunds(25000);
                      toast.success('₹25,000 added to wallet!');
                    }}
                    className="flex-1 bg-red-700 hover:bg-red-800 py-2 px-4 rounded text-sm font-medium"
                  >
                    Add ₹25K
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
                    onClick={() => router.push('/jobs/post')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30">
                      <Plus className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                    </div>
                    <span className="font-medium">Post New Job</span>
                  </button>
                  <button 
                    onClick={() => router.push('/customer/track-shipment')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30">
                      <Navigation className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <span className="font-medium">Track Shipment</span>
                  </button>
                  <button 
                    onClick={() => router.push('/customer/find-drivers')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30">
                      <Users className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                    </div>
                    <span className="font-medium">Find Drivers</span>
                  </button>
                  <button 
                    onClick={() => router.push('/customer/driver-map')}
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
                    onClick={() => router.push('/customer/social')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-pink-600 hover:to-pink-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center group-hover:bg-pink-500/30">
                      <MessageSquare className="w-4 h-4 text-pink-400 group-hover:text-pink-300" />
                    </div>
                    <span className="font-medium">Customer Social</span>
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
                  Get priority support, advanced features, and exclusive benefits!
                </p>
                <button 
                  onClick={() => router.push('/customer/premium')}
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
                    onClick={() => router.push('/customer/profile')}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30">
                      <User className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    </div>
                    <span className="font-medium">Edit Profile</span>
                  </button>
                  <button 
                    onClick={() => router.push('/customer/wallet')}
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
      
      {/* Job Posting Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Post New Job</h2>
              <button
                onClick={() => setShowJobForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleQuickJobPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Transport goods from Mumbai to Delhi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="Describe what needs to be transported..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pickup Location</label>
                  <input
                    type="text"
                    name="pickup"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Mumbai, Maharashtra"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Delivery Location</label>
                  <input
                    type="text"
                    name="delivery"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., Delhi, India"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget (₹)</label>
                  <input
                    type="number"
                    name="budget"
                    required
                    min="100"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., 5000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini Truck">Mini Truck</option>
                    <option value="Tempo">Tempo</option>
                    <option value="Container">Container</option>
                    <option value="Trailer">Trailer</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Distance (optional)</label>
                <input
                  type="text"
                  name="distance"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., 1200 km"
                />
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Post Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Job Applications Listener for real-time applications */}
      <JobApplicationsListener />
      
      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receipt={paymentReceipt}
      />
    </>
  );
}
