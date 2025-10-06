'use client';

import { useState, useEffect, useRef } from 'react';
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
  Activity,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DriverLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  lastUpdated: string;
}

interface ActiveBooking {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehicleNumber: string;
  pickup: string;
  destination: string;
  status: string;
  fare: number;
  estimatedTime: string;
}

export default function TrackDriverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (user?.type !== 'customer') {
      router.push('/customer/dashboard');
      return;
    }
    
    loadActiveBooking();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    if (activeBooking) {
      startLocationTracking();
      initializeMap();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeBooking]);

  const loadActiveBooking = async () => {
    try {
      const response = await fetch('/api/bookings/customer/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.booking) {
          setActiveBooking(data.booking);
        } else {
          toast.error('No active booking found');
          router.push('/customer/dashboard');
        }
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDriverLocation = async () => {
    if (!activeBooking) return;
    
    try {
      setConnectionStatus('connecting');
      
      const response = await fetch(
        `/api/driver/location?driverId=${activeBooking.driverId}&customerId=${user?.id}&jobId=${activeBooking.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.location) {
          setDriverLocation(data.location);
          setLastUpdate(new Date());
          setConnectionStatus('connected');
          updateMapLocation(data.location);
        }
      } else {
        setConnectionStatus('disconnected');
        console.error('Failed to fetch driver location');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('Error fetching driver location:', error);
    }
  };

  const startLocationTracking = () => {
    // Initial fetch
    fetchDriverLocation();
    
    // Set up interval for real-time updates every 10 seconds
    intervalRef.current = setInterval(() => {
      fetchDriverLocation();
    }, 10000);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ color: '#1e293b' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0f172a' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#374151' }]
        }
      ]
    });

    mapInstanceRef.current = map;
  };

  const updateMapLocation = (location: DriverLocation) => {
    if (!mapInstanceRef.current) return;

    const position = {
      lat: location.latitude,
      lng: location.longitude
    };

    // Update or create driver marker
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setPosition(position);
    } else {
      driverMarkerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: `${activeBooking?.driverName} - ${activeBooking?.vehicleNumber}`,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="#fff" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🚚</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40)
        }
      });
    }

    // Center map on driver location
    mapInstanceRef.current.setCenter(position);
  };

  const callDriver = () => {
    if (activeBooking?.driverPhone) {
      window.open(`tel:${activeBooking.driverPhone}`);
    }
  };

  const openChat = () => {
    // Navigate to chat with driver
    router.push(`/customer/chat?driverId=${activeBooking?.driverId}`);
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
          <p className="text-slate-400">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!activeBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Booking</h2>
          <p className="text-slate-400 mb-6">You don't have any active bookings to track.</p>
          <button
            onClick={() => router.push('/customer/dashboard')}
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
                onClick={() => router.push('/customer/dashboard')}
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
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium capitalize">{connectionStatus}</span>
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
                <button
                  onClick={fetchDriverLocation}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
              
              <div 
                ref={mapRef}
                className="w-full h-96 bg-slate-700 rounded-lg"
              >
                {!window.google && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {driverLocation && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Coordinates</div>
                    <div className="text-white font-mono text-sm">
                      {driverLocation.latitude.toFixed(6)}, {driverLocation.longitude.toFixed(6)}
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
                  <div className="text-white font-medium">{activeBooking.driverName}</div>
                  <div className="text-slate-400 text-sm">{activeBooking.driverPhone}</div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="text-white text-sm">{activeBooking.vehicleType}</div>
                    <div className="text-slate-400 text-xs">{activeBooking.vehicleNumber}</div>
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
                    onClick={openChat}
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
                  <div className="text-white">{activeBooking.pickup}</div>
                </div>
                
                <div>
                  <div className="text-slate-400 text-sm mb-1">To</div>
                  <div className="text-white">{activeBooking.destination}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Fare</div>
                    <div className="text-green-400 font-semibold">₹{activeBooking.fare}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Status</div>
                    <div className="text-yellow-400 font-semibold capitalize">{activeBooking.status}</div>
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
                  Location updates every 10 seconds
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  Last update: {getTimeSinceUpdate()}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Load Google Maps */}
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        async
        defer
      />
    </div>
  );
}
