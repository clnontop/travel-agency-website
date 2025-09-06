'use client';

import React, { useState, useEffect } from 'react';
import { useDrivers, Driver } from '@/store/useDrivers';
import { MapPin, Navigation, Truck, User, Star, Phone, Route, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Indian cities with realistic coordinates matching India's shape
const indianCities: { [key: string]: { lat: number; lng: number; x: number; y: number } } = {
  'Delhi, India': { lat: 28.6139, lng: 77.2090, x: 52, y: 28 },
  'Mumbai, India': { lat: 19.0760, lng: 72.8777, x: 32, y: 52 },
  'Bangalore, India': { lat: 12.9716, lng: 77.5946, x: 48, y: 72 },
  'Pune, India': { lat: 18.5204, lng: 73.8567, x: 38, y: 58 },
  'Chennai, India': { lat: 13.0827, lng: 80.2707, x: 58, y: 76 },
  'Hyderabad, India': { lat: 17.3850, lng: 78.4867, x: 52, y: 62 },
  'Kolkata, India': { lat: 22.5726, lng: 88.3639, x: 75, y: 42 },
  'Ahmedabad, India': { lat: 23.0225, lng: 72.5714, x: 28, y: 38 },
  'Jaipur, India': { lat: 26.9124, lng: 75.7873, x: 42, y: 32 },
  'Lucknow, India': { lat: 26.8467, lng: 80.9462, x: 58, y: 35 },
  'Bhopal, India': { lat: 23.2599, lng: 77.4126, x: 48, y: 48 },
  'Visakhapatnam, India': { lat: 17.6868, lng: 83.2185, x: 68, y: 58 },
  'Kochi, India': { lat: 9.9312, lng: 76.2673, x: 42, y: 82 },
  'Guwahati, India': { lat: 26.1445, lng: 91.7362, x: 82, y: 32 },
  'Chandigarh, India': { lat: 30.7333, lng: 76.7794, x: 48, y: 22 }
};

interface FallbackIndiaMapProps {
  onDriverSelect?: (driver: Driver) => void;
  showNearestOnly?: boolean;
  userLocation?: { lat: number; lng: number };
  className?: string;
}

const FallbackIndiaMap: React.FC<FallbackIndiaMapProps> = ({ 
  onDriverSelect, 
  showNearestOnly = false,
  userLocation,
  className = '' 
}) => {
  const { drivers, getAvailableDrivers } = useDrivers();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [nearestDrivers, setNearestDrivers] = useState<Driver[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(userLocation || null);
  const [isLocating, setIsLocating] = useState(false);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
  const getCurrentLocation = () => {
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
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          // Fallback to Delhi
          setCurrentLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  };

  // Find nearest drivers
  useEffect(() => {
    if (!currentLocation) return;
    
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
    
    const nearest = driversWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 5);
    setNearestDrivers(nearest);
  }, [currentLocation, getAvailableDrivers]);

  const driversToShow = showNearestOnly ? nearestDrivers : getAvailableDrivers();

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
            <Zap className="w-4 h-4 mr-2 text-green-600" />
            Nearest Truckers
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {nearestDrivers.slice(0, 3).map((driver, index) => {
              const coords = indianCities[driver.location];
              const distance = coords ? calculateDistance(
                currentLocation.lat, currentLocation.lng, coords.lat, coords.lng
              ) : 0;
              
              return (
                <div key={driver.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => setSelectedDriver(driver)}>
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

      {/* Realistic India Map SVG */}
      <div className="w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-orange-50 rounded-xl overflow-hidden relative shadow-2xl border border-orange-200">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Realistic India Map Outline */}
          <defs>
            <linearGradient id="indiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="mapShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#d97706" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Realistic India Map Shape */}
          <path
            d="M35,8 C40,6 45,7 50,8 C55,6 60,7 65,9 C70,12 75,16 78,22 C80,28 82,35 83,42 C84,48 83,54 81,60 C78,66 74,71 69,75 C64,79 58,82 52,84 C48,85 44,85 40,84 C35,82 30,79 26,75 C22,70 19,64 17,58 C15,52 14,45 15,38 C16,31 18,24 22,18 C26,12 30,8 35,8 Z"
            fill="url(#indiaGradient)"
            stroke="#d97706"
            strokeWidth="0.8"
            filter="url(#mapShadow)"
            className="drop-shadow-lg"
          />
          
          {/* Kashmir region */}
          <path
            d="M35,8 C38,5 42,4 45,6 C47,8 46,12 44,14 C41,16 37,15 35,12 C34,10 34,9 35,8 Z"
            fill="url(#indiaGradient)"
            stroke="#d97706"
            strokeWidth="0.5"
          />
          
          {/* Northeast states */}
          <path
            d="M78,22 C80,20 82,21 84,23 C85,25 84,27 82,28 C80,29 78,28 77,26 C76,24 77,23 78,22 Z"
            fill="url(#indiaGradient)"
            stroke="#d97706"
            strokeWidth="0.5"
          />
          
          {/* Southern tip */}
          <path
            d="M48,84 C50,86 52,87 52,89 C52,91 50,92 48,91 C46,90 45,88 46,86 C47,85 47,84 48,84 Z"
            fill="url(#indiaGradient)"
            stroke="#d97706"
            strokeWidth="0.5"
          />
          
          {/* Realistic State Boundaries */}
          <g stroke="#f97316" strokeWidth="0.3" fill="none" opacity="0.5">
            {/* Rajasthan */}
            <path d="M22,18 C28,16 34,18 38,22 C40,26 38,30 35,32 C30,34 25,32 22,28 C20,24 20,20 22,18 Z" />
            {/* Maharashtra */}
            <path d="M26,35 C32,33 38,35 42,39 C44,43 42,47 39,49 C33,51 28,49 26,45 C24,41 24,37 26,35 Z" />
            {/* Karnataka */}
            <path d="M35,55 C41,53 47,55 51,59 C53,63 51,67 48,69 C42,71 37,69 35,65 C33,61 33,57 35,55 Z" />
            {/* Tamil Nadu */}
            <path d="M45,70 C51,68 57,70 61,74 C63,78 61,82 58,84 C52,86 47,84 45,80 C43,76 43,72 45,70 Z" />
            {/* Andhra Pradesh */}
            <path d="M55,45 C61,43 67,45 71,49 C73,53 71,57 68,59 C62,61 57,59 55,55 C53,51 53,47 55,45 Z" />
            {/* West Bengal */}
            <path d="M70,25 C76,23 82,25 86,29 C88,33 86,37 83,39 C77,41 72,39 70,35 C68,31 68,27 70,25 Z" />
            {/* Uttar Pradesh */}
            <path d="M45,25 C51,23 57,25 61,29 C63,33 61,37 58,39 C52,41 47,39 45,35 C43,31 43,27 45,25 Z" />
          </g>
          
          {/* Decorative Elements */}
          <g opacity="0.4">
            <circle cx="25" cy="25" r="0.5" fill="#f97316" />
            <circle cx="75" cy="30" r="0.5" fill="#f97316" />
            <circle cx="60" cy="70" r="0.5" fill="#f97316" />
            <circle cx="40" cy="75" r="0.5" fill="#f97316" />
          </g>

          {/* Driver Markers */}
          {driversToShow.map((driver) => {
            const cityData = indianCities[driver.location];
            if (!cityData) return null;

            const isNearest = nearestDrivers.some(nd => nd.id === driver.id);
            const isSelected = selectedDriver?.id === driver.id;

            return (
              <g key={driver.id}>
                {/* Marker */}
                <g className="cursor-pointer hover:scale-110 transition-all duration-200"
                   onClick={() => {
                     setSelectedDriver(driver);
                     if (onDriverSelect) {
                       onDriverSelect(driver);
                     }
                   }}>
                  <circle
                    cx={cityData.x}
                    cy={cityData.y}
                    r={isSelected ? "3" : isNearest ? "2.5" : "2"}
                    fill={isNearest ? "#10b981" : driver.isAvailable ? "#f59e0b" : "#ef4444"}
                    stroke="#ffffff"
                    strokeWidth="1"
                    className="drop-shadow-md"
                  />
                  <circle
                    cx={cityData.x}
                    cy={cityData.y}
                    r={isSelected ? "1.5" : isNearest ? "1.2" : "1"}
                    fill="#ffffff"
                    opacity="0.8"
                  />
                </g>
                
                {/* Pulse animation for nearest drivers */}
                {isNearest && (
                  <circle
                    cx={cityData.x}
                    cy={cityData.y}
                    r="2"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.3"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="r"
                      values="2;4;2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Clean City Label - only show on hover */}
                {isSelected && (
                  <text
                    x={cityData.x}
                    y={cityData.y - 4}
                    textAnchor="middle"
                    className="text-xs fill-gray-800 font-semibold pointer-events-none"
                    fontSize="2.5"
                    style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
                  >
                    {driver.location.split(',')[0]}
                  </text>
                )}
              </g>
            );
          })}

          {/* User Location Marker */}
          {currentLocation && (
            <circle
              cx="50"
              cy="50"
              r="1.5"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="0.5"
            >
              <animate
                attributeName="r"
                values="1.5;3;1.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>

        {/* Enhanced Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 text-xs border border-orange-200">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            Driver Status
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-gray-700">Nearest Available</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-gray-700">Available</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-gray-700">Busy</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm animate-pulse"></div>
              <span className="font-medium text-gray-700">Your Location</span>
            </div>
          </div>
        </div>
      </div>

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
                  onClick={() => {
                    if (onDriverSelect) {
                      onDriverSelect(selectedDriver);
                    }
                  }}
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

export default FallbackIndiaMap;
