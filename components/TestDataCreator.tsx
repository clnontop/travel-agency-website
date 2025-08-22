'use client';

import { useState } from 'react';
import { useJobs } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import toast from 'react-hot-toast';

export default function TestDataCreator() {
  const { createJob, selectDriver } = useJobs();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createTestJobForDriver = () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }

    setIsCreating(true);

    try {
      // Create a test job
      const testJob = {
        title: 'Test Delivery Job',
        description: 'Test delivery from warehouse to customer',
        pickup: 'Warehouse, Mumbai',
        delivery: 'Customer Location, Mumbai',
        budget: 500,
        distance: '15 km',
        customerId: 'customer1',
        customerName: 'Test Customer',
        customerPhone: '+91 98765 43210',
        vehicleType: 'Truck'
      };

      createJob(testJob);
      
      // If user is a driver, simulate the job being assigned to them
      if (user.type === 'driver') {
        // Get the job ID (it would be the most recent one)
        const jobId = `job-${Date.now()}`;
        
        // Simulate customer selecting this driver
        setTimeout(() => {
          selectDriver(jobId, user.id);
          toast.success('Test job created and assigned to you! Check Active Jobs tab.');
        }, 1000);
      } else {
        toast.success('Test job created! You can now see it in your jobs.');
      }
    } catch (error) {
      toast.error('Failed to create test job');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={createTestJobForDriver}
        disabled={isCreating}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors text-sm"
      >
        {isCreating ? 'Creating...' : 'Create Test Job'}
      </button>
    </div>
  );
}
