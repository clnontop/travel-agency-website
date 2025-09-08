'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useDrivers, Driver } from '@/store/useDrivers';
import { MapPin, Truck, User, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced coordinates for Indian cities with precise locations
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'Delhi, India': { lat: 28.6139, lng: 77.2090 },
  'Mumbai, India': { lat: 19.0760, lng: 72.8777 },
  'Bangalore, India': { lat: 12.9716, lng: 77.5946 },
  'Pune, India': { lat: 18.5204, lng: 73.8567 },
  'Chennai, India': { lat: 13.0827, lng: 80.2707 },
  'Hyderabad, India': { lat: 17.3850, lng: 78.4867 },
  'Kolkata, India': { lat: 22.5726, lng: 88.3639 },
  'Ahmedabad, India': { lat: 23.0225, lng: 72.5714 },
  'Jaipur, India': { lat: 26.9124, lng: 75.7873 },
  'Lucknow, India': { lat: 26.8467, lng: 80.9462 },
  // Additional precise coordinates for better coverage
  'Gurgaon, India': { lat: 28.4595, lng: 77.0266 },
  'Noida, India': { lat: 28.5355, lng: 77.3910 },
  'Navi Mumbai, India': { lat: 19.0330, lng: 73.0297 },
  'Electronic City, Bangalore': { lat: 12.8456, lng: 77.6603 },
  'Whitefield, Bangalore': { lat: 12.9698, lng: 77.7500 }
};

interface DriverMapProps {
  onDriverSelect?: (driver: Driver) => void;
  showFilters?: boolean;
  className?: string;
}

