'use client';

import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

export default function Scene3D() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 3D CSS Truck Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          style={{ perspective: '1000px' }}
          animate={{ rotateY: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {/* Main Truck Body */}
          <motion.div
            className="relative w-32 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-2xl"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'rotateX(15deg) rotateY(15deg)'
            }}
            animate={{ 
              y: [0, -10, 0],
              rotateZ: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            {/* Truck Cabin */}
            <div 
              className="absolute -left-8 top-2 w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg shadow-lg"
              style={{ transform: 'translateZ(10px)' }}
            />
            
            {/* Wheels */}
            <motion.div 
              className="absolute -bottom-3 left-2 w-6 h-6 bg-gray-800 rounded-full shadow-md"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className="absolute -bottom-3 right-2 w-6 h-6 bg-gray-800 rounded-full shadow-md"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            
            {/* Headlights */}
            <div className="absolute -left-1 top-6 w-2 h-2 bg-yellow-400 rounded-full shadow-lg animate-pulse" />
            <div className="absolute -left-1 top-10 w-2 h-2 bg-yellow-400 rounded-full shadow-lg animate-pulse" />
            
            {/* Side Details */}
            <div 
              className="absolute inset-2 border-2 border-red-400/30 rounded"
              style={{ transform: 'translateZ(5px)' }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Road Lines */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-16 w-16 h-1 bg-white/20"
            style={{ left: `${i * 25}%` }}
            animate={{ x: [-100, window.innerWidth + 100] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  );
}
