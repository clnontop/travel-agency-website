'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck } from 'lucide-react';

export default function NavigationLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    const startLoading = () => {
      setIsLoading(true);
      setProgress(0);

      // Simulate realistic loading progress
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          const increment = Math.random() * 20;
          return Math.min(prev + increment, 95);
        });
      }, 150);

      // Auto-complete after reasonable time
      hideTimer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 200);
      }, 2000);
    };

    const finishLoading = () => {
      if (progressTimer) clearInterval(progressTimer);
      if (hideTimer) clearTimeout(hideTimer);
      
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    };

    // Start loading on route change
    startLoading();

    // Cleanup function
    return () => {
      finishLoading();
    };
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Top Loading Bar */}
          <motion.div
            className="fixed top-0 left-0 right-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="h-1 bg-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/50"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          {/* Loading Overlay for slower loads */}
          {progress < 20 && (
            <motion.div
              className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-black/90 backdrop-blur-sm flex items-center justify-center z-[99]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                {/* Animated Truck Icon */}
                <motion.div
                  className="relative mb-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto relative"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Truck className="h-10 w-10 text-red-500" />
                    
                    {/* Orbiting dots */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-red-500 rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                          transformOrigin: '0 0'
                        }}
                        animate={{
                          rotate: [0, 360],
                          x: [25, 25],
                          y: [-1, -1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                          delay: i * 0.6
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 border-2 border-red-500/30 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.2, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
                
                {/* Loading Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-white mb-2 text-shimmer">
                    TRINK
                  </h3>
                  <p className="text-gray-300">
                    Loading page...
                  </p>
                </motion.div>
                
                {/* Animated dots */}
                <div className="flex justify-center mt-4 space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-red-500 rounded-full"
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{
                        duration: 1.2,
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
