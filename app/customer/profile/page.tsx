'use client';

import { motion } from 'framer-motion';
import { User, Building, MapPin, Calendar, Shield, Award, Star } from 'lucide-react';

const mockUser = {
  name: 'Sarah Customer',
  email: 'sarah.customer@email.com',
  phone: '+91 98765 43210',
  location: 'Mumbai, India',
  company: 'Tech Solutions Ltd',
  memberSince: '2023',
  status: 'Active',
  postedJobs: 8,
  activeJobs: 3,
  completedJobs: 12,
  wallet: { balance: 0, currency: 'INR' },
};

export default function CustomerProfile() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Customer Profile</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-300 hover:text-white transition-colors">Back to Dashboard</button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {mockUser.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{mockUser.name}</h1>
                <div className="flex items-center space-x-4 text-gray-300 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{mockUser.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{mockUser.company}</span>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">{mockUser.email}</div>
                <div className="text-gray-400 text-sm">{mockUser.phone}</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{mockUser.wallet.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
              <p className="text-gray-300">Wallet Balance</p>
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Full Name</span>
                  <span className="font-semibold text-white">{mockUser.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email</span>
                  <span className="font-semibold text-white">{mockUser.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Phone</span>
                  <span className="font-semibold text-white">{mockUser.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Location</span>
                  <span className="font-semibold text-white">{mockUser.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Company</span>
                  <span className="font-semibold text-white">{mockUser.company}</span>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Account Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Posted Jobs</span>
                  <span className="font-semibold text-white">{mockUser.postedJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Active Jobs</span>
                  <span className="font-semibold text-white">{mockUser.activeJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Completed Jobs</span>
                  <span className="font-semibold text-white">{mockUser.completedJobs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Spent</span>
                  <span className="font-semibold text-white">{mockUser.wallet.balance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Member Since</span>
                  <span className="font-semibold text-white">{mockUser.memberSince}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Account Type</span>
                  <span className="font-semibold text-white">Customer</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className="font-semibold text-green-400">{mockUser.status}</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-gray-300">Verified Customer</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-300">Regular Customer</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <Star className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-300">5-Star Rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

