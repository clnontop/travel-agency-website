'use client';

import { motion } from 'framer-motion';
import { Shield, MapPin, Users, DollarSign, Clock, Star, Zap, Award, Globe, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: "Advanced Security",
    description: "End-to-end encryption and secure payment processing with fraud protection",
    color: "from-green-500 to-emerald-600",
    delay: 0.1
  },
  {
    icon: MapPin,
    title: "Real-time GPS Tracking",
    description: "Live location updates and route optimization with ETA predictions",
    color: "from-blue-500 to-cyan-600",
    delay: 0.2
  },
  {
    icon: Users,
    title: "Verified Network",
    description: "Background-checked drivers and customers with rating system",
    color: "from-purple-500 to-violet-600",
    delay: 0.3
  },
  {
    icon: DollarSign,
    title: "Smart Pricing",
    description: "AI-powered dynamic pricing with competitive bidding system",
    color: "from-yellow-500 to-orange-600",
    delay: 0.4
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Lightning-fast job matching with ML-powered recommendations",
    color: "from-pink-500 to-rose-600",
    delay: 0.5
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer service with multilingual support",
    color: "from-indigo-500 to-blue-600",
    delay: 0.6
  }
];

export default function ModernFeatures() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent),linear-gradient(rgba(255,255,255,.05)_24%,transparent_25%,transparent_26%,rgba(255,255,255,.05)_27%,rgba(255,255,255,.05)_74%,transparent_75%,transparent_76%,rgba(255,255,255,.05)_77%,rgba(255,255,255,.05))] bg-[length:50px_50px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Next-Gen
            </span>{' '}
            Features
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Experience the future of logistics with cutting-edge technology and innovative solutions
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-500 overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ 
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(220, 38, 38, 0.25)"
              }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Icon */}
              <motion.div 
                className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 relative z-10`}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed relative z-10">
                {feature.description}
              </p>

              {/* Hover Effect Lines */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Corner Accents */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500/0 group-hover:border-red-500/50 transition-colors duration-500" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500/0 group-hover:border-red-500/50 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all duration-300 overflow-hidden"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-400/30 to-red-600/0 animate-shimmer" />
            <span className="relative z-10">Explore All Features</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
