'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck } from 'lucide-react';

export default function PageTransitionLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const handleStart = () => {
      setIsLoading(true);
      setLoadingProgress(0);
      
      // Simulate loading progress
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);

      // Auto-hide after maximum time (fallback)
      timeoutId = setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(0);
        }, 300);
      }, 3000);
    };

    const handleComplete = () => {
      if (progressInterval) clearInterval(progressInterval);
      if (timeoutId) clearTimeout(timeoutId);
      
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 300);
    };

    // Listen for pathname changes to detect navigation completion
    let previousPath = pathname;
    
    const checkPathChange = () => {
      if (pathname !== previousPath) {
        if (isLoading) {
          handleComplete();
        }
        previousPath = pathname;
      }
    };

    const pathCheckInterval = setInterval(checkPathChange, 100);

    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (timeoutId) clearTimeout(timeoutId);
      if (pathCheckInterval) clearInterval(pathCheckInterval);
    };
  }, [router, pathname, isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Loading Bar */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-red-500 to-red-700"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: loadingProgress / 100 }}
            exit={{ scaleX: 1 }}
            style={{ transformOrigin: 'left' }}
            transition={{ duration: 0.2 }}
          />

          {/* Full Screen Overlay (optional, for slower connections) */}
          {loadingProgress < 30 && (
            <motion.div
              className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[99]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Truck className="h-8 w-8 text-red-500" />
                </motion.div>
                
                <motion.p
                  className="text-white text-lg font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Loading...
                </motion.p>
                
                {/* Loading dots */}
                <div className="flex justify-center mt-4 space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-red-500 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
