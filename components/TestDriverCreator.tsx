'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Truck, User, MapPin } from 'lucide-react';
import { useDrivers } from '@/store/useDrivers';
import toast from 'react-hot-toast';

export default function TestDriverCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const { addDriver, drivers } = useDrivers();

  const sampleDrivers = [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 98765 43210',
      bio: 'Experienced truck driver with 10+ years in logistics',
      location: 'Delhi, India',
      vehicleType: 'Heavy Truck',
      licenseNumber: 'DL-0420198765'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 87654 32109',
      bio: 'Reliable driver specializing in city deliveries',
      location: 'Mumbai, India',
      vehicleType: 'Medium Truck',
      licenseNumber: 'MH-0312087654'
    },
    {
      name: 'Amit Singh',
      email: 'amit.singh@example.com',
      phone: '+91 76543 21098',
      bio: 'Long-haul specialist with interstate experience',
      location: 'Bangalore, India',
      vehicleType: 'Heavy Truck',
      licenseNumber: 'KA-0598765432'
    }
  ];

  const createTestDrivers = async () => {
    setIsCreating(true);
    
    try {
      for (const driver of sampleDrivers) {
        addDriver({
          ...driver,
          rating: 0,
          completedJobs: 0,
          totalEarnings: 0,
          memberSince: new Date().getFullYear().toString(),
          isAvailable: true,
          isOnline: true,
          lastSeen: new Date(),
          isPremium: false
        });
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      }
      
      toast.success(`Created ${sampleDrivers.length} test drivers!`);
    } catch (error) {
      toast.error('Failed to create test drivers');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Test Drivers</h3>
            <p className="text-sm text-gray-400">
              Current drivers: {drivers.length}
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={createTestDrivers}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Creating...' : 'Add Test Drivers'}
        </motion.button>
      </div>

      {drivers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Available Drivers:</h4>
          <div className="grid gap-2">
            {drivers.slice(0, 3).map((driver, index) => (
              <div key={driver.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="p-1.5 bg-green-500/20 rounded-full">
                  <User className="w-3 h-3 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{driver.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {driver.location}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {driver.vehicleType}
                </div>
              </div>
            ))}
            {drivers.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{drivers.length - 3} more drivers
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
