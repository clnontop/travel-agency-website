'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Users, 
  Clock,
  Shield,
  Wifi,
  WifiOff,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export default function DriverLocationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.type !== 'driver') {
      router.push('/driver');
      return;
    }
    
    loadActiveBookings();
    
    return () => {
      stopLocationSharing();
    };
  }, [user]);

  const loadActiveBookings = async () => {
    try {
      const response = await fetch('/api/bookings/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };
          resolve(locationData);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const sendLocationToServer = async (locationData: LocationData) => {
    try {
      const response = await fetch('/api/driver/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          driverId: user?.id,
          location: locationData,
          activeJobs: activeBookings.map(b => b.id)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send location');
      }

      console.log('Location sent successfully');
    } catch (error) {
      console.error('Error sending location:', error);
      toast.error('Failed to update location');
    }
  };

  const startLocationSharing = async () => {
    try {
      // Get initial location
      const initialLocation = await getCurrentLocation();
      setLocation(initialLocation);
      setLocationHistory(prev => [...prev.slice(-49), initialLocation]);
      
      // Send initial location
      await sendLocationToServer(initialLocation);
      
      // Start watching position
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };
          
          setLocation(locationData);
          setLocationHistory(prev => [...prev.slice(-49), locationData]);
          await sendLocationToServer(locationData);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Location tracking error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );

      setWatchId(id);
      setIsSharing(true);
      
      // Also send location every 30 seconds as backup
      intervalRef.current = setInterval(async () => {
        try {
          const currentLocation = await getCurrentLocation();
          await sendLocationToServer(currentLocation);
        } catch (error) {
          console.error('Interval location error:', error);
        }
      }, 30000);

      toast.success('Location sharing started');
    } catch (error) {
      console.error('Error starting location sharing:', error);
      toast.error('Failed to start location sharing');
    }
  };

  const stopLocationSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsSharing(false);
    toast.success('Location sharing stopped');
  };

  const toggleLocationSharing = () => {
    if (isSharing) {
      stopLocationSharing();
    } else {
      startLocationSharing();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/driver/dashboard')}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Location Sharing</h1>
                  <p className="text-sm text-slate-400">Share your location with customers</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isSharing ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-slate-500" />
                )}
                <span className="text-sm text-slate-400">
                  {isSharing ? 'Sharing' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Location Status</h2>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  isSharing ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                }`}>
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {isSharing ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {location && (
                  <>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Current Location</div>
                      <div className="text-white font-mono text-sm">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Accuracy: ±{Math.round(location.accuracy)}m
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Last Update</div>
                      <div className="text-white text-sm">
                        {location.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {location.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={toggleLocationSharing}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                  isSharing
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                {isSharing ? 'Stop Sharing Location' : 'Start Sharing Location'}
              </button>
            </motion.div>

            {/* Privacy Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6"
            >
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-blue-400 font-semibold mb-2">Privacy Protection</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Your location is only visible to customers who have hired you for active bookings. 
                    No other users can see your location. You can stop sharing at any time.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Bookings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-5 w-5 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Active Bookings</h3>
              </div>
              
              {activeBookings.length > 0 ? (
                <div className="space-y-3">
                  {activeBookings.map((booking, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="text-white font-medium text-sm">
                        {booking.customerName}
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        {booking.pickup} → {booking.destination}
                      </div>
                      <div className="text-green-400 text-xs mt-1">
                        Can see your location
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-slate-500 text-sm">No active bookings</div>
                  <div className="text-slate-600 text-xs mt-1">
                    Location sharing is private when no bookings are active
                  </div>
                </div>
              )}
            </motion.div>

            {/* Location History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Recent Updates</h3>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {locationHistory.slice(-10).reverse().map((loc, index) => (
                  <div key={index} className="text-xs">
                    <div className="text-slate-400">
                      {loc.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="text-slate-500 font-mono">
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </div>
                  </div>
                ))}
                
                {locationHistory.length === 0 && (
                  <div className="text-slate-500 text-sm text-center py-4">
                    No location updates yet
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
