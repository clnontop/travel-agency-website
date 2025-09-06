'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  ArrowLeft, 
  Filter, 
  Users, 
  Truck, 
  Star, 
  Phone, 
  MessageCircle,
  Navigation,
  Clock,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DriverMap from '@/components/DriverMap';
import MockDriverMap from '@/components/MockDriverMap';
import { Driver } from '@/store/useDrivers';
import Link from 'next/link';

export default function DriverMapPage() {
  const router = useRouter();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowContactModal(true);
  };

  const handleContactDriver = () => {
    // Here you would implement the actual contact functionality
    // For now, we'll just show a success message
    alert(`Contacting ${selectedDriver?.name}...`);
    setShowContactModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <motion.div 
        className="bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-red-500" />
                <h1 className="text-xl font-bold text-white">Driver Locations</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/customer/find-drivers"
                className="btn-secondary text-sm py-2 px-4"
              >
                <Users className="w-4 h-4 mr-2" />
                Browse Drivers
              </Link>
              <Link
                href="/customer/jobs"
                className="btn-primary text-sm py-2 px-4"
              >
                <Truck className="w-4 h-4 mr-2" />
                Post Job
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Find Drivers Near You
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            View all registered drivers on the map with real-time availability status. 
            Green markers indicate available drivers, red markers show busy drivers, and gray markers are offline.
          </p>
        </motion.div>

        {/* Map Container */}
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-900"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="h-[600px] lg:h-[700px]">
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY' ? (
              <DriverMap 
                onDriverSelect={handleDriverSelect}
                showFilters={true}
                className="w-full h-full"
              />
            ) : (
              <MockDriverMap 
                onDriverSelect={handleDriverSelect}
                showFilters={true}
                className="w-full h-full"
              />
            )}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div 
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {[
            {
              icon: <MapPin className="w-8 h-8 text-green-500" />,
              title: "Click on Markers",
              description: "Click on any driver marker to view their profile and contact information."
            },
            {
              icon: <Filter className="w-8 h-8 text-blue-500" />,
              title: "Filter Drivers",
              description: "Use the filter panel to show only available, online, or all drivers."
            },
            {
              icon: <MessageCircle className="w-8 h-8 text-purple-500" />,
              title: "Contact Directly",
              description: "Contact available drivers directly through the platform for your delivery needs."
            }
          ].map((instruction, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-center space-x-4 mb-4">
                {instruction.icon}
                <h3 className="text-lg font-semibold text-white">{instruction.title}</h3>
              </div>
              <p className="text-gray-300">{instruction.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Contact Driver Modal */}
      {showContactModal && selectedDriver && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowContactModal(false)}
        >
          <motion.div 
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto text-gray-900"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Driver Info */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedDriver.name}</h3>
              <p className="text-gray-600">{selectedDriver.vehicleType}</p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center space-x-2 mt-3 px-3 py-1 rounded-full text-sm font-medium">
                <div className={`w-2 h-2 rounded-full ${
                  selectedDriver.isAvailable ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={selectedDriver.isAvailable ? 'text-green-700' : 'text-red-700'}>
                  {selectedDriver.isAvailable ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>

            {/* Driver Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{selectedDriver.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Completed Jobs</span>
                <span className="font-medium">{selectedDriver.completedJobs}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Location</span>
                <span className="font-medium">{selectedDriver.location}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-medium">
                  {selectedDriver.vehicleDetails?.make} {selectedDriver.vehicleDetails?.model}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Capacity</span>
                <span className="font-medium">{selectedDriver.vehicleDetails?.capacity}</span>
              </div>

              {selectedDriver.isPremium && (
                <div className="flex items-center justify-center py-2 px-4 bg-yellow-50 rounded-lg">
                  <Shield className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">Premium Driver</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {selectedDriver.isAvailable ? (
                <>
                  <button
                    onClick={handleContactDriver}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contact Driver</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Navigate to job posting with pre-selected driver
                      router.push(`/customer/jobs?driver=${selectedDriver.id}`);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Hire for Job</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Driver is currently busy</p>
                  <p className="text-sm text-gray-500">Try contacting them later</p>
                </div>
              )}
              
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
