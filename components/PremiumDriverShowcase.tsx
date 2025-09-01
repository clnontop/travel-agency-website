'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Shield, Truck, MapPin } from 'lucide-react';
import { useDrivers } from '@/store/useDrivers';
import PremiumBadge, { PremiumPriorityTag } from './PremiumBadge';
import { formatINR } from '@/utils/currency';

interface PremiumDriverShowcaseProps {
  onDriverSelect?: (driverId: string) => void;
  maxDrivers?: number;
}

export default function PremiumDriverShowcase({ 
  onDriverSelect, 
  maxDrivers = 4 
}: PremiumDriverShowcaseProps) {
  const { getPremiumDrivers } = useDrivers();
  const premiumDrivers = getPremiumDrivers().slice(0, maxDrivers);

  if (premiumDrivers.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <Crown className="w-8 h-8 text-yellow-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Premium Verified Drivers</h3>
          <p className="text-gray-600">Top-rated drivers with priority placement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {premiumDrivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-yellow-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onDriverSelect?.(driver.id)}
          >
            {/* Premium Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 pointer-events-none" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {driver.name.charAt(0)}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                      <PremiumBadge size="sm" variant="badge" showText={false} />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{driver.rating}</span>
                      <span>•</span>
                      <span>{driver.completedJobs} jobs</span>
                    </div>
                  </div>
                </div>
                
                <PremiumPriorityTag />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{driver.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Truck className="w-4 h-4" />
                  <span>{driver.vehicleType}</span>
                  {driver.vehicleDetails && (
                    <span className="text-gray-500">• {driver.vehicleDetails.capacity}</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Earnings:</span>
                  <span className="font-semibold text-green-600">{formatINR(driver.totalEarnings)}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Verified Premium</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    driver.isOnline && driver.isAvailable 
                      ? 'bg-green-500' 
                      : driver.isOnline 
                      ? 'bg-yellow-500' 
                      : 'bg-gray-400'
                  }`} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {premiumDrivers.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Premium drivers get <span className="font-semibold text-yellow-700">priority placement</span> in search results
          </p>
        </div>
      )}
    </div>
  );
}
