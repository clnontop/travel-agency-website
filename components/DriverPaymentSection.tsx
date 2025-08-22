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
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import PaymentModal from './PaymentModal';
import toast from 'react-hot-toast';

interface Driver {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  vehicleType: string;
  phone: string;
  location: string;
  avatar?: string;
  isAvailable: boolean;
}

// Mock driver data - in a real app, this would come from an API
const mockDrivers: Driver[] = [
  {
    id: 'rahul-sharma',
    name: 'Rahul Sharma',
    rating: 4.9,
    completedJobs: 245,
    vehicleType: 'Truck',
    phone: '+91 99999 88888',
    location: 'Mumbai, Maharashtra',
    isAvailable: true
  },
  {
    id: 'driver1',
    name: 'Rajesh Kumar',
    rating: 4.8,
    completedJobs: 156,
    vehicleType: 'Truck',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    isAvailable: true
  },
  {
    id: 'driver2',
    name: 'Amit Singh',
    rating: 4.6,
    completedJobs: 89,
    vehicleType: 'Van',
    phone: '+91 87654 32109',
    location: 'Delhi, NCR',
    isAvailable: true
  },
  {
    id: 'driver3',
    name: 'Suresh Patel',
    rating: 4.9,
    completedJobs: 234,
    vehicleType: 'Pickup',
    phone: '+91 76543 21098',
    location: 'Pune, Maharashtra',
    isAvailable: false
  },
  {
    id: 'driver4',
    name: 'Vikram Sharma',
    rating: 4.7,
    completedJobs: 178,
    vehicleType: 'Truck',
    phone: '+91 65432 10987',
    location: 'Bangalore, Karnataka',
    isAvailable: true
  },
  {
    id: 'driver5',
    name: 'Ravi Gupta',
    rating: 4.5,
    completedJobs: 92,
    vehicleType: 'Van',
    phone: '+91 54321 09876',
    location: 'Chennai, Tamil Nadu',
    isAvailable: true
  }
];

export default function DriverPaymentSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();

  if (!user || user.type !== 'customer') {
    return null;
  }

  const filteredDrivers = mockDrivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayDriver = (driverId: string) => {
    setSelectedDriverId(driverId);
    setShowPaymentModal(true);
  };

  const selectedDriver = mockDrivers.find(d => d.id === selectedDriverId);

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
                className="p-6 hover:bg-gray-50 transition-colors"
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
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {driver.name}
                        </h4>
                        {driver.isAvailable ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Busy
                          </span>
                        )}
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
