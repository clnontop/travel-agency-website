'use client';

import { useEffect } from 'react';
import { useDataSync, restoreAllData } from '@/store/useDataSync';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { useDrivers } from '@/store/useDrivers';
import { useLocation } from '@/store/useLocation';
import toast from 'react-hot-toast';

export default function DataSyncManager() {
  const { startAutoSync, setupCrossTabSync, broadcastChange, isOnline } = useDataSync();
  const { jobs } = useJobs();
  const { user } = useAuth();

  useEffect(() => {
    // Restore data on app start
    restoreAllData();
    
    // Start auto-sync
    startAutoSync();
    
    // Setup cross-tab communication
    const cleanup = setupCrossTabSync();
    
    // Listen for data changes
    const handleDataChange = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      switch (type) {
        case 'JOB_APPLICATION':
          // Show notification when driver applies
          if (data.job && user?.type === 'customer' && data.job.customerId === user.id) {
            toast.success(`🚛 New application for "${data.job.title}"!`, {
              duration: 5000,
              position: 'top-right'
            });
          }
          break;
          
        case 'JOB_CREATED':
          // Show notification when new job is posted
          if (user?.type === 'driver') {
            toast.success(`📦 New job available: "${data.job?.title}"`, {
              duration: 4000,
              position: 'top-right'
            });
          }
          break;
          
        case 'JOB_SELECTED':
          // Show notification when driver is selected
          if (data.driverId === user?.id) {
            toast.success(`🎉 You've been selected for "${data.job?.title}"!`, {
              duration: 6000,
              position: 'top-right'
            });
          }
          break;
          
        case 'DATA_SYNC':
          console.log('🔄 Data synced at:', data.timestamp);
          break;
      }
    };

    // Add event listener
    window.addEventListener('trinck-data-change', handleDataChange as EventListener);
    
    // Periodic sync check
    const syncCheck = setInterval(() => {
      // Force sync every 30 seconds
      broadcastChange('HEARTBEAT', { timestamp: new Date() });
    }, 30000);

    // Cleanup
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
      window.removeEventListener('trinck-data-change', handleDataChange as EventListener);
      clearInterval(syncCheck);
    };
  }, []);

  // Show connection status
  useEffect(() => {
    if (!isOnline) {
      toast.error('📡 Connection lost - working offline', {
        duration: 3000,
        position: 'bottom-right'
      });
    } else {
      toast.success('📡 Connected - data syncing', {
        duration: 2000,
        position: 'bottom-right'
      });
    }
  }, [isOnline]);

  // Auto-save when jobs change
  useEffect(() => {
    if (jobs.length > 0) {
      // Broadcast job updates
      broadcastChange('JOBS_UPDATED', { 
        jobCount: jobs.length,
        timestamp: new Date()
      });
    }
  }, [jobs.length, broadcastChange]);

  return null; // This component doesn't render anything
}
