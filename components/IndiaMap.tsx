'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDrivers, Driver } from '@/store/useDrivers';
import { MapPin, Navigation, Truck, User, Star, Clock, Phone, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Load Google Maps script dynamically
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO_BcqCGUOdABQ&libraries=places,geometry&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Add global callback
    (window as any).initMap = () => {
      resolve();
      delete (window as any).initMap;
    };
    
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
};

// Real Indian cities with accurate coordinates
const indianCities: { [key: string]: { lat: number; lng: number } } = {
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
  'Surat, India': { lat: 21.1702, lng: 72.8311 },
  'Kanpur, India': { lat: 26.4499, lng: 80.3319 },
  'Nagpur, India': { lat: 21.1458, lng: 79.0882 },
  'Indore, India': { lat: 22.7196, lng: 75.8577 },
  'Thane, India': { lat: 19.2183, lng: 72.9781 },
  'Bhopal, India': { lat: 23.2599, lng: 77.4126 },
  'Visakhapatnam, India': { lat: 17.6868, lng: 83.2185 },
  'Pimpri-Chinchwad, India': { lat: 18.6298, lng: 73.7997 },
  'Patna, India': { lat: 25.5941, lng: 85.1376 },
  'Vadodara, India': { lat: 22.3072, lng: 73.1812 }
};

interface IndiaMapProps {
  onDriverSelect?: (driver: Driver) => void;
  showNearestOnly?: boolean;
  userLocation?: { lat: number; lng: number };
  className?: string;
}

