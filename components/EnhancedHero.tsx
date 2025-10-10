'use client';

import { motion } from 'framer-motion';
import { Truck, ArrowRight, Play, Sparkles } from 'lucide-react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false });

interface EnhancedHeroProps {
  onAction?: (action: string) => void;
}

export default function EnhancedHero({ onAction }: EnhancedHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.08),transparent_50%)]" />
      </div>

      {/* 3D Scene Background */}
      <div className="absolute inset-0 opacity-30">
        <Suspense fallback={<div className="w-full h-full bg-gray-900" />}>
          <Scene3D />
        </Suspense>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Logo Animation */}
          <motion.div
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="relative"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/logo.png"
                alt="Trinck Logo"
                width={80}
                height={80}
                className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 object-contain rounded-xl"
                priority
              />
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Welcome to{' '}
            </span>
            <motion.span
              className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Trinck
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            It's not only about moving{' '}
            <motion.span
              className="text-red-400 font-semibold"
              animate={{ textShadow: ['0 0 0px #dc2626', '0 0 20px #dc2626', '0 0 0px #dc2626'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Goods
            </motion.span>
            , Its about moving{' '}
            <motion.span
              className="text-red-400 font-semibold"
              animate={{ textShadow: ['0 0 0px #dc2626', '0 0 20px #dc2626', '0 0 0px #dc2626'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              India
            </motion.span>{' '}
            Forward
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {['Real-time Tracking', 'Secure Payments', '24/7 Support'].map((feature, index) => (
              <motion.div
                key={feature}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-6 py-3 text-gray-300"
                whileHover={{ scale: 1.05, borderColor: '#dc2626' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.button
              onClick={() => onAction?.('register')}
              className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(220, 38, 38, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-400/30 to-red-600/0 animate-shimmer" />
              <span className="relative z-10 flex items-center">
                Get Started Now
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </span>
            </motion.button>

            <motion.a
              href="https://www.youtube.com/watch?v=_OAm1pBqmO8"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center text-gray-300 hover:text-white transition-colors no-underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-12 h-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full flex items-center justify-center mr-3 group-hover:border-red-500 transition-colors"
                whileHover={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}
              >
                <Play className="h-5 w-5 ml-1" />
              </motion.div>
              <span className="font-medium">Words from the Founder</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
          animate={{ borderColor: ['#9ca3af', '#dc2626', '#9ca3af'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            animate={{ 
              y: [0, 12, 0],
              backgroundColor: ['#9ca3af', '#dc2626', '#9ca3af']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
