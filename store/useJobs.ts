import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { realTimeSync } from '../lib/realTimeSync';

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
  status: 'open' | 'in-progress' | 'pending-completion' | 'completed' | 'cancelled';
  createdAt: Date;
  deadline?: Date;
  vehicleType?: string;
  specialRequirements?: string;
  appliedDrivers?: string[];
  selectedDriver?: string;
  completedAt?: Date;
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
  selectDriver: (jobId: string, driverId: string) => void;
  completeJob: (jobId: string) => void;
  confirmCompletion: (jobId: string) => void;
  getJobsByStatus: (status: Job['status']) => Job[];
  getJobsByCustomer: (customerId: string) => Job[];
  getAvailableJobs: () => Job[];
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

        // Broadcast job to all drivers across all browsers in real-time
        realTimeSync.broadcast('job_created', {
          job: newJob,
          customerName: newJob.customerName
        });

        console.log('🚀 New job created and broadcasted to all drivers:', {
          jobId: newJob.id,
          title: newJob.title,
          customer: newJob.customerName,
          budget: newJob.budget,
          pickup: newJob.pickup,
          delivery: newJob.delivery
        });

        return newJob;
      },

      addJobFromSync: (job) => {
        set(state => {
          // Check if job already exists to avoid duplicates
          const jobExists = state.jobs.some(existingJob => existingJob.id === job.id);
          if (!jobExists) {
            return {
              jobs: [job, ...state.jobs]
            };
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
          jobs: state.jobs.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  appliedDrivers: [...(job.appliedDrivers || []), driverId]
                }
              : job
          )
        }));
      },

      selectDriver: (jobId, driverId) => {
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  selectedDriver: driverId,
                  status: 'in-progress'
                }
              : job
          )
        }));

        // Broadcast job update to all users across all browsers
        realTimeSync.broadcast('job_updated', {
          jobId,
          driverId,
          status: 'in-progress'
        });
      },

      completeJob: (jobId) => {
        set(state => ({
          jobs: state.jobs.map(job => 
            job.id === jobId 
              ? { 
                  ...job, 
                  status: 'pending-completion',
                  completedAt: new Date()
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
                  status: 'completed'
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
        return get().jobs.filter(job => job.status === 'open');
      },

      clearAllJobs: () => {
        set({ jobs: [] });
      }
    }),
    {
      name: 'jobs-storage',
      partialize: (state) => ({ jobs: state.jobs })
    }
  )
); 