const IndiaMap: React.FC<IndiaMapProps> = ({ 
  onDriverSelect, 
  showNearestOnly = false,
  userLocation,
  className = '' 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  
  const { drivers, getAvailableDrivers } = useDrivers();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [nearestDrivers, setNearestDrivers] = useState<Driver[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(userLocation || null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setIsLocating(false);
          
          // Center map on user location
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(10);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          // Fallback to Delhi center
          const fallback = { lat: 28.6139, lng: 77.2090 };
          setCurrentLocation(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Find nearest drivers
  const findNearestDrivers = useCallback(() => {
    if (!currentLocation) return [];
    
    const availableDrivers = getAvailableDrivers();
    const driversWithDistance = availableDrivers.map(driver => {
      const driverCoords = indianCities[driver.location];
      if (!driverCoords) return null;
      
      const distance = calculateDistance(
        currentLocation.lat, 
        currentLocation.lng, 
        driverCoords.lat, 
        driverCoords.lng
      );
      
      return { ...driver, distance };
    }).filter(Boolean) as (Driver & { distance: number })[];
    
    // Sort by distance and return top 5
    return driversWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 5);
  }, [currentLocation, getAvailableDrivers, calculateDistance]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsScript();

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: currentLocation || { lat: 20.5937, lng: 78.9629 }, // Center of India
            zoom: currentLocation ? 10 : 5,
            styles: [
              // India-focused map styling
              {
                "featureType": "administrative.country",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#ff6b35" }, { "weight": 2 }]
              },
              {
                "featureType": "administrative.province",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#ff9068" }, { "weight": 1 }]
              },
              {
                "featureType": "landscape",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#f8f4f0" }]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#ff6b35" }]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [{ "color": "#e55a2b" }]
              },
              {
                "featureType": "road.arterial",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#ffa085" }]
              },
              {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{ "color": "#54a3d1" }]
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
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_CENTER,
            },
            streetViewControl: true,
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
  }, [currentLocation]);

  // Update nearest drivers when location changes
  useEffect(() => {
    if (currentLocation) {
      const nearest = findNearestDrivers();
      setNearestDrivers(nearest);
    }
  }, [currentLocation, findNearestDrivers]);

  // Update markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add user location marker
    if (currentLocation && userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }
    
    if (currentLocation) {
      const userMarker = new google.maps.Marker({
        position: currentLocation,
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });
      userMarkerRef.current = userMarker;
    }

    // Get drivers to display
    const driversToShow = showNearestOnly ? nearestDrivers : getAvailableDrivers();

    // Create markers for drivers
    driversToShow.forEach((driver, index) => {
      const coordinates = indianCities[driver.location];
      if (!coordinates) return;

      const isNearest = nearestDrivers.some(nd => nd.id === driver.id);
      
      // Enhanced marker styling
      const markerIcon = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: isNearest ? 8 : 6,
        fillColor: isNearest ? '#10B981' : (driver.isAvailable ? '#F59E0B' : '#EF4444'),
        fillOpacity: 0.9,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        rotation: 0,
      };

      const marker = new google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
        title: driver.name,
        icon: markerIcon,
        animation: google.maps.Animation.DROP,
        zIndex: isNearest ? 1000 : 100,
      });

      // Enhanced info window
      const distance = currentLocation ? 
        calculateDistance(currentLocation.lat, currentLocation.lng, coordinates.lat, coordinates.lng) : null;

      const infoContent = `
        <div class="p-4 max-w-sm bg-white rounded-lg">
          <div class="flex items-center space-x-3 mb-3">
            <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg text-gray-900">${driver.name}</h3>
              <p class="text-sm text-gray-600">${driver.vehicleType}</p>
              ${isNearest ? '<span class="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Nearest Driver</span>' : ''}
            </div>
          </div>
          
          <div class="space-y-2 mb-3">
            ${distance ? `<div class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-sm font-medium">${distance.toFixed(1)} km away</span>
            </div>` : ''}
            <div class="flex items-center space-x-2">
              <span class="w-2 h-2 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-gray-400'}"></span>
              <span class="text-sm">${driver.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span class="text-sm">${driver.rating.toFixed(1)} ★ (${driver.completedJobs} jobs)</span>
            </div>
          </div>
          
          <div class="text-xs text-gray-500 mb-3">
            <p>📍 ${driver.location}</p>
            <p>🚛 ${driver.vehicleDetails?.make} ${driver.vehicleDetails?.model}</p>
            <p>📦 Capacity: ${driver.vehicleDetails?.capacity}</p>
            <p>📞 ${driver.phone}</p>
          </div>
          
          <div class="flex space-x-2">
            <button 
              onclick="window.selectDriver('${driver.id}')"
              class="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Contact Driver
            </button>
            ${distance ? `<button 
              onclick="window.getDirections('${coordinates.lat}', '${coordinates.lng}')"
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Get Directions"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
            </button>` : ''}
          </div>
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

    // Global functions for button clicks
    (window as any).selectDriver = (driverId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver && onDriverSelect) {
        onDriverSelect(driver);
      }
    };

    (window as any).getDirections = (lat: string, lng: string) => {
      if (currentLocation) {
        const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${lat},${lng}`;
        window.open(url, '_blank');
      }
    };

  }, [isLoaded, drivers, nearestDrivers, currentLocation, showNearestOnly, getAvailableDrivers, calculateDistance, onDriverSelect]);

  if (isLoading) {
    return (
      <div className={`relative ${className} min-h-[500px]`}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading India Map...</p>
            <p className="text-gray-500 text-sm">Connecting to Google Maps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Location Controls */}
      <motion.div 
        className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 min-w-[250px]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-red-600" />
          Your Location
        </h3>
        
        {!currentLocation ? (
          <button
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLocating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Find My Location</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Location detected</span>
            </div>
            <button
              onClick={getCurrentLocation}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Update Location
            </button>
          </div>
        )}
      </motion.div>

      {/* Nearest Drivers Panel */}
      {currentLocation && nearestDrivers.length > 0 && (
        <motion.div 
          className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Truck className="w-4 h-4 mr-2 text-green-600" />
            Nearest Truckers
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {nearestDrivers.slice(0, 3).map((driver, index) => {
              const coords = indianCities[driver.location];
              const distance = coords ? calculateDistance(
                currentLocation.lat, currentLocation.lng, coords.lat, coords.lng
              ) : 0;
              
              return (
                <div key={driver.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{driver.name}</p>
                    <p className="text-xs text-gray-500">{distance.toFixed(1)} km • {driver.vehicleType}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{driver.rating.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[500px] rounded-lg bg-gray-100" 
        style={{ minHeight: '500px' }}
      />

      {/* Selected Driver Info Panel */}
      <AnimatePresence>
        {selectedDriver && (
          <motion.div 
            className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{selectedDriver.name}</h3>
                  <p className="text-gray-600">{selectedDriver.vehicleType}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${selectedDriver.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-sm">{selectedDriver.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{selectedDriver.rating.toFixed(1)}</span>
                    </div>
                    {currentLocation && indianCities[selectedDriver.location] && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">
                          {calculateDistance(
                            currentLocation.lat, 
                            currentLocation.lng, 
                            indianCities[selectedDriver.location].lat, 
                            indianCities[selectedDriver.location].lng
                          ).toFixed(1)} km
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            {selectedDriver.isAvailable && (
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => onDriverSelect && onDriverSelect(selectedDriver)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Contact Driver</span>
                </button>
                {currentLocation && indianCities[selectedDriver.location] && (
                  <button
                    onClick={() => {
                      const coords = indianCities[selectedDriver.location];
                      const url = `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${coords.lat},${coords.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Route className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IndiaMap;
