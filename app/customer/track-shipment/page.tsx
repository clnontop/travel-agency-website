'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, Clock, Navigation, Phone, MessageCircle, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useJobs } from '@/store/useJobs';
import { useDrivers } from '@/store/useDrivers';
import { useGPS } from '@/store/useGPS';
import { useRouter } from 'next/navigation';
import GPSTracker from '@/components/GPSTracker';
import { formatINR } from '@/utils/currency';

export default function TrackShipmentPage() {
  const { user } = useAuth();
  const { jobs } = useJobs();
  const { drivers } = useDrivers();
  const { getDriverLocation, canCustomerTrackDriver } = useGPS();
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  if (!user || user.type !== 'customer') {
    router.push('/auth/login');
    return null;
  }

  // Get customer's jobs with hired drivers
  const customerJobs = jobs.filter(job => 
    job.customerId === user.id && 
    job.selectedDriver && 
    (job.status === 'in-progress' || job.status === 'completed')
  );

  const activeJobs = customerJobs.filter(job => job.status === 'in-progress');
  const completedJobs = customerJobs.filter(job => job.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Shipments</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor your hired truckers and their real-time locations during active deliveries.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{activeJobs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tracked Drivers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeJobs.filter(job => 
                    canCustomerTrackDriver(user.id, job.selectedDriver!, job.id)
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedJobs.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Shipments */}
        {activeJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Shipments</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeJobs.map((job, index) => {
                const driver = drivers.find(d => d.id === job.selectedDriver);
                const driverLocation = getDriverLocation(job.selectedDriver!);
                const canTrack = canCustomerTrackDriver(user.id, job.selectedDriver!, job.id);

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-gray-900"
                  >
                    {/* Job Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-gray-600">{job.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-green-600">In Progress</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.pickup} → {job.delivery}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="text-lg font-semibold text-green-600">
                        {formatINR(job.budget)}
                      </div>
                    </div>

                    {/* Driver Info */}
                    {driver && (
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {driver.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                              <div className={`w-2 h-2 rounded-full ${
                                driver.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                            <p className="text-sm text-gray-600">{driver.vehicleType}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-600">⭐ {driver.rating}</span>
                              <span className="text-sm text-gray-600">{driver.completedJobs} jobs</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Phone className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <MessageCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GPS Tracking */}
                    <div className="p-6">
                      <GPSTracker
                        jobId={job.id}
                        driverId={job.selectedDriver!}
                        customerId={user.id}
                        isActive={true}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recent Completed Shipments */}
        {completedJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Completed Shipments</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-gray-900">
              <div className="divide-y divide-gray-100">
                {completedJobs.slice(0, 5).map((job) => {
                  const driver = drivers.find(d => d.id === job.selectedDriver);
                  
                  return (
                    <div key={job.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              Completed
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{job.pickup} → {job.delivery}</span>
                            <span>•</span>
                            <span>{driver?.name}</span>
                            <span>•</span>
                            <span>{formatINR(job.budget)}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {customerJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-12"
          >
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Shipments Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't hired any drivers yet. Post a job to get started.
            </p>
            <button
              onClick={() => router.push('/jobs/post')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Your First Job
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
