'use client';

import { motion } from 'framer-motion';
import { Truck, Package, MapPin, Shield, Clock, Star, Zap, Heart } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'bounce' | 'truck' | 'orbit';
  color?: 'red' | 'blue' | 'green' | 'purple' | 'gold' | 'white';
  speed?: 'slow' | 'normal' | 'fast';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
  gold: 'text-yellow-500',
  white: 'text-white'
};

const speedSettings = {
  slow: 2,
  normal: 1,
  fast: 0.5
};

export default function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  color = 'red',
  speed = 'normal'
}: LoadingSpinnerProps) {
  const duration = speedSettings[speed];
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            className={`${sizeClass} border-2 border-gray-300 border-t-current rounded-full ${colorClass}`}
            animate={{ rotate: 360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          />
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 bg-current rounded-full ${colorClass}`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: duration * 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={`w-1 bg-current rounded-full ${colorClass}`}
                animate={{
                  height: [8, 20, 8],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: duration * 1.2,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            className={`${sizeClass} bg-current rounded-full ${colorClass}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{
              duration: duration * 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );

      case 'bounce':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 bg-current rounded-full ${colorClass}`}
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: duration * 1.5,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        );

      case 'truck':
        return (
          <motion.div
            className={`${sizeClass} ${colorClass}`}
            animate={{
              x: [0, 10, 0],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{
              duration: duration * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Truck className="w-full h-full" />
          </motion.div>
        );

      case 'orbit':
        return (
          <div className="relative w-8 h-8">
            <motion.div
              className={`w-2 h-2 bg-current rounded-full absolute ${colorClass}`}
              style={{ top: '50%', left: '50%', transformOrigin: '0 0' }}
              animate={{
                rotate: [0, 360],
                x: [12, 12],
                y: [-1, -1]
              }}
              transition={{
                duration: duration * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className={`w-1 h-1 bg-current rounded-full absolute ${colorClass} opacity-60`}
              style={{ top: '50%', left: '50%', transformOrigin: '0 0' }}
              animate={{
                rotate: [0, 360],
                x: [8, 8],
                y: [-0.5, -0.5]
              }}
              transition={{
                duration: duration * 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: 0.5
              }}
            />
          </div>
        );

      default:
        return (
          <motion.div
            className={`${sizeClass} border-2 border-gray-300 border-t-current rounded-full ${colorClass}`}
            animate={{ rotate: 360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          />
        );
    }
  };

  return (
    <div className="inline-flex items-center justify-center">
      {renderSpinner()}
    </div>
  );
}
