'use client';

import React, { useState } from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import { Download, Copy, Check } from 'lucide-react';

interface JobQRCodeProps {
  jobId: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  deliveryLocation: string;
  action?: 'pickup' | 'delivery' | 'verification';
  assignedDriverId?: string;
  driverName?: string;
}

const JobQRCode: React.FC<JobQRCodeProps> = ({
  jobId,
  customerName,
  customerPhone,
  pickupLocation,
  deliveryLocation,
  action = 'pickup',
  assignedDriverId,
  driverName
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const qrData = {
    type: 'job_qr',
    jobId,
    action: `${action}_complete`,
    customer: {
      name: customerName,
      phone: customerPhone
    },
    locations: {
      pickup: pickupLocation,
      delivery: deliveryLocation
    },
    driver: assignedDriverId ? {
      id: assignedDriverId,
      name: driverName || 'Assigned Driver'
    } : null,
    timestamp: Date.now(),
    version: '1.0'
  };

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `job-${jobId}-qr.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionText = () => {
    switch (action) {
      case 'pickup':
        return 'Pickup Verification';
      case 'delivery':
        return 'Delivery Confirmation';
      case 'verification':
        return 'Customer Verification';
      default:
        return 'Job QR Code';
    }
  };

  const getActionColor = () => {
    switch (action) {
      case 'pickup':
        return 'from-blue-500 to-blue-700';
      case 'delivery':
        return 'from-green-500 to-green-700';
      case 'verification':
        return 'from-purple-500 to-purple-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className={`bg-gradient-to-r ${getActionColor()} text-white rounded-lg p-4 mb-6`}>
        <h3 className="text-lg font-bold text-center">{getActionText()}</h3>
        <p className="text-sm text-center opacity-90 mt-1">Job #{jobId}</p>
      </div>

      <div className="mb-6">
        <QRCodeGenerator
          data={qrData}
          size={250}
          onGenerated={setQrDataUrl}
          className="mb-4"
        />
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Customer</p>
          <p className="font-semibold">{customerName}</p>
          <p className="text-sm text-gray-500">{customerPhone}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Pickup</p>
          <p className="font-semibold text-sm">{pickupLocation}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Delivery</p>
          <p className="font-semibold text-sm">{deliveryLocation}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopyData}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy Data'}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={!qrDataUrl}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Download size={16} />
          Download
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Show this QR code to the driver for {action} verification
      </div>
    </div>
  );
};

export default JobQRCode;
