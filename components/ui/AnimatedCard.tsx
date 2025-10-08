'use client';

import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'glass' | 'gradient';
}

export default function AnimatedCard({
  children,
  className = '',
  hover = true,
  glow = false,
  variant = 'default'
}: AnimatedCardProps) {
  const baseClasses = "relative overflow-hidden rounded-2xl transition-all duration-300";
  
  const variantClasses = {
    default: "bg-gray-800 border border-gray-700 shadow-2xl",
    glass: "bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 shadow-2xl",
    gradient: "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-2xl"
  };

  const hoverClasses = hover ? "hover:scale-105 hover:shadow-3xl" : "";
  const glowClasses = glow ? "shadow-blue-500/20 hover:shadow-blue-500/40" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={hover ? { 
        scale: 1.02,
        rotateY: 2,
        rotateX: 2,
      } : {}}
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${glowClasses} ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Glow effect */}
      {glow && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-20 hover:opacity-40 transition-opacity duration-300 -z-10" />
      )}

      {/* Border animation */}
      <div className="absolute inset-0 rounded-2xl">
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-0 hover:opacity-100 transition-opacity duration-300" 
             style={{
               background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5), rgba(236, 72, 153, 0.5), transparent)',
               WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               WebkitMaskComposite: 'exclude'
             }} />
      </div>
    </motion.div>
  );
}
