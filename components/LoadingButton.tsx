'use client';

import { motion } from 'framer-motion';
import { Loader2, Check, X } from 'lucide-react';
import { ReactNode } from 'react';

interface LoadingButtonProps {
  children: ReactNode;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingButton({
  children,
  loading = false,
  success = false,
  error = false,
  disabled = false,
  onClick,
  variant = 'primary',
  size = 'md',
  className = ''
}: LoadingButtonProps) {
  const baseClasses = 'relative overflow-hidden font-semibold rounded-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white border-2 border-red-600',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const isDisabled = disabled || loading;

  const getButtonState = () => {
    if (success) return 'success';
    if (error) return 'error';
    if (loading) return 'loading';
    return 'default';
  };

  const buttonState = getButtonState();

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
    >
      {/* Background shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={loading ? { x: '100%' } : {}}
        transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
      />

      {/* Button content */}
      <motion.div
        className="relative z-10 flex items-center space-x-2"
        initial={false}
        animate={{
          opacity: buttonState === 'loading' ? 0.7 : 1
        }}
      >
        {/* Loading state */}
        {buttonState === 'loading' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.div>
        )}

        {/* Success state */}
        {buttonState === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-green-400"
          >
            <Check className="h-4 w-4" />
          </motion.div>
        )}

        {/* Error state */}
        {buttonState === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-red-400"
          >
            <X className="h-4 w-4" />
          </motion.div>
        )}

        {/* Button text */}
        <motion.span
          initial={false}
          animate={{
            opacity: buttonState === 'loading' ? 0 : 1,
            x: buttonState === 'loading' ? 10 : 0
          }}
          transition={{ duration: 0.2 }}
        >
          {buttonState === 'success' ? 'Success!' : 
           buttonState === 'error' ? 'Error' :
           buttonState === 'loading' ? 'Loading...' : children}
        </motion.span>
      </motion.div>

      {/* Success background flash */}
      {buttonState === 'success' && (
        <motion.div
          className="absolute inset-0 bg-green-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Error background flash */}
      {buttonState === 'error' && (
        <motion.div
          className="absolute inset-0 bg-red-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}
