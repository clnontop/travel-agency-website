'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  MapPin,
  Users,
  Truck,
  Star,
  Search
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';

interface Driver {
  id: string;
  name: string;
  rating: number;
  location: string;
  vehicleType: string;
  distance: string;
  price: string;
  isAvailable: boolean;
  completedJobs: number;
}

export default function CustomerMapPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // State variables
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('all');

  // Simple auth check - prevent hydration error
  if (!user) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading map...</div>
    </div>;
  }

  // City coordinates for driver locations
  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Mumbai Central': { lat: 19.0176, lng: 72.8562 },
    'Andheri West': { lat: 19.1136, lng: 72.8697 },
    'Bandra East': { lat: 19.0596, lng: 72.8656 },
    'Powai': { lat: 19.1197, lng: 72.9056 },
    'Worli': { lat: 19.0176, lng: 72.8118 },
    'Delhi': { lat: 28.6139, lng: 77.2090 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Pune': { lat: 18.5204, lng: 73.8567 }
  };

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = () => {
      if (window.google && window.google.maps) {
        const mapOptions = {
          center: { lat: 19.0760, lng: 72.8777 }, // Mumbai center
          zoom: 12,
          styles: [
            {
              "featureType": "all",
              "elementType": "geometry.fill",
              "stylers": [{ "weight": "2.00" }]
            },
            {
              "featureType": "all",
              "elementType": "geometry.stroke",
              "stylers": [{ "color": "#9c9c9c" }]
            },
            {
              "featureType": "all",
              "elementType": "labels.text",
              "stylers": [{ "visibility": "on" }]
            },
            {
              "featureType": "landscape",
              "elementType": "all",
              "stylers": [{ "color": "#f2f2f2" }]
            },
            {
              "featureType": "landscape",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "landscape.man_made",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "poi",
              "elementType": "all",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "road",
              "elementType": "all",
              "stylers": [{ "saturation": -100 }, { "lightness": 45 }]
            },
            {
              "featureType": "road",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#eeeeee" }]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#7b7b7b" }]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "all",
              "stylers": [{ "visibility": "simplified" }]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.icon",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "transit",
              "elementType": "all",
              "stylers": [{ "visibility": "off" }]
            },
            {
              "featureType": "water",
              "elementType": "all",
              "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }]
            },
            {
              "featureType": "water",
              "elementType": "geometry.fill",
              "stylers": [{ "color": "#c8d7d4" }]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#070707" }]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#ffffff" }]
            }
          ]
        };

        const newMap = new window.google.maps.Map(
          document.getElementById('map'),
          mapOptions
        );

        setMap(newMap);
        addDriverMarkers(newMap);
      }
    };

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBuKI3s7gyePo3-IZfscnKpYzkTJOyT1K4&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  // Add driver markers to map
  const addDriverMarkers = (mapInstance: any) => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    drivers.forEach(driver => {
      const coordinates = cityCoordinates[driver.location];
      if (coordinates) {
        // Create custom marker icon based on availability
        const markerIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: driver.isAvailable ? '#10B981' : '#EF4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        };

        const marker = new window.google.maps.Marker({
          position: coordinates,
          map: mapInstance,
          title: driver.name,
          icon: markerIcon
        });

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; color: #000;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${driver.name}</h3>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="color: #F59E0B;">★</span>
                <span style="margin-left: 4px;">${driver.rating} (${driver.completedJobs} jobs)</span>
              </div>
              <p style="margin: 4px 0; font-size: 14px;">📍 ${driver.location}</p>
              <p style="margin: 4px 0; font-size: 14px;">🚛 ${driver.vehicleType}</p>
              <p style="margin: 4px 0; font-size: 14px; font-weight: bold;">💰 ${driver.price}</p>
              <div style="margin-top: 8px;">
                <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; background-color: ${driver.isAvailable ? '#10B981' : '#EF4444'}; color: white;">
                  ${driver.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
          setSelectedDriver(driver);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
  };

  // Mock drivers data
  const drivers: Driver[] = [
    {
      id: '1',
      name: 'John Smith',
      rating: 4.8,
      location: 'Mumbai Central',
      vehicleType: 'Van',
      distance: '2.3 km',
      price: '₹450/hr',
      isAvailable: true,
      completedJobs: 156
    },
    {
      id: '2',
      name: 'Raj Patel',
      rating: 4.9,
      location: 'Andheri West',
      vehicleType: 'Truck',
      distance: '3.1 km',
      price: '₹650/hr',
      isAvailable: true,
      completedJobs: 203
    },
    {
      id: '3',
      name: 'Mike Johnson',
      rating: 4.7,
      location: 'Bandra East',
      vehicleType: 'Pickup',
      distance: '4.5 km',
      price: '₹380/hr',
      isAvailable: false,
      completedJobs: 89
    },
    {
      id: '4',
      name: 'Amit Kumar',
      rating: 4.6,
      location: 'Powai',
      vehicleType: 'Lorry',
      distance: '5.2 km',
      price: '₹750/hr',
      isAvailable: true,
      completedJobs: 134
    },
    {
      id: '5',
      name: 'David Wilson',
      rating: 4.8,
      location: 'Worli',
      vehicleType: 'Van',
      distance: '1.8 km',
      price: '₹420/hr',
      isAvailable: true,
      completedJobs: 178
    }
  ];

  const filteredDrivers = drivers.filter(driver => {
    const matchesVehicle = selectedVehicleType === 'all' || driver.vehicleType.toLowerCase() === selectedVehicleType.toLowerCase();
    const matchesLocation = searchLocation === '' || driver.location.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesVehicle && matchesLocation;
  });

  // Update markers when drivers change
  useEffect(() => {
    if (map) {
      addDriverMarkers(map);
    }
  }, [map, filteredDrivers]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <MapPin className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Driver Map</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/customer')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-96 lg:h-[600px]"
            >
              <div id="map" className="w-full h-full rounded-lg"></div>
            </motion.div>
          </div>

          {/* Drivers Sidebar */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Find Drivers</h3>
              
              {/* Search Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter location..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Vehicle Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
                <select
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Vehicles</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                  <option value="pickup">Pickup</option>
                  <option value="lorry">Lorry</option>
                </select>
              </div>
            </motion.div>

            {/* Available Drivers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Available Drivers ({filteredDrivers.filter(d => d.isAvailable).length})
              </h3>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredDrivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      driver.isAvailable
                        ? 'bg-gray-700 border-gray-600 hover:border-red-500'
                        : 'bg-gray-800 border-gray-700 opacity-60'
                    }`}
                    onClick={() => driver.isAvailable && setSelectedDriver(driver)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{driver.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-300">{driver.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">{driver.price}</div>
                        <div className="text-xs text-gray-400">{driver.distance}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{driver.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Truck className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-300">{driver.vehicleType}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        driver.isAvailable
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {driver.isAvailable ? 'Available' : 'Busy'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Driver Details Modal */}
        {selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Driver Details</h3>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {selectedDriver.name.charAt(0)}
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">{selectedDriver.name}</h4>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{selectedDriver.rating}</span>
                  <span className="text-gray-400">({selectedDriver.completedJobs} jobs)</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Location</span>
                  <span className="text-white">{selectedDriver.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Vehicle</span>
                  <span className="text-white">{selectedDriver.vehicleType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Distance</span>
                  <span className="text-white">{selectedDriver.distance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Rate</span>
                  <span className="text-white font-semibold">{selectedDriver.price}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle hire driver logic
                    setSelectedDriver(null);
                    router.push('/customer/post-job');
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hire Driver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
