'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Crown } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import DriverSearchResults from '@/components/DriverSearchResults';
import PremiumDriverShowcase from '@/components/PremiumDriverShowcase';

export default function FindDriversPage() {
  const [searchRoute, setSearchRoute] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user && user.type !== 'customer') {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  if (!user || user.type !== 'customer') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-gray-700">Loading...</div>
      </div>
    );
  }

  const handleDriverSelect = (driverId: string) => {
    // Navigate to job creation with pre-selected driver
    router.push(`/jobs/post?driverId=${driverId}`);
  };

  const handleSearch = () => {
    const route = `${pickupLocation} → ${deliveryLocation}`;
    setSearchRoute(route);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Drivers</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search for verified drivers on your route. Premium drivers get priority placement for better service.
          </p>
          
          {/* Map View Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <button
              onClick={() => router.push('/customer/driver-map')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <MapPin className="w-5 h-5" />
              <span>View Drivers on Map</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 text-gray-900"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Enter pickup location"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="Enter delivery location"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!pickupLocation || !deliveryLocation}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search Drivers</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Premium Driver Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <PremiumDriverShowcase 
            onDriverSelect={handleDriverSelect}
            maxDrivers={4}
          />
        </motion.div>

        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DriverSearchResults
            searchRoute={searchRoute}
            onDriverSelect={handleDriverSelect}
            maxResults={12}
            showUpgradeOptions={false}
          />
        </motion.div>
      </div>
    </div>
  );
}
