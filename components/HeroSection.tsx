'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Star, MapPin, Shield, Clock, CheckCircle } from 'lucide-react';
import Truck3D from './Truck3D';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRef } from 'react';

export default function HeroSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  const handleAction = (action: string) => {
    switch (action) {
      case 'get-started':
        router.push('/auth/register');
        break;
      case 'watch-demo':
        toast.success('Demo video coming soon!');
        break;
      default:
        break;
    }
  };

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Enhanced premium background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 z-0"></div>
      <div className="absolute inset-0 opacity-30 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-repeat"></div>
      </div>
      
      {/* Animated background blobs */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-red-600/20 rounded-full filter blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-yellow-600/10 rounded-full filter blur-3xl animate-pulse-slow z-0"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 text-gray-900"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              opacity: Math.random() * 0.5 + 0.3
            }}
          />
        ))}
      </div>
      
      <motion.div style={{ opacity }} className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-red-100 to-red-50 text-red-800 rounded-full text-xs sm:text-sm font-medium shadow-lg premium-border"
            >
              <div className="absolute inset-0 bg-white/10 animate-shimmer text-gray-900"></div>
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-yellow-500" fill="currentColor" />
              <span className="relative z-10">Trusted by 10,000+ drivers and customers across India</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tighter"
            >
              <span className="block">Connect Drivers with</span>
              <span className="text-gradient-premium">Premium Customers</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="block">Across India</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed"
            >
              <span className="text-gradient-gold font-semibold">Premium Transportation Network</span> - TRINK connects elite drivers with high-value customers for secure, 
              efficient transportation services. Post jobs, find work, and track 
              shipments in real-time across India with our concierge service.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button 
                onClick={() => handleAction('get-started')}
                className="btn-primary text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 flex items-center justify-center group w-full sm:w-auto premium-border relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-400/30 to-red-600/0 animate-shimmer"></div>
                <span className="relative z-10">Get Premium Access</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </motion.button>
              <motion.button 
                onClick={() => handleAction('watch-demo')}
                className="btn-secondary text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-3 md:py-4 flex items-center justify-center group w-full sm:w-auto relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {/* Animated play button */}
                <motion.div 
                  className="mr-2 relative"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping-slow opacity-75"></div>
                </motion.div>
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-8 space-y-4 sm:space-y-0 text-sm text-gray-400 mt-6"
            >
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-red-600 border-2 border-gray-800 shadow-lg"
                    />
                  ))}
                </div>
                <span>Join 5,000+ elite drivers</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>4.9/5 premium rating</span>
              </div>
            </motion.div>
            
            {/* Premium features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8"
            >
              {[
                { icon: Shield, text: "Premium Insurance" },
                { icon: Clock, text: "24/7 Concierge" },
                { icon: CheckCircle, text: "Verified Elite Drivers" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + (index * 0.1) }}
                  className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300"
                >
                  <item.icon className="w-4 h-4 text-red-500" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* UK Coverage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex items-center space-x-2 text-gray-400 mt-4"
            >
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Premium coverage across England, Scotland, Wales & Northern Ireland</span>
            </motion.div>
          </motion.div>

          {/* Right Column - 3D Truck */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ y }}
            className="relative"
          >
            <div className="relative premium-border">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-purple-600/30 rounded-3xl blur-3xl"></div>
              <div className="relative premium-glass rounded-3xl p-8 shadow-2xl border border-gray-700/50 z-10">
                <Truck3D />
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 -left-4 bg-gray-800 rounded-full p-3 shadow-lg border border-gray-700"
            >
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </motion.div>
            
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 -right-4 bg-gray-800 rounded-full p-3 shadow-lg border border-gray-700"
            >
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </motion.div>
            
            <motion.div
              animate={{ y: [-5, 15, -5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -right-8 bg-gray-800 rounded-full p-3 shadow-lg border border-gray-700"
            >
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}