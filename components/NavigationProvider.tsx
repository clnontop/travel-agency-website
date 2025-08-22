'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck } from 'lucide-react';

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  setIsNavigating: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
  children: ReactNode;
}

export default function NavigationProvider({ children }: NavigationProviderProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let completeTimer: NodeJS.Timeout;

    const startNavigation = () => {
      setIsNavigating(true);
      setProgress(10);

      // Simulate progress
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);

      // Auto-complete after reasonable time
      completeTimer = setTimeout(() => {
        completeNavigation();
      }, 1500);
    };

    const completeNavigation = () => {
      if (progressTimer) clearInterval(progressTimer);
      if (completeTimer) clearTimeout(completeTimer);
      
      setProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 300);
    };

    // Start loading when route changes
    if (isNavigating) {
      completeNavigation();
    } else {
      startNavigation();
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer);
      if (completeTimer) clearTimeout(completeTimer);
    };
  }, [pathname, searchParams]);

  return (
    <NavigationContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
      
      {/* Navigation Loading UI */}
      <AnimatePresence>
        {isNavigating && (
          <>
            {/* Top Progress Bar */}
            <motion.div
              className="fixed top-0 left-0 right-0 z-[100] h-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700"
                style={{
                  width: `${progress}%`,
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </motion.div>

            {/* Loading Overlay for initial load */}
            {progress < 30 && (
              <motion.div
                className="fixed inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-md flex items-center justify-center z-[99]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center">
                  {/* Main Loading Animation */}
                  <motion.div
                    className="relative mb-8"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Truck Container */}
                    <motion.div
                      className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto relative backdrop-blur-sm border border-red-500/30"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, 0, -2, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Truck className="h-12 w-12 text-red-500" />
                      
                      {/* Moving particles */}
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 bg-red-400 rounded-full"
                          style={{
                            top: '50%',
                            left: '50%',
                            transformOrigin: '0 0'
                          }}
                          animate={{
                            rotate: [0, 360],
                            x: [30 + i * 5, 30 + i * 5],
                            y: [-0.75, -0.75],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 0.4
                          }}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Outer pulse rings */}
                    {[0, 1].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 border border-red-500/20 rounded-full"
                        animate={{
                          scale: [1, 1.8, 2.2],
                          opacity: [0.6, 0.2, 0]
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: i * 1.25
                        }}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Text Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-3">
                      <span className="text-shimmer">TRINK</span>
                    </h3>
                    <p className="text-gray-300 text-lg mb-6">
                      Navigating to your destination...
                    </p>
                    
                    {/* Progress indicator */}
                    <div className="w-64 mx-auto">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Loading</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2 backdrop-blur-sm">
                        <motion.div
                          className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full shadow-lg shadow-red-500/30"
                          style={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Bottom dots animation */}
                  <div className="flex justify-center mt-8 space-x-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-red-500 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1
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
    </NavigationContext.Provider>
  );
}
