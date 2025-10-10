'use client';

import { motion } from 'framer-motion';
import { X, CheckCircle, Receipt, Download } from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    transactionId: string;
    jobId: string;
    jobAmount: number;
    customerFee: number;
    driverFee: number;
    totalCustomerPayment: number;
    driverReceives: number;
    platformEarnings: number;
    customerName: string;
    timestamp: Date;
  } | null;
}

export default function PaymentReceiptModal({ isOpen, onClose, receipt }: PaymentReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Payment Successful!</h2>
              <p className="text-sm text-gray-400">Job payment completed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Details */}
        <div className="space-y-4">
          {/* Transaction Info */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Receipt className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Transaction Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="text-white font-mono">{receipt.transactionId.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Job ID:</span>
                <span className="text-white font-mono">{receipt.jobId.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="text-white">{receipt.timestamp.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Payment Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Job Amount:</span>
                <span className="text-white">{formatINR(receipt.jobAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee (2%):</span>
                <span className="text-red-400">+{formatINR(receipt.customerFee)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-white">You Paid:</span>
                  <span className="text-white">{formatINR(receipt.totalCustomerPayment)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Payment Info */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Driver Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Job Amount:</span>
                <span className="text-white">{formatINR(receipt.jobAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee (2%):</span>
                <span className="text-red-400">-{formatINR(receipt.driverFee)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-white">Driver Receives:</span>
                  <span className="text-green-400">{formatINR(receipt.driverReceives)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Earnings */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">Total Platform Earnings:</span>
              <span className="text-blue-300 font-medium">{formatINR(receipt.platformEarnings)} (4%)</span>
            </div>
            <p className="text-xs text-blue-400 mt-1">
              2% from customer + 2% from driver = 4% total platform fee
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => {
              // Download receipt functionality
              const receiptData = {
                ...receipt,
                downloadedAt: new Date()
              };
              const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `receipt-${receipt.transactionId}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
