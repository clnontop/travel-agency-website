'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageCircle,
  ArrowLeft,
  Clock,
  Route,
  User,
  Truck,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/store/useAuth';
import { useJobs } from '@/store/useJobs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function TrackDriverPage() {
  const { user } = useAuth();
  const { getActiveJobsForCustomer } = useJobs();
  const router = useRouter();
  const [activeJob, setActiveJob] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Simple auth check
  if (!user) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  useEffect(() => {
    loadActiveJob();
    
    // Simulate location updates every 5 seconds
    const interval = setInterval(() => {
      if (activeJob) {
        simulateDriverLocation();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, activeJob]);

  const loadActiveJob = () => {
    try {
      if (!user?.id) return;
      
      const activeJobs = getActiveJobsForCustomer(user.id);
      if (activeJobs.length > 0) {
        const job = activeJobs[0];
        setActiveJob(job);
        console.log('✅ Active job loaded:', job);
        simulateDriverLocation(); // Initial location
      } else {
        toast.error('No active job found');
        router.push('/customer');
      }
    } catch (error) {
      console.error('Error loading active job:', error);
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateDriverLocation = () => {
    // Simulate moving driver location (Delhi area)
    const baseLocation = { lat: 28.6139, lng: 77.2090 };
    const mockLocation = {
      lat: baseLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: baseLocation.lng + (Math.random() - 0.5) * 0.01,
      accuracy: 10 + Math.random() * 20,
      timestamp: new Date()
    };
    
    setDriverLocation(mockLocation);
    setLastUpdate(new Date());
  };

  const callDriver = () => {
    if (activeJob?.selectedDriverPhone) {
      window.open(`tel:${activeJob.selectedDriverPhone}`);
    } else {
      toast.error('Driver phone number not available');
    }
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'Never';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!activeJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Job</h2>
          <p className="text-slate-400 mb-6">You don't have any active jobs with hired drivers to track.</p>
          <button
            onClick={() => router.push('/customer')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/customer')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                  <Navigation className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Track Your Driver</h1>
                  <p className="text-sm text-slate-400">Real-time location tracking</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Live Location</h2>
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Tracking Active</span>
                </div>
              </div>
              
              <div className="w-full h-96 bg-slate-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulated Map */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-800"></div>
                <div className="relative z-10 text-center">
                  <MapPin className="h-12 w-12 text-red-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-white font-semibold">{activeJob.selectedDriverName || 'Driver'}</p>
                  <p className="text-slate-400 text-sm">Moving towards destination</p>
                </div>
                
                {/* Animated route line */}
                <div className="absolute top-1/2 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-red-500 to-blue-500 animate-pulse"></div>
              </div>
              
              {driverLocation && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Coordinates</div>
                    <div className="text-white font-mono text-sm">
                      {driverLocation.lat.toFixed(6)}, {driverLocation.lng.toFixed(6)}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Accuracy</div>
                    <div className="text-white text-sm">±{Math.round(driverLocation.accuracy)}m</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Last Update</div>
                    <div className="text-white text-sm">{getTimeSinceUpdate()}</div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Driver Info & Controls */}
          <div className="space-y-6">
            {/* Driver Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Your Driver</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-white font-medium">{activeJob.selectedDriverName || 'Driver Name'}</div>
                  <div className="text-slate-400 text-sm">{activeJob.selectedDriverPhone || 'Phone not available'}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-white text-sm">{activeJob.vehicleType || 'Truck'}</div>
                    <div className="text-slate-400 text-xs">Vehicle details</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={callDriver}
                    className="flex items-center justify-center space-x-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Call</span>
                  </button>
                  <button
                    onClick={() => toast.success('Chat feature coming soon!')}
                    className="flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">Chat</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Trip Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Route className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Trip Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-slate-400 text-sm mb-1">From</div>
                  <div className="text-white">{activeJob.pickup}</div>
                </div>
                
                <div>
                  <div className="text-slate-400 text-sm mb-1">To</div>
                  <div className="text-white">{activeJob.delivery}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Budget</div>
                    <div className="text-green-400 font-semibold">₹{activeJob.budget}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Status</div>
                    <div className="text-yellow-400 font-semibold capitalize">{activeJob.status}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Location Updates */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Updates</h3>
              </div>
              
              <div className="text-center py-4">
                <div className="text-slate-400 text-sm">
                  Location updates every 5 seconds
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  Last update: {getTimeSinceUpdate()}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
