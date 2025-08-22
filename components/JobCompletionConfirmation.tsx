'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Star,
  Truck,
  Clock,
  CreditCard,
  X,
  AlertTriangle
} from 'lucide-react';
import { useJobs, Job } from '@/store/useJobs';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import toast from 'react-hot-toast';

interface JobCompletionConfirmationProps {
  job: Job;
  onClose: () => void;
  onConfirm: () => void;
}

// Mock driver data - in a real app, this would come from an API
const getDriverInfo = (driverId: string) => {
  const drivers: Record<string, any> = {
    'driver1': {
      id: 'driver1',
      name: 'Rajesh Kumar',
      rating: 4.8,
      completedJobs: 156,
      vehicleType: 'Truck',
      phone: '+91 98765 43210',
      avatar: '/api/placeholder/40/40'
    },
    'driver2': {
      id: 'driver2',
      name: 'Amit Singh',
      rating: 4.6,
      completedJobs: 89,
      vehicleType: 'Van',
      phone: '+91 87654 32109',
      avatar: '/api/placeholder/40/40'
    },
    'driver3': {
      id: 'driver3',
      name: 'Suresh Patel',
      rating: 4.9,
      completedJobs: 234,
      vehicleType: 'Pickup',
      phone: '+91 76543 21098',
      avatar: '/api/placeholder/40/40'
    }
  };
  return drivers[driverId] || { name: 'Unknown Driver', rating: 0, completedJobs: 0, vehicleType: 'Vehicle', phone: 'N/A' };
};

export default function JobCompletionConfirmation({ 
  job, 
  onClose, 
  onConfirm 
}: JobCompletionConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const { confirmCompletion } = useJobs();
  const { user, payDriver } = useAuth();

  const driver = getDriverInfo(job.selectedDriver || '');

  const handleConfirmAndPay = async () => {
    if (!user || !job.selectedDriver) {
      toast.error('Unable to process payment');
      return;
    }

    setIsProcessing(true);

    try {
      // First, process the payment
      const paymentResult = await payDriver(
        job.selectedDriver,
        job.budget,
        `Payment for completed job: ${job.title}`
      );

      if (paymentResult.success) {
        // If payment successful, confirm the job completion
        confirmCompletion(job.id);
        toast.success('Job completed and payment processed successfully!');
        onConfirm();
        onClose();
      } else {
        toast.error(paymentResult.message);
      }
    } catch (error) {
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCompletion = () => {
    // In a real app, you might want to add a dispute mechanism
    toast.success('You can contact the driver to discuss any issues');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Job Completion Confirmation</h3>
                <p className="text-green-100 text-sm">Driver has marked this job as complete</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Job Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{job.title}</h5>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-green-500" />
                    <span className="font-medium">From:</span>
                    <span className="ml-1">{job.pickup}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    <span className="font-medium">To:</span>
                    <span className="ml-1">{job.delivery}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Started: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Completed: {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'Just now'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Driver Information</h4>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {driver.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 text-lg">{driver.name}</h5>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
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
                <div className="flex items-center space-x-1 text-sm text-gray-600 mt-2">
                  <Phone className="w-4 h-4" />
                  <span>{driver.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-green-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatINR(job.budget)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Your Balance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatINR(user?.wallet.balance || 0)}
                </p>
              </div>
            </div>
            
            {(user?.wallet.balance || 0) < job.budget && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Insufficient balance for payment</span>
                </div>
              </div>
            )}
          </div>

          {/* Rating Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">How would you rate this driver?</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      <Star className="w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Share your experience with this driver..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleRejectCompletion}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Report Issue
            </button>
            <button
              onClick={handleConfirmAndPay}
              disabled={
                isProcessing || 
                (user?.wallet.balance || 0) < job.budget
              }
              className="flex-2 py-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Confirm & Pay {formatINR(job.budget)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
