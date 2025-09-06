'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Truck,
  Filter,
  Search,
  CreditCard
} from 'lucide-react';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import JobApplications from '@/components/JobApplications';
import JobCompletionConfirmation from '@/components/JobCompletionConfirmation';
import { useRouter } from 'next/navigation';

export default function CustomerJobs() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [completionJobId, setCompletionJobId] = useState<string | null>(null);
  
  const { jobs, getJobsByCustomer } = useJobs();
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.type !== 'customer') {
    router.push('/auth/login');
    return null;
  }

  const customerJobs = getJobsByCustomer(user.id);

  // Check for jobs pending completion and auto-show confirmation modal
  useEffect(() => {
    const pendingCompletionJobs = customerJobs.filter(job => job.status === 'pending-completion');
    if (pendingCompletionJobs.length > 0 && !completionJobId) {
      // Show the first pending completion job
      setCompletionJobId(pendingCompletionJobs[0].id);
    }
  }, [customerJobs, completionJobId]);
  
  const filteredJobs = customerJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.delivery.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'active':
        return (job.status === 'open' || job.status === 'in-progress') && matchesSearch;
      case 'completed':
        return job.status === 'completed' && matchesSearch;
      case 'cancelled':
        return job.status === 'cancelled' && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
              <p className="text-gray-600 mt-2">
                Manage your transportation requests and track applications
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/customer/pay')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Pay Drivers</span>
              </button>
              <button
                onClick={() => router.push('/jobs/create')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Post New Job</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 text-gray-900">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              {['active', 'completed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'active' 
                    ? "You don't have any active jobs yet."
                    : `No ${activeTab} jobs found.`
                  }
                </p>
                {activeTab === 'active' && (
                  <button
                    onClick={() => router.push('/jobs/create')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Your First Job</span>
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all ${
                    selectedJobId === job.id 
                      ? 'border-blue-500 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {job.title}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-green-500" />
                            <span className="font-medium">From:</span>
                            <span className="ml-1">{job.pickup}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-red-500" />
                            <span className="font-medium">To:</span>
                            <span className="ml-1">{job.delivery}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 mb-2">
                          {formatINR(job.budget)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1 capitalize">{job.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{job.appliedDrivers?.length || 0} applications</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.distance}
                      </div>
                    </div>

                    {(job.appliedDrivers?.length || 0) > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center text-sm text-blue-700">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            {job.appliedDrivers?.length} driver{(job.appliedDrivers?.length || 0) > 1 ? 's' : ''} applied
                          </span>
                          {!job.selectedDriver && (
                            <span className="ml-2 text-blue-600">• Click to review</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Job Applications Panel */}
          <div className="lg:sticky lg:top-8">
            {selectedJobId ? (
              <JobApplications jobId={selectedJobId} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Job
                </h3>
                <p className="text-gray-500">
                  Click on a job to view driver applications and manage your requests
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Completion Confirmation Modal */}
      {completionJobId && (() => {
        const completionJob = jobs.find(job => job.id === completionJobId);
        return completionJob ? (
          <JobCompletionConfirmation
            job={completionJob}
            onClose={() => setCompletionJobId(null)}
            onConfirm={() => {
              // Refresh the page or update state as needed
              setCompletionJobId(null);
            }}
          />
        ) : null;
      })()}
    </div>
  );
}
