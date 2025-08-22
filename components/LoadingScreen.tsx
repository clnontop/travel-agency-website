'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Loader2, Package, MapPin, Shield, Clock, Star, Zap } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'truck' | 'pulse' | 'orbit' | 'wave' | 'progress';
  color?: 'red' | 'blue' | 'green' | 'purple' | 'gold';
  showProgress?: boolean;
  progress?: number;
}

const colorSchemes = {
  red: {
    primary: 'text-red-500',
    bg: 'bg-red-500',
    border: 'border-red-500',
    gradient: 'from-red-500 to-red-700',
    glow: 'shadow-red-500/50'
  },
  blue: {
    primary: 'text-blue-500',
    bg: 'bg-blue-500',
    border: 'border-blue-500',
    gradient: 'from-blue-500 to-blue-700',
    glow: 'shadow-blue-500/50'
  },
  green: {
    primary: 'text-green-500',
    bg: 'bg-green-500',
    border: 'border-green-500',
    gradient: 'from-green-500 to-green-700',
    glow: 'shadow-green-500/50'
  },
  purple: {
    primary: 'text-purple-500',
    bg: 'bg-purple-500',
    border: 'border-purple-500',
    gradient: 'from-purple-500 to-purple-700',
    glow: 'shadow-purple-500/50'
  },
  gold: {
    primary: 'text-yellow-500',
    bg: 'bg-yellow-500',
    border: 'border-yellow-500',
    gradient: 'from-yellow-500 to-yellow-700',
    glow: 'shadow-yellow-500/50'
  }
};

export default function LoadingScreen({ 
  message = "Loading...", 
  fullScreen = true, 
  variant = 'default',
  color = 'red',
  showProgress = false,
  progress = 0
}: LoadingScreenProps) {
  const colors = colorSchemes[color];

  const renderLoadingVariant = () => {
    switch (variant) {
      case 'truck':
        return (
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={`w-20 h-20 ${colors.bg}/20 rounded-full flex items-center justify-center mx-auto relative`}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Truck className={`h-10 w-10 ${colors.primary}`} />
              
              {/* Orbiting dots */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`absolute w-2 h-2 ${colors.bg} rounded-full`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0'
                  }}
                  animate={{
                    rotate: [0, 360],
                    x: [30, 30],
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
            
            {/* Spinning ring */}
            <motion.div
              className={`absolute inset-0 border-2 ${colors.border}/30 border-t-${color}-500 rounded-full`}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        );

      case 'pulse':
        return (
          <div className="relative mb-8">
            <motion.div
              className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mx-auto`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Truck className="h-10 w-10 text-white" />
            </motion.div>
            
            {/* Pulse rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`absolute inset-0 border-2 ${colors.border} rounded-full`}
                initial={{ scale: 1, opacity: 1 }}
                animate={{
                  scale: [1, 2, 2.5],
                  opacity: [1, 0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4
                }}
              />
            ))}
          </div>
        );

      case 'orbit':
        return (
          <div className="relative mb-8 w-24 h-24 mx-auto">
            <motion.div
              className={`w-8 h-8 ${colors.bg} rounded-full flex items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            >
              <Truck className="h-4 w-4 text-white" />
            </motion.div>
            
            {/* Orbiting elements */}
            {[Package, MapPin, Shield, Clock].map((Icon, i) => (
              <motion.div
                key={i}
                className={`absolute w-6 h-6 ${colors.bg}/20 rounded-full flex items-center justify-center`}
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0'
                }}
                animate={{
                  rotate: [0, 360],
                  x: [40, 40],
                  y: [-3, -3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.75
                }}
              >
                <Icon className={`h-3 w-3 ${colors.primary}`} />
              </motion.div>
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="mb-8">
            <motion.div
              className={`w-16 h-16 ${colors.bg}/20 rounded-full flex items-center justify-center mx-auto mb-4`}
            >
              <Truck className={`h-8 w-8 ${colors.primary}`} />
            </motion.div>
            
            {/* Wave bars */}
            <div className="flex justify-center space-x-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className={`w-1 ${colors.bg} rounded-full`}
                  animate={{
                    height: [10, 30, 10],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="mb-8">
            <motion.div
              className={`w-16 h-16 ${colors.bg}/20 rounded-full flex items-center justify-center mx-auto mb-6`}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Truck className={`h-8 w-8 ${colors.primary}`} />
            </motion.div>
            
            {showProgress && (
              <div className="w-64 mx-auto">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className={`w-20 h-20 ${colors.bg}/20 rounded-full flex items-center justify-center mx-auto`}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Truck className={`h-10 w-10 ${colors.primary}`} />
            </motion.div>
            
            <motion.div
              className={`absolute inset-0 border-2 ${colors.border}/30 border-t-${color}-500 rounded-full`}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        );
    }
  };

  if (fullScreen) {
    return (
      <AnimatePresence>
        <motion.div 
          className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute rounded-full ${colors.bg}/10`}
                style={{
                  width: Math.random() * 80 + 20,
                  height: Math.random() * 80 + 20,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <div className="text-center relative z-10">
            {renderLoadingVariant()}
            
            <motion.h2
              className="text-2xl font-bold text-white mb-4 text-shimmer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              TRINK
            </motion.h2>
            
            <motion.p
              className="text-gray-300 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {message}
            </motion.p>
            
            {/* Loading dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className={`w-2 h-2 ${colors.bg} rounded-full`}
                  animate={{
                    scale: [1, 1.5, 1],
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
      </AnimatePresence>
    );
  }

  // Inline loading component
  return (
    <div className="flex items-center justify-center py-8">
      <motion.div
        className="flex items-center space-x-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className={`h-6 w-6 ${colors.primary}`} />
        </motion.div>
        <span className="text-gray-300">{message}</span>
      </motion.div>
    </div>
  );
}
