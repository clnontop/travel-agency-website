'use client';

import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Truck, 
  User, 
  Calendar,
  Package,
  Star,
  Phone
} from 'lucide-react';
import { Job } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import JobApplyButton from './JobApplyButton';
import JobApplications from './JobApplications';

interface JobCardProps {
  job: Job;
  index?: number;
  showApplications?: boolean;
}

export default function JobCard({ job, index = 0, showApplications = false }: JobCardProps) {
  const { user } = useAuth();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending-completion':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isCustomerView = user?.type === 'customer' && user.id === job.customerId;
  const isDriverView = user?.type === 'driver';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Job Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status.replace('-', ' ')}
              </span>
              {job.isPremiumCustomer && (
                <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium rounded-full">
                  Premium
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
            
            {/* Customer Info (for drivers) */}
            {isDriverView && (
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{job.customerName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{job.customerPhone}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatINR(job.budget)}
            </div>
            <div className="text-sm text-gray-500">Budget</div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="p-6 space-y-4">
        {/* Route */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 mb-1">Route</div>
            <div className="text-sm text-gray-600">
              <div className="mb-1">📍 <span className="font-medium">From:</span> {job.pickup}</div>
              <div>🎯 <span className="font-medium">To:</span> {job.delivery}</div>
            </div>
          </div>
        </div>

        {/* Job Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-gray-500">Posted</div>
              <div className="font-medium text-gray-900">{formatDate(job.createdAt)}</div>
            </div>
          </div>
          
          {job.deadline && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-gray-500">Deadline</div>
                <div className="font-medium text-gray-900">{formatDate(job.deadline)}</div>
              </div>
            </div>
          )}
          
          {job.vehicleType && (
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-500" />
              <div>
                <div className="text-gray-500">Vehicle</div>
                <div className="font-medium text-gray-900">{job.vehicleType}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" />
            <div>
              <div className="text-gray-500">Distance</div>
              <div className="font-medium text-gray-900">{job.distance}</div>
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        {job.specialRequirements && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900 mb-1">Special Requirements</div>
            <div className="text-sm text-gray-600">{job.specialRequirements}</div>
          </div>
        )}

        {/* Applications Count (for customers) */}
        {isCustomerView && job.appliedDrivers && job.appliedDrivers.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {job.appliedDrivers.length} driver{job.appliedDrivers.length !== 1 ? 's' : ''} applied
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        {isDriverView && (
          <JobApplyButton job={job} className="w-full" />
        )}
        
        {isCustomerView && job.appliedDrivers && job.appliedDrivers.length > 0 && (
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            View Applications ({job.appliedDrivers.length})
          </button>
        )}
      </div>

      {/* Job Applications (for customers) */}
      {showApplications && isCustomerView && (
        <div className="border-t border-gray-200">
          <JobApplications jobId={job.id} />
        </div>
      )}
    </motion.div>
  );
}
