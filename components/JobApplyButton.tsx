'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useJobs, Job } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import toast from 'react-hot-toast';

interface JobApplyButtonProps {
  job: Job;
  className?: string;
}

export default function JobApplyButton({ job, className = '' }: JobApplyButtonProps) {
  const { applyForJob } = useJobs();
  const { user } = useAuth();
  const [isApplying, setIsApplying] = useState(false);

  if (!user || user.type !== 'driver') {
    return null;
  }

  const hasApplied = job.appliedDrivers?.includes(user.id) || false;
  const isSelected = job.selectedDriver === user.id;
  const isJobTaken = job.selectedDriver && job.selectedDriver !== user.id;
  const isJobClosed = job.status !== 'open';

  const handleApply = async () => {
    if (hasApplied || isJobClosed || isJobTaken) return;

    setIsApplying(true);
    
    try {
      applyForJob(job.id, user.id);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to apply for job:', error);
      toast.error('Failed to apply for job. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Job is closed or taken by another driver
  if (isJobClosed && !isSelected) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 cursor-not-allowed ${className}`}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Job Closed
      </button>
    );
  }

  // Driver is selected for this job
  if (isSelected) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-default ${className}`}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        You're Selected!
      </button>
    );
  }

  // Job is taken by another driver
  if (isJobTaken) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 cursor-not-allowed ${className}`}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Job Taken
      </button>
    );
  }

  // Driver has already applied
  if (hasApplied) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 cursor-default ${className}`}
      >
        <Clock className="w-4 h-4 mr-2" />
        Applied
      </button>
    );
  }

  // Driver can apply
  return (
    <motion.button
      onClick={handleApply}
      disabled={isApplying}
      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isApplying ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Applying...
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Apply Now
        </>
      )}
    </motion.button>
  );
}
