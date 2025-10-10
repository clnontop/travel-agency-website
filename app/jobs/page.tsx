'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Truck,
  ArrowLeft,
  SlidersHorizontal
} from 'lucide-react';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import JobCard from '@/components/JobCard';
import { formatINR } from '@/utils/currency';

export default function JobsPage() {
  const { jobs, getAvailableJobs } = useJobs();
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high-budget' | 'nearby'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'distance'>('newest');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.type !== 'driver') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  if (!user || user.type !== 'driver') {
    return null;
  }

  const availableJobs = getAvailableJobs();

  // Filter jobs based on search and filters
  const filteredJobs = availableJobs
    .filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.delivery.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (filterType) {
        case 'high-budget':
          return job.budget >= 5000; // High budget jobs (₹5000+)
        case 'nearby':
          // In a real app, this would filter by location
          return true;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return b.budget - a.budget;
        case 'distance':
          // In a real app, this would sort by actual distance
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-300" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Available Jobs</h1>
                <p className="text-sm text-gray-400">{filteredJobs.length} jobs available</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-400">Your Balance</p>
                <p className="font-semibold text-green-400">{formatINR(user.wallet.balance)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search jobs by title, location, or description..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="appearance-none bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="all">All Jobs</option>
                <option value="high-budget">High Budget (₹5000+)</option>
                <option value="nearby">Nearby</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="newest">Newest First</option>
                <option value="budget">Highest Budget</option>
                <option value="distance">Nearest</option>
              </select>
              <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Jobs</p>
                  <p className="text-xl font-bold text-white">{availableJobs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Avg. Budget</p>
                  <p className="text-xl font-bold text-white">
                    {availableJobs.length > 0 
                      ? formatINR(Math.round(availableJobs.reduce((sum, job) => sum + job.budget, 0) / availableJobs.length))
                      : formatINR(0)
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">New Today</p>
                  <p className="text-xl font-bold text-white">
                    {availableJobs.filter(job => {
                      const today = new Date();
                      const jobDate = new Date(job.createdAt);
                      return jobDate.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">High Budget</p>
                  <p className="text-xl font-bold text-white">
                    {availableJobs.filter(job => job.budget >= 5000).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Jobs Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? "Try adjusting your search terms or filters"
                  : "No jobs are available at the moment. Check back later!"
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
