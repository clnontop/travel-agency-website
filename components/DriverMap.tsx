'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useDrivers, Driver } from '@/store/useDrivers';
import { MapPin, Truck, User, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock coordinates for Indian cities (you can replace with actual geocoding)
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
  'Lucknow, India': { lat: 26.8467, lng: 80.9462 }
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
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 20.5937, lng: 78.9629 }, // Center of India
            zoom: 5,
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
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
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

      // Create custom marker icon based on driver status
      const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: driver.isAvailable ? (driver.isOnline ? '#10B981' : '#F59E0B') : '#EF4444',
        fillOpacity: 0.9,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      };

      const marker = new google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
        title: driver.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP,
      });

      // Create info window content
      const infoContent = `
        <div class="p-4 max-w-sm">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg text-gray-900">${driver.name}</h3>
              <p class="text-sm text-gray-600">${driver.vehicleType}</p>
            </div>
          </div>
          
          <div class="space-y-2 mb-3">
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-gray-400'}"></span>
              <span class="text-sm">${driver.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full ${driver.isAvailable ? 'bg-green-500' : 'bg-red-500'}"></span>
              <span class="text-sm">${driver.isAvailable ? 'Available' : 'Busy'}</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span class="text-sm">${driver.rating.toFixed(1)} (${driver.completedJobs} jobs)</span>
            </div>
          </div>
          
          <div class="text-xs text-gray-500 mb-3">
            <p>📍 ${driver.location}</p>
            <p>🚛 ${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}</p>
            <p>📦 Capacity: ${driver.vehicleDetails?.capacity}</p>
          </div>
          
          <button 
            onclick="window.selectDriver('${driver.id}')"
            class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ${driver.isAvailable ? 'Contact Driver' : 'View Profile'}
          </button>
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

    // Add global function for button clicks
    (window as any).selectDriver = (driverId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver && onDriverSelect) {
        onDriverSelect(driver);
      }
    };

  }, [isLoaded, drivers, filterType, getAvailableDrivers, getOnlineDrivers, onDriverSelect]);

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

      {/* Driver Stats */}
      <motion.div 
        className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 text-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available ({getAvailableDrivers().length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Busy ({drivers.filter(d => !d.isAvailable).length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Offline ({drivers.filter(d => !d.isOnline).length})</span>
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
