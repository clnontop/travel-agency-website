'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Shield, 
  Clock, 
  Users, 
  Star, 
  ArrowRight, 
  Package, 
  User, 
  Building, 
  Menu, 
  X, 
  CheckCircle, 
  Crown, 
  ChevronRight, 
  LifeBuoy, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Briefcase,
  TrendingUp,
  Activity,
  Info,
  Search,
  Clipboard,
  Plus,
  List,
  Bell,
  Award,
  Zap,
  Headphones as HeadphonesIcon,
  Play,
  UserCheck,
  CreditCard,
  Navigation,
  MessageCircle
} from 'lucide-react';
import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import PaymentNotification from '@/components/PaymentNotification';
import JobSyncListener from '@/components/JobSyncListener';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigation } from '@/hooks/useNavigation';
import Link from 'next/link';
import Image from 'next/image';
import VideoPlayer from '@/components/VideoPlayer';
import UserAccountManager from '@/components/UserAccountManager';

// Dynamically import 3D components to avoid SSR issues
const EnhancedHero = dynamic(() => import('@/components/EnhancedHero'), { ssr: false });
const ModernFeatures = dynamic(() => import('@/components/ModernFeatures'), { ssr: false });

export default function Home() {
  const router = useRouter();
  const { navigateWithLoading } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleAction = async (action: string) => {
    setMobileMenuOpen(false); // Close mobile menu when action is taken
    switch (action) {
      case 'signin':
        await navigateWithLoading('/auth/login', 'Redirecting to login...', 600);
        break;
      case 'register':
        await navigateWithLoading('/auth/register', 'Setting up registration...', 600);
        break;
      case 'post-job':
        toast.success('Job posting feature coming soon!');
        break;
      case 'find-jobs':
        toast.success('Job search feature coming soon!');
        break;
      case 'learn-more':
        toast.success('More information coming soon!');
        break;
      case 'watch-demo':
        setShowVideoPlayer(true);
        break;
      case 'chat':
        await navigateWithLoading('/chat', 'Opening chat...', 500);
        break;
      default:
        break;
    }
  };
  
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <PaymentNotification />
      <JobSyncListener />
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-red-500/10 particle-animation"
              style={{
                width: Math.random() * 6 + 4 + 'px',
                height: Math.random() * 6 + 4 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 8 + 's',
                animationDuration: (Math.random() * 10 + 8) + 's'
              }}
            />
          ))}
        </div>
        {/* Enhanced Navigation */}
        <motion.nav 
          className="fixed top-0 w-full z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => router.push('/')}
              >
                <motion.div
                  animate={{ rotate: [0, 2, 0, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <Image
                    src="/logo.png"
                    alt="Trinck Logo"
                    width={40}
                    height={40}
                    className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 object-contain rounded-lg"
                    priority
                  />
                </motion.div>
                <span className="text-xl sm:text-2xl font-bold text-gradient text-shimmer">Trinck</span>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden md:flex items-center space-x-8"
              >
                {[
                  { name: 'Features', section: 'features', delay: 0.1 },
                  { name: 'Customers', section: 'customers', delay: 0.2 },
                  { name: 'Drivers', section: 'drivers', delay: 0.3 },
                  { name: 'Contact', section: 'contact', delay: 0.4 }
                ].map((item) => (
                  <motion.button 
                    key={item.section}
                    onClick={() => scrollToSection(item.section)} 
                    className="text-gray-300 hover:text-red-500 transition-colors relative group"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: item.delay }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.name}
                    <motion.div 
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"
                      whileHover={{ width: '100%' }}
                    />
                  </motion.button>
                ))}
              </motion.div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden sm:block">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2 sm:space-x-4"
                  >
                    <motion.button 
                      onClick={() => handleAction('signin')}
                      className="btn-secondary text-sm sm:text-base py-2 px-3 sm:py-3 sm:px-6 relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-700/0 via-gray-600/30 to-gray-700/0 animate-shimmer"></div>
                      <span className="relative z-10">Sign In</span>
                    </motion.button>
                    <motion.button 
                      onClick={() => handleAction('register')}
                      className="btn-primary text-sm sm:text-base py-2 px-3 sm:py-3 sm:px-6 relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-400/30 to-red-600/0 animate-shimmer"></div>
                      <span className="relative z-10">Get Started</span>
                    </motion.button>
                  </motion.div>
                </div>
                <motion.button 
                  className="md:hidden text-white relative"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      rotate: mobileMenuOpen ? 90 : 0,
                      opacity: mobileMenuOpen ? 0 : 1
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ position: mobileMenuOpen ? 'absolute' : 'relative', top: 0, left: 0 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                  <motion.div
                    initial={false}
                    animate={{
                      rotate: mobileMenuOpen ? 0 : -90,
                      opacity: mobileMenuOpen ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    style={{ position: !mobileMenuOpen ? 'absolute' : 'relative', top: 0, left: 0 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu - Enhanced with Animations */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden bg-gray-800 border-b border-gray-700"
              >
                <div className="px-4 py-3 space-y-3">
                  {["features", "customers", "drivers", "contact"].map((section, index) => (
                    <motion.button 
                      key={section}
                      onClick={() => scrollToSection(section)} 
                      className="block w-full text-left py-2 text-gray-300 hover:text-red-500 transition-colors relative overflow-hidden group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                      <motion.div 
                        className="absolute bottom-0 left-0 h-0.5 bg-red-500 w-0 group-hover:w-full"
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  ))}
                  <motion.div 
                    className="flex flex-col space-y-2 pt-2 border-t border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button 
                      onClick={() => handleAction('signin')}
                      className="btn-secondary text-sm py-2 px-3 w-full relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-700/0 via-gray-600/30 to-gray-700/0 animate-shimmer"></div>
                      <span className="relative z-10">Sign In</span>
                    </motion.button>
                    <motion.button 
                      onClick={() => handleAction('register')}
                      className="btn-primary text-sm py-2 px-3 w-full relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-400/30 to-red-600/0 animate-shimmer"></div>
                      <span className="relative z-10">Get Started</span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Enhanced Hero Section */}
        <EnhancedHero onAction={handleAction} />

        {/* Main Login Interface */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 text-shimmer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to <span className="text-red-500">Trinck</span>
              </motion.h1>
              <motion.p 
                className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                
              </motion.p>
            </motion.div>

            {/* Dual Login Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Customer Login */}
              <motion.div
                className="relative bg-gradient-to-br from-blue-900/40 to-blue-800/30 backdrop-blur-xl border border-blue-500/40 rounded-3xl p-8 text-center group hover:border-blue-400/60 transition-all duration-500 shadow-2xl hover:shadow-blue-500/20"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <motion.div 
                  className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/30 transition-all duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <User className="h-10 w-10 text-blue-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-4">I'm a Customer</h2>
                <p className="text-gray-300 mb-8 text-lg">Need to ship goods? Find trusted drivers and track your deliveries in real-time.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-300">
                    <Package className="h-5 w-5 text-blue-400 mr-3" />
                    <span>Post delivery jobs</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Navigation className="h-5 w-5 text-blue-400 mr-3" />
                    <span>Track deliveries live</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Shield className="h-5 w-5 text-blue-400 mr-3" />
                    <span>Secure payments</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => navigateWithLoading('/auth/login?type=customer', 'Loading customer portal...', 600)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/30 to-blue-600/0 animate-shimmer"></div>
                  <span className="relative z-10 flex items-center justify-center">
                    Login as Customer
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </motion.button>
                <Link href="/auth/register?type=customer" className="block mt-4 text-blue-400 hover:text-blue-300 transition-colors">
                  New customer? Register here
                </Link>
              </motion.div>

              {/* Trucker Login */}
              <motion.div
                className="relative bg-gradient-to-br from-red-900/40 to-red-800/30 backdrop-blur-xl border border-red-500/40 rounded-3xl p-8 text-center group hover:border-red-400/60 transition-all duration-500 shadow-2xl hover:shadow-red-500/20"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                whileHover={{ scale: 1.03, y: -8 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <motion.div 
                  className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500/30 transition-all duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <Truck className="h-10 w-10 text-red-400" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-4">I'm a Trucker</h2>
                <p className="text-gray-300 mb-8 text-lg">Ready to earn? Find delivery jobs and grow your trucking business with us.</p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-300">
                    <DollarSign className="h-5 w-5 text-red-400 mr-3" />
                    <span>Earn more money</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Crown className="h-5 w-5 text-red-400 mr-3" />
                    <span>Premium priority listing</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MessageCircle className="h-5 w-5 text-red-400 mr-3" />
                    <span>Direct customer chat</span>
                  </div>
                </div>
                <motion.button
                  onClick={() => navigateWithLoading('/auth/login?type=driver', 'Loading driver portal...', 600)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-400/30 to-red-600/0 animate-shimmer"></div>
                  <span className="relative z-10 flex items-center justify-center">
                    Login as Trucker
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </motion.button>
                <Link href="/auth/register?type=driver" className="block mt-4 text-red-400 hover:text-red-300 transition-colors">
                  New trucker? Register here
                </Link>
              </motion.div>
            </div>

            {/* Trust & Safety Section */}
            <motion.div 
              className="mt-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="flex items-center justify-center space-x-8 text-gray-400">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-green-400 mr-2" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center">
                  <UserCheck className="h-6 w-6 text-blue-400 mr-2" />
                  <span>Verified Users</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-6 w-6 text-purple-400 mr-2" />
                  <span>Safe Payments</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Modern Features Section */}
        <ModernFeatures />

        {/* Premium Section with Enhanced Animations */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-90"></div>
          
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-red-500/20"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: 0.1, scale: 0 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1], 
                  scale: [1, 1.5, 1],
                  x: [0, Math.random() * 50 - 25, 0],
                  y: [0, Math.random() * 50 - 25, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 10 + Math.random() * 20,
                  ease: "easeInOut",
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>
          
          <motion.div 
            className="max-w-7xl mx-auto relative z-10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-shimmer">Premium Experience</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">Upgrade to Trinck Premium for exclusive benefits and enhanced features.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Shield className="h-10 w-10" />,
                  title: "Enhanced Security",
                  description: "Advanced security features to protect your shipments and personal information.",
                  delay: 0.1
                },
                {
                  icon: <Zap className="h-10 w-10" />,
                  title: "Priority Shipping",
                  description: "Get your shipments delivered faster with our priority shipping options.",
                  delay: 0.3
                },
                {
                  icon: <HeadphonesIcon className="h-10 w-10" />,
                  title: "24/7 Support",
                  description: "Access to our dedicated support team around the clock for any assistance.",
                  delay: 0.5
                }
              ].map((card, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-red-500 transition-all duration-300 relative overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: card.delay, duration: 0.6 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.2)" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/0 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <motion.div 
                    className="text-red-500 mb-4 relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {card.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">{card.title}</h3>
                  <p className="text-gray-300 relative z-10">{card.description}</p>
                  
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-red-500/0 group-hover:border-red-500 transition-colors duration-300"></div>
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-red-500/0 group-hover:border-red-500 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-red-500/0 group-hover:border-red-500 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-red-500/0 group-hover:border-red-500 transition-colors duration-300"></div>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.button 
                onClick={() => handleAction('premium')}
                className="btn-primary py-3 px-8 text-lg relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-400/30 to-red-600/0 animate-shimmer"></div>
                <span className="relative z-10 flex items-center justify-center">
                  Get Premium Access
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* Video Player */}
        <VideoPlayer
          src="/demo-video.mp4"
          title="Trinck Platform Demo"
          isOpen={showVideoPlayer}
          onClose={() => setShowVideoPlayer(false)}
        />

        {/* User Account Manager */}
        <UserAccountManager />
      </div>
    </>
  );
}

const features = [
  {
    title: "Secure Payments",
    description: "Built-in wallet system ensures secure and instant payments between drivers and customers.",
    icon: Shield,
  },
  {
    title: "Real-time Tracking",
    description: "Track your shipments in real-time with our advanced GPS tracking system.",
    icon: MapPin,
  },
  {
    title: "Verified Drivers",
    description: "All drivers are thoroughly vetted and verified for your safety and peace of mind.",
    icon: Users,
  },
  {
    title: "Instant Bidding",
    description: "Get competitive bids from qualified drivers within minutes of posting your job.",
    icon: DollarSign,
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock customer support to help you with any questions or issues.",
    icon: Clock,
  },
  {
    title: "Rating System",
    description: "Rate and review drivers and customers to maintain quality standards.",
    icon: Star,
  },
];

const customerFeatures = [
  {
    title: "Post Jobs Instantly",
    description: "Create detailed transportation requests and get bids from qualified drivers within minutes.",
    icon: Package,
  },
  {
    title: "Track Shipments",
    description: "Monitor your goods in real-time with GPS tracking and status updates.",
    icon: MapPin,
  },
  {
    title: "Secure Payments",
    description: "Pay securely through our built-in wallet system with protection guarantees.",
    icon: Shield,
  },
  {
    title: "Choose Drivers",
    description: "Select from verified drivers based on ratings, reviews, and competitive pricing.",
    icon: Users,
  },
];

const driverFeatures = [
  {
    title: "Find Jobs",
    description: "Browse available transportation jobs and bid on opportunities that match your route.",
    icon: Package,
  },
  {
    title: "Earn Money",
    description: "Get paid securely and quickly through our integrated payment system.",
    icon: DollarSign,
  },
  {
    title: "Build Reputation",
    description: "Earn ratings and reviews to build your professional reputation.",
    icon: Star,
  },
  {
    title: "Flexible Schedule",
    description: "Choose jobs that fit your schedule and preferred routes.",
    icon: Clock,
  },
];

const stats = [
  // Removed fake statistics for new website
];