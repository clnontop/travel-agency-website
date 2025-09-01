'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  MapPin, 
  Truck, 
  Clock, 
  Phone, 
  Mail, 
  User,
  Award,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Driver } from '@/store/useDrivers';
import PremiumBadge, { PremiumStatusIndicator, PremiumPriorityTag } from './PremiumBadge';
import PremiumSubscriptionModal from './PremiumSubscriptionModal';
import { formatINR } from '@/utils/currency';

interface DriverCardProps {
  driver: Driver;
  onSelect?: (driverId: string) => void;
  onContact?: (driverId: string) => void;
  showUpgradeOption?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function DriverCard({ 
  driver, 
  onSelect, 
  onContact,
  showUpgradeOption = false,
  variant = 'default'
}: DriverCardProps) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const getStatusColor = (isOnline: boolean, isAvailable: boolean) => {
    if (isOnline && isAvailable) return 'bg-green-500';
    if (isOnline && !isAvailable) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getStatusText = (isOnline: boolean, isAvailable: boolean) => {
    if (isOnline && isAvailable) return 'Available';
    if (isOnline && !isAvailable) return 'Busy';
    return 'Offline';
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
          driver.isPremium 
            ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg' 
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={() => onSelect?.(driver.id)}
      >
        {driver.isPremium && <PremiumStatusIndicator isPremium={true} />}
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {driver.name.charAt(0)}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(driver.isOnline, driver.isAvailable)} rounded-full border-2 border-white`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{driver.name}</h3>
              {driver.isPremium && <PremiumBadge size="sm" variant="badge" showText={false} />}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>{driver.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="w-4 h-4" />
                <span>{driver.vehicleType}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative p-6 rounded-xl border-2 transition-all ${
          driver.isPremium 
            ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 shadow-xl' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }`}
      >
        {driver.isPremium && (
          <>
            <PremiumStatusIndicator isPremium={true} />
            <div className="absolute top-4 left-4">
              <PremiumPriorityTag />
            </div>
          </>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4 mt-2">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {driver.name.charAt(0)}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(driver.isOnline, driver.isAvailable)} rounded-full border-2 border-white`} />
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900">{driver.name}</h3>
                {driver.isPremium && <PremiumBadge size="md" variant="tag" />}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  driver.isOnline && driver.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : driver.isOnline 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusText(driver.isOnline, driver.isAvailable)}
                </span>
                <MapPin className="w-4 h-4" />
                <span>{driver.location}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-lg font-bold text-gray-900">{driver.rating}</span>
            </div>
            <div className="text-sm text-gray-600">{driver.completedJobs} jobs</div>
          </div>
        </div>

        {/* Bio */}
        {driver.bio && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">{driver.bio}</p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Truck className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{driver.vehicleType}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">Since {driver.memberSince}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{formatINR(driver.totalEarnings)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              {new Date(driver.lastSeen).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Vehicle Details */}
        {driver.vehicleDetails && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Vehicle Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Make/Model:</span>
                <span className="ml-2 font-medium">{driver.vehicleDetails.make} {driver.vehicleDetails.model}</span>
              </div>
              <div>
                <span className="text-gray-600">Capacity:</span>
                <span className="ml-2 font-medium">{driver.vehicleDetails.capacity}</span>
              </div>
              <div>
                <span className="text-gray-600">Year:</span>
                <span className="ml-2 font-medium">{driver.vehicleDetails.year}</span>
              </div>
              <div>
                <span className="text-gray-600">Plate:</span>
                <span className="ml-2 font-medium">{driver.vehicleDetails.plateNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onSelect && (
            <button
              onClick={() => onSelect(driver.id)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                driver.isPremium
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Select Driver
            </button>
          )}
          
          {onContact && (
            <button
              onClick={() => onContact(driver.id)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact
            </button>
          )}

          {showUpgradeOption && !driver.isPremium && (
            <button
              onClick={() => setShowPremiumModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-medium"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </motion.div>

      {/* Premium Subscription Modal */}
      <PremiumSubscriptionModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        driverId={driver.id}
        driverName={driver.name}
      />
    </>
  );
}
