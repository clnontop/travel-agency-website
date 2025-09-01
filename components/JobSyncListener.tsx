'use client';

import { useEffect } from 'react';
import { useJobs } from '../store/useJobs';
import { realTimeSync } from '../lib/realTimeSync';

export default function JobSyncListener() {
  useEffect(() => {
    // Subscribe to job creation events
    const unsubscribeJobCreated = realTimeSync.subscribe('job_created', (event) => {
      const { job } = event.data;
      console.log('📡 Received new job from sync:', job);
      
      // Add the job to local state if it doesn't exist
      useJobs.getState().addJobFromSync(job);
      console.log('✅ Added synced job to local state:', job.title);
    });

    // Subscribe to job update events
    const unsubscribeJobUpdated = realTimeSync.subscribe('job_updated', (event) => {
      const { jobId, driverId, status } = event.data;
      console.log('📡 Received job update from sync:', { jobId, driverId, status });
      
      useJobs.getState().updateJob(jobId, { 
        selectedDriver: driverId, 
        status 
      });
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeJobCreated();
      unsubscribeJobUpdated();
    };
  }, []);

  return null; // This component doesn't render anything
}
