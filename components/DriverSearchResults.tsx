'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Star, Truck, Crown } from 'lucide-react';
import { useDrivers, Driver } from '@/store/useDrivers';
import DriverCard from './DriverCard';
import PremiumBadge, { PremiumPriorityTag } from './PremiumBadge';

interface DriverSearchResultsProps {
  searchRoute?: string;
  onDriverSelect?: (driverId: string) => void;
  maxResults?: number;
  showUpgradeOptions?: boolean;
}

export default function DriverSearchResults({
  searchRoute = '',
  onDriverSelect,
  maxResults = 10,
  showUpgradeOptions = false
}: DriverSearchResultsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'premium' | 'available'>('all');
  
  const { getDriversByRoute, getAvailableDrivers, getPremiumDrivers } = useDrivers();

  // Get drivers with premium priority sorting
  const getFilteredDrivers = (): Driver[] => {
    let drivers: Driver[] = [];

    switch (filterType) {
      case 'premium':
        drivers = getPremiumDrivers();
        break;
      case 'available':
        drivers = getAvailableDrivers();
        break;
      default:
        drivers = getDriversByRoute(searchRoute);
        break;
    }

    // Apply search term filter
    if (searchTerm) {
      drivers = drivers.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort with premium drivers first, then by rating
    drivers.sort((a, b) => {
      // Premium drivers always come first
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      
      // Among same tier, sort by rating then by availability
      if (a.rating !== b.rating) return b.rating - a.rating;
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      
      return 0;
    });

    return drivers.slice(0, maxResults);
  };

  const filteredDrivers = getFilteredDrivers();
  const premiumCount = filteredDrivers.filter(d => d.isPremium).length;
  const regularCount = filteredDrivers.length - premiumCount;

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search drivers by name, location, or vehicle type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'premium', 'available'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter as any)}
                className={`px-4 py-3 rounded-lg font-medium capitalize transition-colors ${
                  filterType === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'premium' && <Crown className="w-4 h-4 mr-1 inline" />}
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Found {filteredDrivers.length} drivers</span>
            {premiumCount > 0 && (
              <div className="flex items-center space-x-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-yellow-700">{premiumCount} Premium</span>
              </div>
            )}
            {regularCount > 0 && (
              <span>{regularCount} Regular</span>
            )}
          </div>
          
          {searchRoute && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Route: {searchRoute}</span>
            </div>
          )}
        </div>
      </div>

      {/* Premium Priority Notice */}
      {premiumCount > 0 && filterType === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Premium drivers are shown first for better service quality
            </span>
          </div>
        </motion.div>
      )}

      {/* Driver Results */}
      <div className="space-y-4">
        {filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Drivers Found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No drivers match "${searchTerm}"`
                : 'No drivers available for this route'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Premium Drivers Section */}
            {premiumCount > 0 && filterType === 'all' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Premium Drivers</h3>
                  <span className="text-sm text-gray-500">({premiumCount})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {filteredDrivers
                    .filter(driver => driver.isPremium)
                    .map((driver, index) => (
                      <DriverCard
                        key={driver.id}
                        driver={driver}
                        onSelect={onDriverSelect}
                        showUpgradeOption={showUpgradeOptions}
                        variant="detailed"
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Regular Drivers Section */}
            {regularCount > 0 && filterType === 'all' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Other Drivers</h3>
                  <span className="text-sm text-gray-500">({regularCount})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDrivers
                    .filter(driver => !driver.isPremium)
                    .map((driver, index) => (
                      <DriverCard
                        key={driver.id}
                        driver={driver}
                        onSelect={onDriverSelect}
                        showUpgradeOption={showUpgradeOptions}
                        variant="detailed"
                      />
                    ))}
                </div>
              </div>
            )}

            {/* All Drivers (when not filtering by all) */}
            {filterType !== 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDrivers.map((driver, index) => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    onSelect={onDriverSelect}
                    showUpgradeOption={showUpgradeOptions}
                    variant="detailed"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
