'use client';

import { useState } from 'react';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { useDrivers } from '@/store/useDrivers';
import { User, Phone, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SimpleJobApplications() {
  const { jobs, selectDriver } = useJobs();
  const { user } = useAuth();
  const { getDriver } = useDrivers();
  const [isClient, setIsClient] = useState(false);

  // Simple client-side check without useEffect
  if (typeof window !== 'undefined' && !isClient) {
    setIsClient(true);
  }

  if (!isClient || user?.type !== 'customer') {
    return null;
  }

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

  if (customerJobApplications.length === 0) {
    return null;
  }

  return (
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
                <div
                  key={application.driverId}
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