const DriverMap: React.FC<DriverMapProps> = ({ 
  onDriverSelect, 
  showFilters = true, 
  className = '' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const { drivers, getAvailableDrivers, getOnlineDrivers } = useDrivers();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'available' | 'online'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: 'AIzaSyBuKI3s7gyePo3-IZfscnKpYzkTJOyT1K4',
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 22.9734, lng: 78.6569 }, // Center of India
            zoom: 5,
            styles: [
              {
                "featureType": "administrative.country",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#ff6b35" }, { "weight": 2 }]
              },
              {
                "featureType": "administrative.province",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#ff8c42" }, { "weight": 1 }]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{ "color": "#ff6b35" }]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#ff4500" }, { "weight": 1 }]
              },
              {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#4285f4" }]
              },
              {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#f8f9fa" }]
              },
              {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [{ "visibility": "simplified" }]
              },
              {
                "featureType": "road",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#ffffff" }]
              },
              {
                "featureType": "road",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#dadce0" }]
              }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            restriction: {
              latLngBounds: {
                north: 37.6,
                south: 6.4,
                west: 68.1,
                east: 97.25
              },
              strictBounds: false
            },
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new google.maps.InfoWindow();
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Update markers when drivers or filter changes
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Get filtered drivers
    let filteredDrivers: Driver[] = [];
    switch (filterType) {
      case 'available':
        filteredDrivers = getAvailableDrivers();
        break;
      case 'online':
        filteredDrivers = getOnlineDrivers();
        break;
      default:
        filteredDrivers = drivers;
    }

    // Create markers for each driver
    filteredDrivers.forEach(driver => {
      const coordinates = cityCoordinates[driver.location];
      if (!coordinates) return;

      // Create custom marker icon based on driver status (matching HTML version)
      const getMarkerIcon = (status: string) => {
        const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
        if (!driver.isOnline) return baseUrl + 'grey-dot.png';
        return driver.isAvailable ? baseUrl + 'green-dot.png' : baseUrl + 'red-dot.png';
      };
      
      const markerIcon = getMarkerIcon(driver.isAvailable ? 'available' : 'busy');

      const marker = new google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
        title: driver.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP,
      });

      // Enhanced info window content matching HTML version
      const getStatusColor = (driver: Driver) => {
        if (!driver.isOnline) return '#6b7280';
        return driver.isAvailable ? '#10b981' : '#ef4444';
      };
      
      const infoContent = `
        <div style="padding: 10px; max-width: 250px; font-family: 'Segoe UI', sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px; font-weight: bold;">
            🚛 ${driver.name}
          </h3>
          <div style="margin: 5px 0;">
            <strong>Status:</strong> 
            <span style="color: ${getStatusColor(driver)}; font-weight: bold;">
              ${!driver.isOnline ? 'OFFLINE' : (driver.isAvailable ? 'AVAILABLE' : 'BUSY')}
            </span>
          </div>
          <div style="margin: 5px 0;">
            <strong>Vehicle:</strong> ${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}
          </div>
          <div style="margin: 5px 0;">
            <strong>Rating:</strong> ⭐ ${driver.rating.toFixed(1)}/5.0
          </div>
          <div style="margin: 5px 0;">
            <strong>Contact:</strong> ${driver.phone}
          </div>
          <div style="margin: 5px 0;">
            <strong>Location:</strong> ${driver.location}
          </div>
          <div style="margin: 5px 0;">
            <strong>Capacity:</strong> ${driver.vehicleDetails?.capacity}
          </div>
          ${driver.isAvailable ? 
            '<button onclick="window.bookDriver(\'' + driver.id + '\')" style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-top: 10px; width: 100%;">Book Now</button>' : 
            '<div style="text-align: center; padding: 10px; color: #6b7280;">Driver currently unavailable</div>'
          }
        </div>
      `;

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
        setSelectedDriver(driver);
      });

      markersRef.current.push(marker);
    });

    // Add global functions for button clicks (matching HTML version)
    (window as any).selectDriver = (driverId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver && onDriverSelect) {
        onDriverSelect(driver);
      }
    };

    (window as any).bookDriver = (driverId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
        alert(`Booking request sent to ${driver.name}!\n\nDriver will contact you at your registered number shortly.\n\nVehicle: ${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}\nPhone: ${driver.phone}`);
        console.log('Booking driver:', driver);
        if (onDriverSelect) {
          onDriverSelect(driver);
        }
      }
    };

  }, [isLoaded, drivers, filterType, getAvailableDrivers, getOnlineDrivers, onDriverSelect]);

  // Real-time status simulation (matching HTML version)
  useEffect(() => {
    if (!isLoaded || !drivers.length) return;

    const simulateRealTimeUpdates = () => {
      const interval = setInterval(() => {
        // Randomly update driver status
        const randomIndex = Math.floor(Math.random() * drivers.length);
        const randomDriver = drivers[randomIndex];
        const statuses = ['available', 'busy', 'offline'];
        const currentStatus = !randomDriver.isOnline ? 'offline' : (randomDriver.isAvailable ? 'available' : 'busy');
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        if (currentStatus !== newStatus) {
          const newIsOnline = newStatus !== 'offline';
          const newIsAvailable = newStatus === 'available';
          
          // Update driver status in store
          const { setDriverOnlineStatus, setDriverAvailability } = useDrivers.getState();
          setDriverOnlineStatus(randomDriver.id, newIsOnline);
          if (newIsOnline) {
            setDriverAvailability(randomDriver.id, newIsAvailable);
          }
          
          console.log(`Driver ${randomDriver.name} status updated to: ${newStatus}`);
        }
      }, 10000); // Update every 10 seconds

      return interval;
    };

    const interval = simulateRealTimeUpdates();
    return () => clearInterval(interval);
  }, [isLoaded, drivers]);

  const getStatusColor = (driver: Driver) => {
    if (!driver.isOnline) return 'bg-gray-500';
    return driver.isAvailable ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (driver: Driver) => {
    if (!driver.isOnline) return 'Offline';
    return driver.isAvailable ? 'Available' : 'Busy';
  };

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading driver locations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Filter Controls */}
      {showFilters && (
        <motion.div 
          className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 min-w-[200px] text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-red-600" />
            Filter Drivers
          </h3>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Drivers', count: drivers.length },
              { value: 'available', label: 'Available', count: getAvailableDrivers().length },
              { value: 'online', label: 'Online', count: getOnlineDrivers().length }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value as any)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  filterType === filter.value
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{filter.label}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Driver Stats Panel (matching HTML version) */}
      <motion.div 
        className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 text-gray-900 min-w-[200px]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="driver-count text-lg font-semibold text-gray-900 mb-3">
          Total Drivers: <span className="text-red-600">{drivers.length}</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Available</span>
            </div>
            <span className="text-sm font-medium">{getAvailableDrivers().length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Busy</span>
            </div>
            <span className="text-sm font-medium">{drivers.filter(d => d.isOnline && !d.isAvailable).length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm">Offline</span>
            </div>
            <span className="text-sm font-medium">{drivers.filter(d => !d.isOnline).length}</span>
          </div>
        </div>
      </motion.div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Selected Driver Info Panel */}
      <AnimatePresence>
        {selectedDriver && (
          <motion.div 
            className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 text-gray-900"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{selectedDriver.name}</h3>
                  <p className="text-gray-600">{selectedDriver.vehicleType}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedDriver)}`}></div>
                      <span className="text-sm">{getStatusText(selectedDriver)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{selectedDriver.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{selectedDriver.completedJobs} jobs</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {selectedDriver.isAvailable && onDriverSelect && (
              <button
                onClick={() => onDriverSelect(selectedDriver)}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Contact Driver
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverMap;
