'use client';

import { motion } from 'framer-motion';
import { Download, Smartphone, MapPin, Shield, CheckCircle, Star } from 'lucide-react';
import { useGPS } from '@/store/useGPS';
import { useAuth } from '@/store/useAuth';

export default function DriverAppDownload() {
  const { user } = useAuth();
  const { setGPSPermission, getGPSPermission } = useGPS();
  
  const gpsPermission = user ? getGPSPermission(user.id) : null;
  const hasApp = gpsPermission?.hasAppInstalled;

  const handleDownload = () => {
    if (user) {
      setGPSPermission(user.id, {
        hasAppInstalled: true,
        permissionGranted: true,
        lastPermissionCheck: new Date(),
        appVersion: '1.0.0'
      });
    }
  };

  if (hasApp) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Trinck Driver App Installed</h3>
            <p className="text-green-700">GPS tracking is now available for your customers</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg"
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Smartphone className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Download Trinck Driver App</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Enable GPS tracking to provide real-time location updates to your customers and increase your earnings potential.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
            <p className="text-sm text-gray-600">Share your live location with customers during active jobs</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Privacy Protected</h3>
            <p className="text-sm text-gray-600">Location is only shared during active jobs, automatically stops when completed</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Higher Ratings</h3>
            <p className="text-sm text-gray-600">Customers prefer drivers with GPS tracking enabled</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Download the App?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Increase Job Opportunities</p>
                <p className="text-sm text-gray-600">Customers prefer drivers with GPS tracking</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Build Trust</p>
                <p className="text-sm text-gray-600">Transparency leads to better ratings</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Reduce Support Calls</p>
                <p className="text-sm text-gray-600">Customers can track progress themselves</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Privacy Control</p>
                <p className="text-sm text-gray-600">You control when tracking is enabled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center space-x-3 mx-auto text-lg font-semibold shadow-lg"
        >
          <Download className="w-6 h-6" />
          <span>Download Trinck Driver App</span>
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Available for Android and iOS • Free Download • No subscription required
        </p>
      </div>
    </motion.div>
  );
}
