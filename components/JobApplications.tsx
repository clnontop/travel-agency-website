'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone,
  MessageCircle,
  Truck,
  Calendar
} from 'lucide-react';
import { useJobs, Job } from '@/store/useJobs';
import { useDrivers } from '@/store/useDrivers';
import { useAuth } from '@/store/useAuth';
import PremiumBadge, { PremiumStatusIndicator } from './PremiumBadge';
import { formatINR } from '@/utils/currency';
import PayDriverButton from './PayDriverButton';
import toast from 'react-hot-toast';

interface Driver {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  vehicleType: string;
  phone: string;
  avatar?: string;
}

// Mock driver data - in a real app, this would come from an API
const mockDrivers: Driver[] = [
  {
    id: 'driver1',
    name: 'Rajesh Kumar',
    rating: 4.8,
    completedJobs: 156,
    vehicleType: 'Truck',
    phone: '+91 98765 43210',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: 'driver2',
    name: 'Amit Singh',
    rating: 4.6,
    completedJobs: 89,
    vehicleType: 'Van',
    phone: '+91 87654 32109',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: 'driver3',
    name: 'Suresh Patel',
    rating: 4.9,
    completedJobs: 234,
    vehicleType: 'Pickup',
    phone: '+91 76543 21098',
    avatar: '/api/placeholder/40/40'
  }
];

interface JobApplicationsProps {
  jobId: string;
}

export default function JobApplications({ jobId }: JobApplicationsProps) {
  const { jobs, selectDriver } = useJobs();
  const { user } = useAuth();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const job = jobs.find(j => j.id === jobId);
  
  if (!job || !user || user.type !== 'customer' || job.customerId !== user.id) {
    return null;
  }

  const appliedDrivers = job.appliedDrivers || [];
  const applicantDrivers = mockDrivers.filter(driver => 
    appliedDrivers.includes(driver.id)
  );

  const handleAcceptDriver = async (driverId: string) => {
    try {
      selectDriver(jobId, driverId);
      setSelectedDriverId(driverId);
      toast.success('Driver selected successfully!');
    } catch (error) {
      toast.error('Failed to select driver');
    }
  };

  const handleRejectDriver = (driverId: string) => {
    // In a real app, you might want to remove them from appliedDrivers
    toast.success('Driver application rejected');
  };

  if (appliedDrivers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-500">
            Drivers haven't applied for this job yet. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Driver Applications ({appliedDrivers.length})
        </h3>
        <p className="text-gray-600">
          Review and select the best driver for your job
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {applicantDrivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6"
          >
            <div className="flex items-start justify-between">
              {/* Driver Info */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {driver.name.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {driver.name}
                    </h4>
                    {job.selectedDriver === driver.id && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{driver.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{driver.completedJobs} jobs</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span>{driver.vehicleType}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{driver.phone}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {job.selectedDriver === driver.id ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-green-600 font-medium">
                      Driver Selected
                    </span>
                    {job.status === 'in-progress' && (
                      <PayDriverButton
                        driverId={driver.id}
                        driverName={driver.name}
                        amount={job.budget}
                        description={`Payment for job: ${job.title}`}
                        size="sm"
                      />
                    )}
                  </div>
                ) : job.selectedDriver ? (
                  <span className="text-sm text-gray-500">
                    Another driver selected
                  </span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRejectDriver(driver.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAcceptDriver(driver.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Available immediately</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>5km from pickup</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Applied 2 hours ago</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Job Summary */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{job.title}</h4>
            <p className="text-sm text-gray-600">
              {job.pickup} → {job.delivery}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatINR(job.budget)}
            </div>
            <div className="text-sm text-gray-600">
              {job.distance}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
