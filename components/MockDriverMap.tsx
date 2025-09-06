'use client';

import React, { useState } from 'react';
import { useDrivers, Driver } from '@/store/useDrivers';
import { MapPin, Truck, User, Star, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock coordinates for Indian cities with visual positioning
const cityCoordinates: { [key: string]: { x: number; y: number; lat: number; lng: number } } = {
  'Delhi, India': { x: 45, y: 25, lat: 28.6139, lng: 77.2090 },
  'Mumbai, India': { x: 25, y: 65, lat: 19.0760, lng: 72.8777 },
  'Bangalore, India': { x: 35, y: 75, lat: 12.9716, lng: 77.5946 },
  'Pune, India': { x: 30, y: 60, lat: 18.5204, lng: 73.8567 },
  'Chennai, India': { x: 50, y: 80, lat: 13.0827, lng: 80.2707 },
  'Hyderabad, India': { x: 45, y: 70, lat: 17.3850, lng: 78.4867 },
  'Kolkata, India': { x: 70, y: 40, lat: 22.5726, lng: 88.3639 },
  'Ahmedabad, India': { x: 20, y: 45, lat: 23.0225, lng: 72.5714 },
  'Jaipur, India': { x: 35, y: 35, lat: 26.9124, lng: 75.7873 },
  'Lucknow, India': { x: 55, y: 35, lat: 26.8467, lng: 80.9462 }
};

interface MockDriverMapProps {
  onDriverSelect?: (driver: Driver) => void;
  showFilters?: boolean;
  className?: string;
}

const MockDriverMap: React.FC<MockDriverMapProps> = ({ 
  onDriverSelect, 
  showFilters = true, 
  className = '' 
}) => {
  const { drivers, getAvailableDrivers, getOnlineDrivers } = useDrivers();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'available' | 'online'>('all');

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

  const handleDriverClick = (driver: Driver) => {
    setSelectedDriver(driver);
    if (onDriverSelect) {
      onDriverSelect(driver);
    }
  };

  const getMarkerColor = (driver: Driver) => {
    if (!driver.isOnline) return '#6B7280'; // Gray for offline
    return driver.isAvailable ? '#10B981' : '#EF4444'; // Green for available, red for busy
  };

  const getStatusText = (driver: Driver) => {
    if (!driver.isOnline) return 'Offline';
    return driver.isAvailable ? 'Available' : 'Busy';
  };

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
            <Filter className="w-4 h-4 mr-2 text-red-600" />
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
            <span>Busy ({drivers.filter(d => d.isOnline && !d.isAvailable).length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Offline ({drivers.filter(d => !d.isOnline).length})</span>
          </div>
        </div>
      </motion.div>

      {/* Mock Map Container */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative overflow-hidden">
        {/* India Map Outline (Simplified) */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M20 20 Q30 15 40 20 Q50 10 60 15 Q70 20 75 30 Q80 40 75 50 Q70 60 65 70 Q60 80 50 85 Q40 80 30 75 Q20 70 15 60 Q10 50 15 40 Q20 30 20 20 Z"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="0.5"
              className="drop-shadow-sm"
            />
          </svg>
        </div>

        {/* Driver Markers */}
        {filteredDrivers.map((driver, index) => {
          const coordinates = cityCoordinates[driver.location];
          if (!coordinates) return null;

          return (
            <motion.div
              key={driver.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${coordinates.x}%`,
                top: `${coordinates.y}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.2 }}
              onClick={() => handleDriverClick(driver)}
            >
              {/* Marker */}
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                style={{ backgroundColor: getMarkerColor(driver) }}
              >
                <Truck className="w-3 h-3 text-white" />
              </div>
              
              {/* Pulse Animation for Available Drivers */}
              {driver.isAvailable && driver.isOnline && (
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ backgroundColor: getMarkerColor(driver) }}
                />
              )}
              
              {/* Driver Name Label */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap text-gray-900">
                {driver.name}
              </div>
            </motion.div>
          );
        })}

        {/* City Labels */}
        {Object.entries(cityCoordinates).map(([city, coords]) => (
          <div
            key={city}
            className="absolute text-xs text-gray-900 font-medium transform -translate-x-1/2"
            style={{
              left: `${coords.x}%`,
              top: `${coords.y + 8}%`,
            }}
          >
            {city.split(',')[0]}
          </div>
        ))}
      </div>

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
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getMarkerColor(selectedDriver) }}
                      />
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
                  <div className="mt-2 text-sm text-gray-600">
                    <p>📍 {selectedDriver.location}</p>
                    <p>🚛 {selectedDriver.vehicleDetails?.make} {selectedDriver.vehicleDetails?.model}</p>
                    <p>📦 Capacity: {selectedDriver.vehicleDetails?.capacity}</p>
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
            
            {selectedDriver.isAvailable && (
              <button
                onClick={() => onDriverSelect && onDriverSelect(selectedDriver)}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Contact Driver
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Available Driver</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Busy Driver</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Offline Driver</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockDriverMap;
