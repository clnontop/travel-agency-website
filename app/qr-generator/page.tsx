'use client';

import React, { useState, useEffect } from 'react';
import JobQRCode from '@/components/JobQRCode';
import { ArrowLeft, QrCode, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDrivers } from '@/store/useDrivers';

export default function QRGeneratorPage() {
  const router = useRouter();
  const { drivers, getAvailableDrivers } = useDrivers();
  const [formData, setFormData] = useState({
    jobId: '',
    customerName: '',
    customerPhone: '',
    pickupLocation: '',
    deliveryLocation: '',
    action: 'pickup' as 'pickup' | 'delivery' | 'verification',
    assignedDriverId: ''
  });

  const [showQR, setShowQR] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

  useEffect(() => {
    // Load available drivers
    const loadDrivers = () => {
      const available = getAvailableDrivers();
      setAvailableDrivers(available);
    };
    
    loadDrivers();
  }, [getAvailableDrivers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.jobId && formData.customerName && formData.pickupLocation && formData.deliveryLocation) {
      // Auto-assign a driver if none selected
      if (!formData.assignedDriverId && availableDrivers.length > 0) {
        setFormData(prev => ({
          ...prev,
          assignedDriverId: availableDrivers[0].id
        }));
      }
      setShowQR(true);
    }
  };

  const generateRandomJobId = () => {
    const jobId = 'TRK' + Math.random().toString(36).substr(2, 6).toUpperCase();
    setFormData({ ...formData, jobId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-red-500/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <QrCode className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">QR Code Generator</h1>
                <p className="text-gray-400">Generate QR codes for job verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Job Details</h2>
            
            <form onSubmit={handleGenerateQR} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Job ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="jobId"
                    value={formData.jobId}
                    onChange={handleInputChange}
                    placeholder="Enter job ID"
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateRandomJobId}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  placeholder="Enter pickup address"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Location
                </label>
                <input
                  type="text"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleInputChange}
                  placeholder="Enter delivery address"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assign Driver
                </label>
                <select
                  name="assignedDriverId"
                  value={formData.assignedDriverId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">Auto-assign available driver</option>
                  {availableDrivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.vehicleDetails?.make} {driver.vehicleDetails?.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  QR Code Type
                </label>
                <select
                  name="action"
                  value={formData.action}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="pickup">Pickup Verification</option>
                  <option value="delivery">Delivery Confirmation</option>
                  <option value="verification">Customer Verification</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Generate QR Code
              </button>
            </form>
          </div>

          {/* QR Code Display */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Generated QR Code</h2>
            
            {showQR ? (
              <JobQRCode
                jobId={formData.jobId}
                customerName={formData.customerName}
                customerPhone={formData.customerPhone}
                pickupLocation={formData.pickupLocation}
                deliveryLocation={formData.deliveryLocation}
                action={formData.action}
                assignedDriverId={formData.assignedDriverId}
                driverName={availableDrivers.find(d => d.id === formData.assignedDriverId)?.name}
              />
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-600 rounded-lg">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Fill in the job details to generate QR code</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-black/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-bold text-white mb-4">How to Use QR Codes</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Generate</h4>
              <p className="text-gray-400 text-sm">Create QR codes for pickup, delivery, or customer verification</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-400 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Share</h4>
              <p className="text-gray-400 text-sm">Send the QR code to customers or display at pickup/delivery locations</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-white mb-2">Scan</h4>
              <p className="text-gray-400 text-sm">Drivers scan the code using the mobile app to verify actions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
