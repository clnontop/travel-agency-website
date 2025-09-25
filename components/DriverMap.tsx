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

  // Get filtered drivers based on current filter
  const getFilteredDrivers = () => {
    switch (filterType) {
      case 'available':
        return getAvailableDrivers();
      case 'online':
        return getOnlineDrivers();
      default:
        return drivers;
    }
  };

  const filteredDrivers = getFilteredDrivers();

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
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#1e3a8a" }]
              }
            ],
            restriction: {
              latLngBounds: {
                north: 37.6,
                south: 6.4,
                west: 68.1,
                east: 97.4,
              },
              strictBounds: false,
            },
          });

          mapInstanceRef.current = map;
          setIsLoaded(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
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

    // Add markers for filtered drivers
    filteredDrivers.forEach((driver) => {
      const coordinates = cityCoordinates[driver.location] || 
                         { lat: 22.9734 + (Math.random() - 0.5) * 10, lng: 78.6569 + (Math.random() - 0.5) * 10 };

      const marker = new google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
        title: driver.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${driver.isOnline ? (driver.isAvailable ? '#10b981' : '#ef4444') : '#6b7280'}" stroke="#ffffff" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">🚛</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });

      // Add click listener for marker
      marker.addListener('click', () => {
        setSelectedDriver(driver);
        
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937;">${driver.name}</h3>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                <strong>Vehicle:</strong> ${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}
              </p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                <strong>Rating:</strong> ⭐ ${driver.rating}/5
              </p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
                <strong>Status:</strong> 
                <span style="color: ${driver.isOnline ? (driver.isAvailable ? '#10b981' : '#ef4444') : '#6b7280'};">
                  ${driver.isOnline ? (driver.isAvailable ? 'Available' : 'Busy') : 'Offline'}
                </span>
              </p>
              <button 
                onclick="window.selectDriver('${driver.id}')"
                style="
                  margin-top: 8px; 
                  padding: 6px 12px; 
                  background: #dc2626; 
                  color: white; 
                  border: none; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 14px;
                "
              >
                Select Driver
              </button>
            </div>
          `
        });

        infoWindow.open(mapInstanceRef.current, marker);
        infoWindowRef.current = infoWindow;
      });

      markersRef.current.push(marker);
    });

    // Global function for button clicks in info windows
    (window as any).selectDriver = (driverId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver && onDriverSelect) {
        onDriverSelect(driver);
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
      }
    };

  }, [isLoaded, filteredDrivers, drivers, onDriverSelect]);

  // Real-time status simulation
  useEffect(() => {
    if (!isLoaded || !drivers.length) return;

    const interval = setInterval(() => {
      const currentFilteredDrivers = getFilteredDrivers();
      
      currentFilteredDrivers.forEach((driver, index) => {
        if (driver.isOnline && markersRef.current[index]) {
          const coordinates = cityCoordinates[driver.location];
          if (coordinates) {
            // Small random movement to simulate real movement
            const lat = coordinates.lat + (Math.random() - 0.5) * 0.001;
            const lng = coordinates.lng + (Math.random() - 0.5) * 0.001;
            
            const newPosition = new google.maps.LatLng(lat, lng);
            markersRef.current[index].setPosition(newPosition);
          }
        }
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLoaded, filterType, drivers, getAvailableDrivers, getOnlineDrivers]);

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
        <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div ref={mapRef} className="h-96 w-full rounded-lg overflow-hidden" />

      {/* Filter Controls */}
      {showFilters && (
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({drivers.length})
            </button>
            <button
              onClick={() => setFilterType('available')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filterType === 'available'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Available ({getAvailableDrivers().length})
            </button>
            <button
              onClick={() => setFilterType('online')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filterType === 'online'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Online ({getOnlineDrivers().length})
            </button>
          </div>
        </div>
      )}

      {/* Driver Details Panel */}
      <AnimatePresence>
        {selectedDriver && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm rounded-xl p-6 w-80 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedDriver.name}</h3>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  {selectedDriver.vehicleDetails?.make} {selectedDriver.vehicleDetails?.model}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">{selectedDriver.location}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300 text-sm">{selectedDriver.rating}/5</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedDriver)}`}></div>
                <span className="text-gray-300 text-sm">{getStatusText(selectedDriver)}</span>
              </div>
            </div>

            {onDriverSelect && (
              <button
                onClick={() => onDriverSelect(selectedDriver)}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Select Driver
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverMap;
