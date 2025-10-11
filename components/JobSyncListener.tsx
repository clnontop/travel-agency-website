'use client';

import { useEffect } from 'react';
import { useJobs } from '../store/useJobs';
import { realTimeSync } from '../lib/realTimeSync';

export default function JobSyncListener() {
  useEffect(() => {
    let unsubscribeJobCreated: (() => void) | null = null;
    let unsubscribeJobUpdated: (() => void) | null = null;

    try {
      // Subscribe to job creation events
      unsubscribeJobCreated = realTimeSync.subscribe('job_created', (event) => {
        try {
          const { job } = event.data;
          console.log('📡 Received new job from sync:', job);
          
          // Add the job to local state if it doesn't exist
          const jobsState = useJobs.getState();
          if (jobsState.addJobFromSync) {
            jobsState.addJobFromSync(job);
            console.log('✅ Added synced job to local state:', job.title);
          }
        } catch (error) {
          console.error('Error processing job creation event:', error);
        }
      });

      // Subscribe to job update events
      unsubscribeJobUpdated = realTimeSync.subscribe('job_updated', (event) => {
        try {
          const { jobId, driverId, status } = event.data;
          console.log('📡 Received job update from sync:', { jobId, driverId, status });
          
          const jobsState = useJobs.getState();
          if (jobsState.updateJob) {
            jobsState.updateJob(jobId, { 
              selectedDriver: driverId, 
              status 
            });
          }
        } catch (error) {
          console.error('Error processing job update event:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up job sync listeners:', error);
    }

    // Cleanup subscriptions
    return () => {
      try {
        if (unsubscribeJobCreated) {
          unsubscribeJobCreated();
        }
        if (unsubscribeJobUpdated) {
          unsubscribeJobUpdated();
        }
      } catch (error) {
        console.error('Error cleaning up job sync listeners:', error);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
