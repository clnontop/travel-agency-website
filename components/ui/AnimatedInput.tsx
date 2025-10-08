'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AnimatedInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function AnimatedInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  icon,
  className = ''
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasValue = value.length > 0;

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        {/* Input field */}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full h-14 px-4 pt-6 pb-2 
            ${icon ? 'pl-12' : 'pl-4'} 
            ${isPassword ? 'pr-12' : 'pr-4'}
            bg-gray-800/50 border-2 rounded-lg
            text-white placeholder-transparent
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-0
            ${isFocused || hasValue 
              ? 'border-blue-500 bg-gray-800/70' 
              : error 
                ? 'border-red-500' 
                : 'border-gray-600 hover:border-gray-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {/* Animated label */}
        <motion.label
          className={`
            absolute left-4 pointer-events-none transition-all duration-300 ease-in-out
            ${icon ? 'left-12' : 'left-4'}
            ${isFocused || hasValue
              ? 'top-2 text-xs text-blue-400 font-medium'
              : 'top-1/2 transform -translate-y-1/2 text-gray-400'
            }
            ${error ? 'text-red-400' : ''}
          `}
          animate={{
            y: isFocused || hasValue ? -8 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </motion.label>

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Focus ring animation */}
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          animate={{
            boxShadow: isFocused 
              ? '0 0 0 3px rgba(59, 130, 246, 0.1)' 
              : '0 0 0 0px rgba(59, 130, 246, 0.1)'
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Underline animation */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
          animate={{
            width: isFocused ? '100%' : '0%'
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400 flex items-center space-x-1"
        >
          <div className="w-1 h-1 bg-red-400 rounded-full" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Success indicator */}
      {!error && hasValue && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
}
