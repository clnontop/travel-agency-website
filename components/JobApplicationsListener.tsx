'use client';

import { useEffect, useState } from 'react';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { useDrivers } from '@/store/useDrivers';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Star, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface JobApplication {
  jobId: string;
  driverId: string;
  jobTitle: string;
  timestamp: Date;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
}

export default function JobApplicationsListener() {
  const { jobs, selectDriver } = useJobs();
  const { user } = useAuth();
  const { drivers, getDriver } = useDrivers();
  const [recentApplications, setRecentApplications] = useState<JobApplication[]>([]);
  const [showApplications, setShowApplications] = useState(false);

  // Listen for job applications
  useEffect(() => {
    const handleJobApplication = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      if (type === 'JOB_APPLICATION' && user?.type === 'customer') {
        const { jobId, driverId, job } = data;
        
        // Check if this is for the current customer's job
        if (job && job.customerId === user.id) {
          const driver = getDriver(driverId);
          
          const application: JobApplication = {
            jobId,
            driverId,
            jobTitle: job.title,
            timestamp: new Date(),
            driverName: driver?.name || `Driver ${driverId}`,
            driverPhone: driver?.phone || 'N/A',
            driverRating: driver?.rating || 4.0
          };
          
          setRecentApplications(prev => [application, ...prev.slice(0, 4)]); // Keep last 5
          setShowApplications(true);
          
          // Auto-hide after 10 seconds
          setTimeout(() => {
            setShowApplications(false);
          }, 10000);
        }
      }
    };

    window.addEventListener('trinck-data-change', handleJobApplication as EventListener);
    
    return () => {
      window.removeEventListener('trinck-data-change', handleJobApplication as EventListener);
    };
  }, [user, getDriver]);

  // Get applications for current customer's jobs
  const customerJobApplications = jobs
    .filter(job => job.customerId === user?.id && (job.appliedDrivers?.length || 0) > 0)
    .map(job => ({
      job,
      applications: job.appliedDrivers?.map(driverId => {
        const driver = getDriver(driverId);
        return {
          driverId,
          driverName: driver?.name || `Driver ${driverId}`,
          driverPhone: driver?.phone || 'N/A',
          driverRating: driver?.rating || 4.0,
          driverAvatar: driver?.avatar || null
        };
      }) || []
    }));

  const handleSelectDriver = (jobId: string, driverId: string) => {
    selectDriver(jobId, driverId);
    toast.success('Driver selected successfully!');
  };

  if (user?.type !== 'customer') return null;

  return (
    <>
      {/* Real-time Application Notifications */}
      <AnimatePresence>
        {showApplications && recentApplications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-lg shadow-2xl max-w-sm"
          >
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">New Application!</span>
            </div>
            <div className="text-sm">
              <p><strong>{recentApplications[0].driverName}</strong> applied for</p>
              <p className="truncate">"{recentApplications[0].jobTitle}"</p>
              <div className="flex items-center mt-1">
                <Star className="w-3 h-3 text-yellow-300 mr-1" />
                <span>{recentApplications[0].driverRating}/5</span>
              </div>
            </div>
            <button
              onClick={() => setShowApplications(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Applications Panel */}
      {customerJobApplications.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="w-5 h-5 text-blue-400 mr-2" />
            Job Applications ({customerJobApplications.reduce((acc, job) => acc + job.applications.length, 0)})
          </h3>
          
          <div className="space-y-4">
            {customerJobApplications.map(({ job, applications }) => (
              <div key={job.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{job.title}</h4>
                  <span className="text-sm text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {applications.length} application{applications.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {applications.map((application) => (
                    <motion.div
                      key={application.driverId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {application.driverName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{application.driverName}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <Phone className="w-3 h-3" />
                            <span>{application.driverPhone}</span>
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span>{application.driverRating}/5</span>
                          </div>
                        </div>
                      </div>
                      
                      {job.status === 'open' && (
                        <button
                          onClick={() => handleSelectDriver(job.id, application.driverId)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Select
                        </button>
                      )}
                      
                      {job.selectedDriver === application.driverId && (
                        <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
                          Selected
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
