'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const useNavigation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const navigateWithLoading = async (path: string, message: string = 'Loading...', delay: number = 800) => {
    setIsLoading(true);
    
    // Show loading toast
    const loadingToast = toast.loading(message, {
      duration: delay,
      style: {
        background: '#1f2937',
        color: '#fff',
        border: '1px solid #374151'
      }
    });

    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      router.push(path);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Navigation failed');
      setIsLoading(false);
    }
  };

  return {
    navigateWithLoading,
    isLoading
  };
};
