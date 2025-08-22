'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export default function Truck3D() {
  const controls = useAnimation();
  
  // Start animations when component mounts
  useEffect(() => {
    // Enhanced rotation and movement animations
    controls.start({
      rotateY: [0, 5, 0, -5, 0],
      rotateX: [0, 2, 0, -2, 0],
      scale: [1, 1.02, 1, 0.98, 1],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
    
    // Add random subtle movements to create a more dynamic feel
    const interval = setInterval(() => {
      controls.start({
        y: Math.random() * 10 - 5,
        x: Math.random() * 10 - 5,
        transition: {
          duration: 2,
          ease: "easeInOut"
        }
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [controls]);
  return (
    <div className="w-full h-96 relative flex items-center justify-center overflow-visible">
      {/* Enhanced 3D Frame effect - creates the illusion of coming out of the screen */}
      <motion.div 
        className="absolute inset-0 border-8 border-gray-800 rounded-2xl z-20 pointer-events-none shadow-[0_0_15px_5px_rgba(0,0,0,0.3)]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated corner accents */}
        <motion.div 
          className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-red-600 rounded-tl-lg"
          initial={{ opacity: 0, x: -10, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
        <motion.div 
          className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-red-600 rounded-tr-lg"
          initial={{ opacity: 0, x: 10, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
        <motion.div 
          className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-red-600 rounded-bl-lg"
          initial={{ opacity: 0, x: -10, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        <motion.div 
          className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-red-600 rounded-br-lg"
          initial={{ opacity: 0, x: 10, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        />
        
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-xl opacity-0 animate-pulse-slow">
          <div className="absolute inset-0 rounded-xl border-4 border-red-500/30 blur-sm"></div>
        </div>
      </motion.div>
      
      {/* Background with depth effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl backdrop-blur-sm transform scale-[0.98] z-0"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-20 rounded-2xl z-0"></div>
      
      {/* Premium light effects */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/20 rounded-full filter blur-xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-500/20 rounded-full filter blur-xl animate-pulse-slow"></div>
      
      {/* 3D Truck using CSS - Enhanced for premium look with pop-out effect */}
      <motion.div
        initial={{ scale: 0.9, z: 0 }}
        animate={{ 
          y: [-5, 5, -5],
          scale: 1.05,
          z: 30
        }}
        transition={{ 
          y: {
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          },
          scale: {
            duration: 1,
            ease: "easeOut"
          }
        }}
        className="relative z-10 transform-gpu will-change-transform"
        style={{ 
          transformStyle: "preserve-3d",
          transform: "perspective(1000px) translateZ(20px)"
        }}
      >
        {/* Truck Body */}
        <div className="relative">
          {/* Main Body - Indian truck style */}
          <motion.div
            animate={controls}
            className="w-64 h-32 rounded-lg shadow-2xl relative overflow-visible bg-gradient-to-r from-blue-600 to-blue-700"
            style={{ 
              transformStyle: "preserve-3d",
              transform: "translateZ(30px)"
            }}
          >
            {/* Indian flag on the side */}
            <div className="absolute top-2 right-2 w-8 h-5 rounded overflow-hidden border border-white/50 shadow-md">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 w-full h-1/3 bg-orange-500"></div>
                <div className="absolute inset-0 top-1/3 w-full h-1/3 bg-white"></div>
                <div className="absolute inset-0 top-2/3 w-full h-1/3 bg-green-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full border border-blue-900">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full border-2 border-blue-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reflective surface effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent"></div>
            
            {/* Cab - Enhanced with metallic effect - Indian style */}
            <div className="absolute -top-10 left-4 w-40 h-20 rounded-t-lg shadow-lg bg-gradient-to-r from-blue-800 to-blue-900">
              {/* Reflective surface effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
              
              {/* Windows with glass effect */}
              <div className="absolute top-2 left-2 w-10 h-8 bg-gradient-to-br from-blue-300 to-blue-200 rounded-sm shadow-inner overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30"></div>
              </div>
              <div className="absolute top-2 left-14 w-10 h-8 bg-gradient-to-br from-blue-300 to-blue-200 rounded-sm shadow-inner overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30"></div>
              </div>
              <div className="absolute top-2 left-26 w-10 h-8 bg-gradient-to-br from-blue-300 to-blue-200 rounded-sm shadow-inner overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/30"></div>
              </div>
              
              {/* Indian truck decorative elements */}
              <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-yellow-500 rounded-t-lg flex items-center justify-center">
                <div className="text-[6px] font-bold text-blue-900">INDIA</div>
              </div>
            </div>
            
            {/* Wheels - Enhanced with spinning animation and chrome effect */}
            {/* Indian truck wheels - decorative with patterns */}
            {[...Array(6)].map((_, i) => {
              const positions = [
                {left: 4}, {left: 16}, {left: 28},
                {right: 28}, {right: 16}, {right: 4}
              ];
              return (
                <div key={i} className="absolute -bottom-4 w-10 h-10" style={positions[i]}>
                  <motion.div 
                    className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border-2 border-yellow-500 shadow-lg"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    {/* Wheel hub with decorative pattern */}
                    <div className="absolute inset-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                      {/* Additional decorative circles */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border border-yellow-300/50 rounded-full"></div>
                      </div>
                    </div>
                    {/* Decorative spokes */}
                    {[...Array(8)].map((_, j) => (
                      <div 
                        key={j} 
                        className="absolute top-1/2 left-1/2 w-5 h-0.5 bg-yellow-400 -translate-x-1/2 -translate-y-1/2"
                        style={{ transform: `translate(-50%, -50%) rotate(${j * 22.5}deg)` }}
                      ></div>
                    ))}
                    {/* Additional decorative rim */}
                    <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
                  </motion.div>
                </div>
              );
            })}
            
            {/* Headlights - Enhanced with glow effect - Indian style */}
             <>
               {[{left: 2}, {right: 2}].map((pos, i) => (
                 <div key={i} className="absolute top-2 w-4 h-4" style={pos}>
                   <div className="absolute inset-0 bg-yellow-400 rounded-full shadow-lg z-10 border border-yellow-500"></div>
                   <motion.div 
                     className="absolute inset-0 bg-yellow-300 rounded-full blur-sm"
                     animate={{ scale: [1, 1.5, 1] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   ></motion.div>
                   {/* Light beam effect */}
                   <motion.div 
                     className="absolute top-0 left-0 w-20 h-40 bg-gradient-to-b from-yellow-400/50 to-transparent -rotate-45 origin-top-left"
                     initial={{ opacity: 0, scale: 0 }}
                     animate={{ opacity: [0, 0.3, 0], scale: [0.5, 1, 0.5] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     style={{ filter: 'blur(8px)', transformOrigin: 'top left' }}
                   ></motion.div>
                   {/* Decorative ring */}
                   <div className="absolute inset-[2px] border-2 border-yellow-500/50 rounded-full"></div>
                 </div>
               ))}
               {/* Indian style additional decorative lights */}
               {[...Array(3)].map((_, i) => (
                 <div 
                   key={i} 
                   className="absolute w-2 h-2 bg-orange-300 rounded-full shadow-lg shadow-orange-300/30"
                   style={{ 
                     top: '10px',
                     left: `${12 + i * 5}px`
                   }}
                 >
                   <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent rounded-full"></div>
                 </div>
               ))}
               
               {/* Additional Indian truck decorative elements */}
               <div className="absolute top-0 left-0 w-full h-2 flex space-x-1">
                 {[...Array(8)].map((_, i) => (
                   <div 
                     key={i} 
                     className="w-1 h-1 rounded-full"
                     style={{
                       background: ['#FF5722', '#FFC107', '#4CAF50', '#2196F3'][i % 4]
                     }}
                   ></div>
                 ))}
               </div>
             </>
            
            {/* Exhaust with smoke effect - Indian truck style */}
            <div className="absolute top-4 right-0 w-3 h-8 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full">
              {/* Smoke particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="absolute -right-1 w-3 h-3 bg-gray-300/30 rounded-full"
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    y: [-2, -20],
                    x: [0, i % 2 === 0 ? 10 : -10],
                    opacity: [0, 0.7, 0],
                    scale: [0.5, 2.5]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    delay: i * 0.3,
                    ease: "easeOut" 
                  }}
                ></motion.div>
              ))}
              {/* Exhaust tip with Indian decorative elements */}
              <div className="absolute top-0 right-0 w-3 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-sm"></div>
              <div className="absolute top-1 right-0 w-3 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-sm"></div>
            </div>
            
            {/* Indian truck specific decorations */}
            <>
              {/* Colorful decorative patterns */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 via-green-500 to-red-500"></div>
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
              
              {/* Decorative tassels */}
              {[...Array(8)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="absolute -bottom-3 w-1 h-4"
                  style={{ left: `${i * 8 + 4}%` }}
                  animate={{ rotateZ: [-5, 5, -5] }}
                  transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                >
                  <div className={`w-full h-full ${i % 3 === 0 ? 'bg-yellow-500' : i % 3 === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className={`w-3 h-3 rounded-full -bottom-3 -left-1 absolute ${i % 3 === 0 ? 'bg-yellow-500' : i % 3 === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </motion.div>
              ))}
              
              {/* Horn symbol */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xl font-bold text-yellow-500 tracking-widest">HORN OK</div>
              
              {/* License plate - Indian style */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-5 bg-yellow-100 rounded flex items-center justify-center">
                <span className="text-[8px] font-bold text-black">IND 2023</span>
              </div>
            </>
          </motion.div>
        </div>
      </motion.div>
      {/* 3D pop-out effect elements */}
      <div className="absolute -top-4 -left-4 -right-4 -bottom-4 rounded-3xl border-2 border-dashed border-gray-700/30 z-0 pointer-events-none"></div>
      <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-2xl border border-gray-700/50 z-0 pointer-events-none"></div>
      
      {/* Enhanced floating particles with glow effect - positioned to enhance 3D effect */}
      {[
        { top: "-5%", left: "10%", color: "bg-red-400", size: "w-3 h-3", duration: 3, delay: 0 },
        { bottom: "-8%", right: "10%", color: "bg-blue-400", size: "w-4 h-4", duration: 4, delay: 0.5 },
        { top: "50%", right: "-5%", color: "bg-green-400", size: "w-3 h-3", duration: 3.5, delay: 1 },
        { top: "30%", right: "-8%", color: "bg-purple-400", size: "w-3 h-3", duration: 5, delay: 1.5 },
        { bottom: "30%", left: "-5%", color: "bg-yellow-400", size: "w-3 h-3", duration: 4.5, delay: 2 },
        { top: "-10%", right: "30%", color: "bg-pink-400", size: "w-2 h-2", duration: 3.2, delay: 2.5 },
        { bottom: "-10%", left: "40%", color: "bg-indigo-400", size: "w-2 h-2", duration: 4.2, delay: 1.8 }
      ].map((particle, i) => (
        <div key={i} className="absolute" style={particle}>
          <motion.div
            animate={{ 
              x: [0, particle.left ? 20 : -20, 0],
              y: [0, particle.top ? -20 : 20, 0],
              opacity: [0.5, 1, 0.5],
              z: [0, 30, 0]
            }}
            transition={{ 
              duration: particle.duration, 
              repeat: Infinity,
              delay: particle.delay
            }}
            className={`${particle.size} ${particle.color} rounded-full shadow-lg relative z-20`}
            style={{ filter: 'blur(1px)' }}
          >
            <div className={`absolute inset-0 ${particle.color} rounded-full blur-sm opacity-70`}></div>
          </motion.div>
        </div>
      ))}
      
      {/* Enhanced road with 3D perspective effect */}
      <div 
        className="absolute -bottom-10 -left-10 -right-10 h-20 z-0"
        style={{ 
          transform: 'perspective(1000px) rotateX(60deg)',
          transformOrigin: 'center bottom',
          background: 'linear-gradient(to bottom, #1f2937, #111827)',
          boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.3)'
        }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-30"></div>
        <div className="relative h-full flex justify-center items-center overflow-hidden">
          {/* Road markings */}
          <div className="absolute top-1/2 left-0 right-0 h-2 flex justify-center items-center">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: -1000 }}
                animate={{ x: 1000 }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear"
                }}
                className="absolute w-20 h-1 bg-yellow-400 opacity-80 shadow-sm shadow-yellow-300/50 rounded-full"
                style={{ left: `${i * 10 - 50}%` }}
              ></motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Shadow beneath the truck to enhance 3D effect */}
      <motion.div 
        className="absolute bottom-0 w-64 h-4 bg-black/40 rounded-full blur-md z-0"
        animate={{ 
          width: [240, 260, 240],
          opacity: [0.4, 0.5, 0.4]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      ></motion.div>
      
      {/* Coming out of screen effect - overlay frame */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
      </div>
    </div>
  );
}