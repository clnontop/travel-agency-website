'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  MapPin, 
  Package, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  Truck,
  Clock,
  FileText
} from 'lucide-react';
import { formatINR } from '../utils/currency';

interface JobFormData {
  title: string;
  description: string;
  pickupLocation: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryLocation: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  cargo: {
    type: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    specialRequirements: string[];
    isFragile: boolean;
    isHazardous: boolean;
  };
  budget: {
    min: number;
    max: number;
  };
  deadline: string;
  specialInstructions: string;
}

export default function JobPostForm() {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    pickupLocation: { address: '', city: '', state: '', zipCode: '' },
    deliveryLocation: { address: '', city: '', state: '', zipCode: '' },
    cargo: {
      type: '',
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      specialRequirements: [],
      isFragile: false,
      isHazardous: false
    },
    budget: { min: 0, max: 0 },
    deadline: '',
    specialInstructions: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Job Details', icon: FileText },
    { number: 2, title: 'Locations', icon: MapPin },
    { number: 3, title: 'Cargo Info', icon: Package },
    { number: 4, title: 'Budget & Timeline', icon: DollarSign }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        break;
      case 2:
        if (!formData.pickupLocation.address.trim()) newErrors.pickupAddress = 'Pickup address is required';
        if (!formData.deliveryLocation.address.trim()) newErrors.deliveryAddress = 'Delivery address is required';
        break;
      case 3:
        if (!formData.cargo.type.trim()) newErrors.cargoType = 'Cargo type is required';
        if (formData.cargo.weight <= 0) newErrors.cargoWeight = 'Weight must be greater than 0';
        break;
      case 4:
        if (formData.budget.min <= 0) newErrors.budgetMin = 'Minimum budget is required';
        if (formData.budget.max <= formData.budget.min) newErrors.budgetMax = 'Maximum budget must be greater than minimum';
        if (!formData.deadline) newErrors.deadline = 'Deadline is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Submit form data
      console.log('Job posted:', formData);
      // Here you would typically send the data to your API
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600">Fill in the details below to find the perfect driver</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map(step => (
              <span key={step.number} className={`text-sm ${
                currentStep >= step.number ? 'text-primary-600 font-medium' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Furniture Delivery from NYC to Boston"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your shipment requirements, special handling needs, etc."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location *
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.pickupLocation.address}
                      onChange={(e) => handleInputChange('pickupLocation', { ...formData.pickupLocation, address: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.pickupAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formData.pickupLocation.city}
                        onChange={(e) => handleInputChange('pickupLocation', { ...formData.pickupLocation, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={formData.pickupLocation.state}
                        onChange={(e) => handleInputChange('pickupLocation', { ...formData.pickupLocation, state: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  {errors.pickupAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.pickupAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Location *
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.deliveryLocation.address}
                      onChange={(e) => handleInputChange('deliveryLocation', { ...formData.deliveryLocation, address: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formData.deliveryLocation.city}
                        onChange={(e) => handleInputChange('deliveryLocation', { ...formData.deliveryLocation, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={formData.deliveryLocation.state}
                        onChange={(e) => handleInputChange('deliveryLocation', { ...formData.deliveryLocation, state: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  {errors.deliveryAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.deliveryAddress}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo Type *
                  </label>
                  <input
                    type="text"
                    value={formData.cargo.type}
                    onChange={(e) => handleInputChange('cargo', { ...formData.cargo, type: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.cargoType ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Furniture, Electronics, Food"
                  />
                  {errors.cargoType && (
                    <p className="text-red-500 text-sm mt-1">{errors.cargoType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs) *
                  </label>
                  <input
                    type="number"
                    value={formData.cargo.weight}
                    onChange={(e) => handleInputChange('cargo', { ...formData.cargo, weight: Number(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.cargoWeight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.cargoWeight && (
                    <p className="text-red-500 text-sm mt-1">{errors.cargoWeight}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    value={formData.cargo.dimensions.length}
                    onChange={(e) => handleInputChange('cargo', { 
                      ...formData.cargo, 
                      dimensions: { ...formData.cargo.dimensions, length: Number(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (ft)
                  </label>
                  <input
                    type="number"
                    value={formData.cargo.dimensions.width}
                    onChange={(e) => handleInputChange('cargo', { 
                      ...formData.cargo, 
                      dimensions: { ...formData.cargo.dimensions, width: Number(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (ft)
                  </label>
                  <input
                    type="number"
                    value={formData.cargo.dimensions.height}
                    onChange={(e) => handleInputChange('cargo', { 
                      ...formData.cargo, 
                      dimensions: { ...formData.cargo.dimensions, height: Number(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.cargo.isFragile}
                    onChange={(e) => handleInputChange('cargo', { ...formData.cargo, isFragile: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Fragile items (requires special handling)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.cargo.isHazardous}
                    onChange={(e) => handleInputChange('cargo', { ...formData.cargo, isHazardous: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hazardous materials</span>
                </label>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.budget.min}
                    onChange={(e) => handleInputChange('budget', { ...formData.budget, min: Number(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.budgetMin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.budgetMin && (
                    <p className="text-red-500 text-sm mt-1">{errors.budgetMin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.budget.max}
                    onChange={(e) => handleInputChange('budget', { ...formData.budget, max: Number(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.budgetMax ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.budgetMax && (
                    <p className="text-red-500 text-sm mt-1">{errors.budgetMax}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline *
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.deadline ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deadline && (
                  <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any additional requirements or instructions for the driver..."
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="btn-primary px-6 py-3"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn-primary px-6 py-3"
            >
              Post Job
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
} 