'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth, Truck as TruckType } from '@/store/useAuth';
import { toast } from 'react-hot-toast';
import PremiumFeatureGuard from './PremiumFeatureGuard';

export default function TruckManagement() {
  const { user, addTruck, removeTruck, updateTruck } = useAuth();
  const [isAddingTruck, setIsAddingTruck] = useState(false);
  const [editingTruck, setEditingTruck] = useState<string | null>(null);
  const [newTruck, setNewTruck] = useState({
    name: '',
    vehicleType: '',
    licenseNumber: '',
    capacity: '',
    isActive: true
  });

  const handleAddTruck = async () => {
    if (!newTruck.name || !newTruck.vehicleType || !newTruck.licenseNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await addTruck(newTruck);
    if (result.success) {
      toast.success(result.message);
      setNewTruck({
        name: '',
        vehicleType: '',
        licenseNumber: '',
        capacity: '',
        isActive: true
      });
      setIsAddingTruck(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleUpdateTruck = async (truckId: string, updates: Partial<TruckType>) => {
    const result = await updateTruck(truckId, updates);
    if (result.success) {
      toast.success(result.message);
      setEditingTruck(null);
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveTruck = async (truckId: string) => {
    if (confirm('Are you sure you want to remove this truck?')) {
      const result = await removeTruck(truckId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  if (!user || user.type !== 'driver') {
    return null;
  }

  const trucks = user.trucks || [];
  const canAddMore = user.isPremium && trucks.length < 3;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-red-500" />
          <h3 className="text-xl font-semibold text-white">My Trucks</h3>
          {user.isPremium && (
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              Premium: {trucks.length}/3
            </span>
          )}
        </div>
        
        {canAddMore && (
          <button
            onClick={() => setIsAddingTruck(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Truck
          </button>
        )}
      </div>

      {!user.isPremium && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Premium Feature</span>
          </div>
          <p className="text-gray-300 text-sm">
            Upgrade to Premium to add up to 3 trucks to your account and manage multiple vehicles.
          </p>
        </div>
      )}

      {/* Add New Truck Form */}
      {isAddingTruck && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600"
        >
          <h4 className="text-lg font-medium text-white mb-4">Add New Truck</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Truck Name"
              value={newTruck.name}
              onChange={(e) => setNewTruck({ ...newTruck, name: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            <select
              value={newTruck.vehicleType}
              onChange={(e) => setNewTruck({ ...newTruck, vehicleType: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Select Vehicle Type</option>
              <option value="Mini Truck">Mini Truck</option>
              <option value="Small Truck">Small Truck</option>
              <option value="Medium Truck">Medium Truck</option>
              <option value="Large Truck">Large Truck</option>
              <option value="Container Truck">Container Truck</option>
            </select>
            <input
              type="text"
              placeholder="License Number"
              value={newTruck.licenseNumber}
              onChange={(e) => setNewTruck({ ...newTruck, licenseNumber: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            <input
              type="text"
              placeholder="Capacity (e.g., 5 tons)"
              value={newTruck.capacity}
              onChange={(e) => setNewTruck({ ...newTruck, capacity: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              onClick={() => setIsAddingTruck(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTruck}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              Add Truck
            </button>
          </div>
        </motion.div>
      )}

      {/* Trucks List */}
      <div className="space-y-4">
        {trucks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No trucks added yet</p>
            {user.isPremium && (
              <p className="text-sm mt-1">Click "Add Truck" to get started</p>
            )}
          </div>
        ) : (
          trucks.map((truck) => (
            <motion.div
              key={truck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-700/30 rounded-lg border border-gray-600"
            >
              {editingTruck === truck.id ? (
                <TruckEditForm
                  truck={truck}
                  onSave={(updates) => handleUpdateTruck(truck.id, updates)}
                  onCancel={() => setEditingTruck(null)}
                />
              ) : (
                <TruckDisplay
                  truck={truck}
                  onEdit={() => setEditingTruck(truck.id)}
                  onRemove={() => handleRemoveTruck(truck.id)}
                />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function TruckDisplay({ 
  truck, 
  onEdit, 
  onRemove 
}: { 
  truck: TruckType; 
  onEdit: () => void; 
  onRemove: () => void; 
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <Truck className="h-6 w-6 text-red-400" />
        </div>
        <div>
          <h4 className="text-white font-medium">{truck.name}</h4>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{truck.vehicleType}</span>
            <span>•</span>
            <span>{truck.licenseNumber}</span>
            {truck.capacity && (
              <>
                <span>•</span>
                <span>{truck.capacity}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {truck.isActive ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-400" />
          )}
          <span className={`text-xs ${truck.isActive ? 'text-green-400' : 'text-yellow-400'}`}>
            {truck.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function TruckEditForm({ 
  truck, 
  onSave, 
  onCancel 
}: { 
  truck: TruckType; 
  onSave: (updates: Partial<TruckType>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: truck.name,
    vehicleType: truck.vehicleType,
    licenseNumber: truck.licenseNumber,
    capacity: truck.capacity,
    isActive: truck.isActive
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
        />
        <select
          value={formData.vehicleType}
          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
        >
          <option value="Mini Truck">Mini Truck</option>
          <option value="Small Truck">Small Truck</option>
          <option value="Medium Truck">Medium Truck</option>
          <option value="Large Truck">Large Truck</option>
          <option value="Container Truck">Container Truck</option>
        </select>
        <input
          type="text"
          value={formData.licenseNumber}
          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
        />
        <input
          type="text"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500"
          />
          Active
        </label>
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
