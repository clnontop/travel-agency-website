'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import IndiaMap from '@/components/IndiaMap';
import { Driver } from '@/store/useDrivers';
import { MapPin, Truck, Navigation, Phone, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MapPage() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showNearestOnly, setShowNearestOnly] = useState(false);

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
  };

  const handleContactDriver = () => {
    if (selectedDriver) {
      // Simulate contacting driver
      alert(`Contacting ${selectedDriver.name} at ${selectedDriver.phone}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="Trinck Logo" 
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">India Trucker Map</h1>
                <p className="text-gray-600">Find the nearest available truckers in real-time</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNearestOnly(!showNearestOnly)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  showNearestOnly
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showNearestOnly ? 'Show All Drivers' : 'Show Nearest Only'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)]">
          
          {/* Map Section */}
          <div className="lg:col-span-3">
            <motion.div 
              className="bg-white rounded-xl shadow-lg overflow-hidden h-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <IndiaMap
                onDriverSelect={handleDriverSelect}
                showNearestOnly={showNearestOnly}
                className="h-full"
              />
            </motion.div>
          </div>

          {/* Driver Details Panel */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6 h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {selectedDriver ? (
                <div className="space-y-6">
                  {/* Driver Header */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Truck className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedDriver.name}</h2>
                    <p className="text-gray-600">{selectedDriver.vehicleType}</p>
                    
                    {/* Status Badges */}
                    <div className="flex justify-center space-x-2 mt-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedDriver.isOnline 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${
                          selectedDriver.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        {selectedDriver.isOnline ? 'Online' : 'Offline'}
                      </span>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedDriver.isAvailable 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedDriver.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>

                  {/* Driver Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedDriver.rating.toFixed(1)}</p>
                      <p className="text-xs text-gray-600">Rating</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Truck className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedDriver.completedJobs}</p>
                      <p className="text-xs text-gray-600">Jobs</p>
                    </div>
                  </div>

                  {/* Driver Details */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-red-500" />
                        {selectedDriver.location}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Vehicle Details</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>🚛 {selectedDriver.vehicleDetails?.make} {selectedDriver.vehicleDetails?.model}</p>
                        <p>📦 Capacity: {selectedDriver.vehicleDetails?.capacity}</p>
                        <p>🔢 {selectedDriver.vehicleDetails?.plateNumber}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Contact</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-green-500" />
                        {selectedDriver.phone}
                      </p>
                    </div>

                    {selectedDriver.bio && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">About</p>
                        <p className="text-sm text-gray-600">{selectedDriver.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {selectedDriver.isAvailable && (
                    <div className="space-y-3">
                      <button
                        onClick={handleContactDriver}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Contact Driver</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          // Simulate booking
                          alert(`Booking request sent to ${selectedDriver.name}`);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Book Now</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Navigation className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Driver</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Click on any trucker marker on the map to view their details and contact information.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Use "Find My Location" to see the nearest truckers to you!
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Features Info */}
        <motion.div 
          className="mt-6 bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Navigation className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Real-time Location</h4>
                <p className="text-sm text-gray-600">Get your current location and find the nearest available truckers instantly.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Distance Calculation</h4>
                <p className="text-sm text-gray-600">See exact distances to each trucker and get directions via Google Maps.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Driver Details</h4>
                <p className="text-sm text-gray-600">View comprehensive driver profiles, ratings, and vehicle specifications.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
