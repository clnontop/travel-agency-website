'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Star, 
  Phone, 
  Truck, 
  CreditCard, 
  Search,
  MapPin,
  CheckCircle,
  Clock,
  DollarSign,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import PaymentModal from './PaymentModal';
import toast from 'react-hot-toast';
import { useDrivers } from '../store/useDrivers';
import PremiumBadge, { PremiumStatusIndicator } from './PremiumBadge';

export default function DriverPaymentSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();
  const { drivers } = useDrivers();

  if (!user || user.type !== 'customer') {
    return null;
  }

  const filteredDrivers = drivers
    .filter(driver =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Premium drivers first
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      // Then by rating
      return b.rating - a.rating;
    });

  const handlePayDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    setShowPaymentModal(true);
  };

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Pay Drivers</h3>
            <p className="text-blue-100 text-sm">Send payments directly to drivers</p>
          </div>
          <CreditCard className="w-8 h-8 text-blue-200" />
        </div>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search drivers by name, location, or vehicle type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Drivers List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredDrivers.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Drivers Found</h4>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No drivers available at the moment'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDrivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 transition-colors relative ${
                  driver.isPremium 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-l-4 border-yellow-400' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Driver Info */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {driver.name.charAt(0)}
                      </div>
                      {driver.isAvailable && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                      {driver.isPremium && (
                        <PremiumStatusIndicator isPremium={true} className="-top-1 -right-1" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {driver.name}
                          </h4>
                          {driver.isPremium && (
                            <PremiumBadge size="sm" variant="badge" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {driver.isAvailable ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Busy
                            </span>
                          )}
                          {driver.isOnline ? (
                            <div className="flex items-center space-x-1">
                              <Wifi className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600">Online</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <WifiOff className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">Offline</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{driver.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{driver.completedJobs} jobs</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Truck className="w-4 h-4 text-blue-500" />
                          <span>{driver.vehicleType}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{driver.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{driver.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <div className="ml-6">
                    <button
                      onClick={() => handlePayDriver(driver.id)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all space-x-2 shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Now</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedDriver && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedDriverId(null);
          }}
          driverId={selectedDriver.id}
          driverName={selectedDriver.name}
          description={`Payment to ${selectedDriver.name} for services`}
        />
      )}
    </div>
  );
}
