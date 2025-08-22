'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Package, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock, 
  Truck, 
  Save, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { useJobs } from '@/store/useJobs';
import toast from 'react-hot-toast';

export default function PostJob() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { createJob } = useJobs();
  const router = useRouter();

  // Redirect if not authenticated or not a customer
  if (!user || user.type !== 'customer') {
    router.push('/auth/login');
    return null;
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pickup: '',
    delivery: '',
    budget: '',
    vehicleType: '',
    specialRequirements: '',
    deadline: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateDistance = (pickup: string, delivery: string) => {
    // Simple distance calculation (in real app, you'd use Google Maps API)
    const distances = {
      'Mumbai-Delhi': '1,400 km',
      'Mumbai-Bangalore': '980 km',
      'Mumbai-Chennai': '1,330 km',
      'Delhi-Bangalore': '2,170 km',
      'Delhi-Chennai': '2,180 km',
      'Bangalore-Chennai': '350 km',
      'Delhi-Kolkata': '1,500 km',
      'Mumbai-Kolkata': '2,050 km',
      'Bangalore-Kolkata': '1,870 km',
      'Mumbai-Hyderabad': '710 km',
      'Delhi-Hyderabad': '1,570 km',
      'Bangalore-Hyderabad': '570 km',
      'Chennai-Kolkata': '1,670 km',
      'Pune-Mumbai': '150 km',
      'Pune-Bangalore': '840 km',
      'Ahmedabad-Mumbai': '530 km',
      'Ahmedabad-Delhi': '950 km',
      'Hyderabad-Chennai': '630 km',
      'Hyderabad-Kolkata': '1,500 km',
      'Pune-Delhi': '1,450 km',
      'Kolkata-Chennai': '1,670 km',
      'Kolkata-Hyderabad': '1,500 km',
      'Kolkata-Bangalore': '1,870 km',
      'Kolkata-Delhi': '1,500 km',
      'Kolkata-Mumbai': '2,050 km',
      'Chennai-Bangalore': '350 km',
      'Chennai-Mumbai': '1,330 km',
      'Chennai-Delhi': '2,180 km',
      'Chennai-Hyderabad': '630 km'
    };
    const route = `${pickup}-${delivery}`;
    return distances[route as keyof typeof distances] || 'Distance will be calculated';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.title || !formData.pickup || !formData.delivery || !formData.budget) {
      toast.error('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (parseFloat(formData.budget) <= 0) {
      toast.error('Budget must be greater than 0');
      setIsLoading(false);
      return;
    }

    try {
      const distance = calculateDistance(formData.pickup, formData.delivery);
      
      const jobData = {
        title: formData.title,
        description: formData.description,
        pickup: formData.pickup,
        delivery: formData.delivery,
        budget: parseFloat(formData.budget),
        distance,
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        vehicleType: formData.vehicleType || undefined,
        specialRequirements: formData.specialRequirements || undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined
      };

      createJob(jobData);
      
      toast.success('Job posted successfully! Drivers will be able to see and apply for this job.');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to post job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Post New Job</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Post a New Job</h1>
            <p className="text-gray-300">Create a job posting that drivers can see and apply for</p>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-gray-800 rounded-xl p-8 border border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Furniture Delivery, Electronics Shipment"
                  required
                />
              </div>

              {/* Pickup Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pickup Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={formData.pickup}
                    onChange={(e) => handleInputChange('pickup', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select pickup location</option>
                    <option value="Mumbai">Mumbai, India</option>
                    <option value="Delhi">Delhi, India</option>
                    <option value="Bangalore">Bangalore, India</option>
                    <option value="Chennai">Chennai, India</option>
                    <option value="Kolkata">Kolkata, India</option>
                    <option value="Hyderabad">Hyderabad, India</option>
                    <option value="Pune">Pune, India</option>
                    <option value="Ahmedabad">Ahmedabad, India</option>
                  </select>
                </div>
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={formData.delivery}
                    onChange={(e) => handleInputChange('delivery', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select delivery location</option>
                    <option value="Mumbai">Mumbai, India</option>
                    <option value="Delhi">Delhi, India</option>
                    <option value="Bangalore">Bangalore, India</option>
                    <option value="Chennai">Chennai, India</option>
                    <option value="Kolkata">Kolkata, India</option>
                    <option value="Hyderabad">Hyderabad, India</option>
                    <option value="Pune">Pune, India</option>
                    <option value="Ahmedabad">Ahmedabad, India</option>
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget (GBP) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter budget amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Vehicle Type
                </label>
                <div className="relative">
                  <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Any vehicle type</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Lorry">Lorry</option>
                    <option value="Pickup">Pickup</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deadline (Optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Describe the job details, items to be transported, special requirements..."
                />
              </div>

              {/* Special Requirements */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Any special handling requirements, time constraints, or additional notes..."
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-300">Job Posting Information</h3>
                  <p className="text-sm text-blue-200 mt-1">
                    This job will be visible to all available drivers. They can apply for the job, and you'll be able to select the best driver for your needs.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  isLoading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting Job...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Post Job</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}