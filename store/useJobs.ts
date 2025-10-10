import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Job {
  id: string;
  title: string;
  description: string;
  pickup: string;
  delivery: string;
  budget: number;
  distance: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  isPremiumCustomer?: boolean;
  status: 'open' | 'in-progress' | 'pending-completion' | 'completed' | 'cancelled';
  createdAt: Date;
  deadline?: Date;
  vehicleType?: string;
  specialRequirements?: string;
  appliedDrivers?: string[];
  selectedDriver?: string;
  selectedDriverName?: string;
  selectedDriverPhone?: string;
  completedAt?: Date;
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
}

interface JobsState {
  jobs: Job[];
  isLoading: boolean;
  
  // Actions
  createJob: (jobData: Omit<Job, 'id' | 'status' | 'createdAt' | 'appliedDrivers'>) => Job;
  addJobFromSync: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  deleteJob: (jobId: string) => void;
  applyForJob: (jobId: string, driverId: string) => void;
  selectDriver: (jobId: string, driverId: string, driverName?: string, driverPhone?: string) => void;
  completeJob: (jobId: string) => void;
  confirmCompletion: (jobId: string) => void;
  updateDriverLocation: (jobId: string, location: { lat: number; lng: number }) => void;
  getJobsByStatus: (status: Job['status']) => Job[];
  getJobsByCustomer: (customerId: string) => Job[];
  getAvailableJobs: () => Job[];
  getActiveJobsForCustomer: (customerId: string) => Job[];
  clearAllJobs: () => void;
}

export const useJobs = create<JobsState>()(
  persist(
    (set, get) => ({
      jobs: [],
      isLoading: false,

      createJob: (jobData) => {
        const newJob: Job = {
          id: `job-${Date.now()}`,
          ...jobData,
          status: 'open',
          createdAt: new Date(),
          appliedDrivers: []
        };
        
        set(state => ({
          jobs: [newJob, ...state.jobs]
        }));

        // Broadcast the job creation
        if (typeof window !== 'undefined') {
          const broadcastData = {
            type: 'JOB_CREATED',
            data: { job: newJob },
            timestamp: new Date().toISOString(),
            source: 'trinck-app'
          };
          
          localStorage.setItem('trinck-broadcast', JSON.stringify(broadcastData));
          window.dispatchEvent(new CustomEvent('trinck-data-change', { detail: broadcastData }));
        }

        return newJob;
      },

      addJobFromSync: (job) => {
        set(state => {
          const jobExists = state.jobs.some(existingJob => existingJob.id === job.id);
          if (!jobExists) {
            return { jobs: [job, ...state.jobs] };
          }
          return state;
        });
      },

      updateJob: (jobId, updates) => {
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === jobId ? { ...job, ...updates } : job
          )
        }));
      },

      deleteJob: (jobId) => {
        set(state => ({
          jobs: state.jobs.filter(job => job.id !== jobId)
        }));
      },

      applyForJob: (jobId, driverId) => {
        set(state => ({
          jobs: state.jobs.map(job => {
            if (job.id === jobId) {
              const currentAppliedDrivers = job.appliedDrivers || [];
              // Prevent duplicate applications
              if (currentAppliedDrivers.includes(driverId)) {
                return job; // No change if already applied
              }
              return { 
                ...job, 
                appliedDrivers: [...currentAppliedDrivers, driverId]
              };
            }
            return job;
          })
        }));
        
        const updatedJob = get().jobs.find(job => job.id === jobId);
        
        if (typeof window !== 'undefined') {
          const broadcastData = {
            type: 'JOB_APPLICATION',
            data: { jobId, driverId, job: updatedJob },
            timestamp: new Date().toISOString(),
            source: 'trinck-app'
          };
          
          localStorage.setItem('trinck-broadcast', JSON.stringify(broadcastData));
          window.dispatchEvent(new CustomEvent('trinck-data-change', { 
            detail: broadcastData
          }));
        }
        
        console.log(`✅ Driver ${driverId} applied for job ${jobId}`, updatedJob);
      },

      selectDriver: (jobId, driverId, driverName, driverPhone) => {
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  selectedDriver: driverId,
                  selectedDriverName: driverName,
                  selectedDriverPhone: driverPhone,
                  status: 'in-progress'
                }
              : job
          )
        }));
        
        if (typeof window !== 'undefined') {
          const broadcastData = {
            type: 'JOB_SELECTED',
            data: { jobId, driverId, driverName, driverPhone },
            timestamp: new Date().toISOString(),
            source: 'trinck-app'
          };
          
          localStorage.setItem('trinck-broadcast', JSON.stringify(broadcastData));
          window.dispatchEvent(new CustomEvent('trinck-data-change', { detail: broadcastData }));
        }
        
        console.log(`✅ Driver ${driverName} (${driverId}) hired for job ${jobId}`);
      },

      completeJob: (jobId) => {
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  status: 'pending-completion'
                }
              : job
          )
        }));
      },

      confirmCompletion: (jobId) => {
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  status: 'completed',
                  completedAt: new Date()
                }
              : job
          )
        }));
      },

      getJobsByStatus: (status) => {
        return get().jobs.filter(job => job.status === status);
      },

      getJobsByCustomer: (customerId) => {
        return get().jobs.filter(job => job.customerId === customerId);
      },

      getAvailableJobs: () => {
        return get().jobs
          .filter(job => job.status === 'open')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getActiveJobsForCustomer: (customerId) => {
        return get().jobs.filter(job => 
          job.customerId === customerId && 
          job.status === 'in-progress' && 
          job.selectedDriver
        );
      },

      updateDriverLocation: (jobId, location) => {
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  driverLocation: {
                    ...location,
                    timestamp: new Date()
                  }
                }
              : job
          )
        }));
        
        // Broadcast location update
        if (typeof window !== 'undefined') {
          const broadcastData = {
            type: 'DRIVER_LOCATION_UPDATE',
            data: { jobId, location: { ...location, timestamp: new Date() } },
            timestamp: new Date().toISOString(),
            source: 'trinck-app'
          };
          
          localStorage.setItem('trinck-broadcast', JSON.stringify(broadcastData));
          window.dispatchEvent(new CustomEvent('trinck-data-change', { detail: broadcastData }));
        }
      },

      clearAllJobs: () => {
        set({ jobs: [] });
      }
    }),
    {
      name: 'jobs-storage',
      partialize: (state) => ({ jobs: state.jobs }),
    }
  )
);
