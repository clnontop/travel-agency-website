'use client';

import { motion } from 'framer-motion';
import { User, Building, MapPin, Calendar, Shield, Award, Star, Edit } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CustomerProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    company: user?.company || '',
    bio: user?.bio || ''
  });

  const handleSave = () => {
    if (user) {
      updateProfile({
        ...user,
        ...editData
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    }
  };
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
              <button 
                onClick={() => window.history.back()}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Back to Dashboard
              </button>
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
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user?.name || 'User'}</h1>
                <div className="flex items-center space-x-4 text-gray-300 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user?.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{user?.company || 'Company not set'}</span>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">{user?.email || 'Email not set'}</div>
                <div className="text-gray-400 text-sm">{user?.phone || 'Phone not set'}</div>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
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
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Phone</label>
                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Company</label>
                    <input
                      type="text"
                      value={editData.company}
                      onChange={(e) => setEditData({...editData, company: e.target.value})}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Bio</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({...editData, bio: e.target.value})}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-red-500"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Full Name</span>
                    <span className="font-semibold text-white">{user?.name || 'Not set'}</span>
                </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email</span>
                    <span className="font-semibold text-white">{user?.email || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Phone</span>
                    <span className="font-semibold text-white">{user?.phone || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Location</span>
                    <span className="font-semibold text-white">{user?.location || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Company</span>
                    <span className="font-semibold text-white">{user?.company || 'Not set'}</span>
                  </div>
                  {user?.bio && (
                    <div className="flex items-start justify-between">
                      <span className="text-gray-300">Bio</span>
                      <span className="font-semibold text-white text-right max-w-xs">{user.bio}</span>
                    </div>
                  )}
                </div>
              )}
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
                  <span className="font-semibold text-white">{user?.postedJobs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Active Jobs</span>
                  <span className="font-semibold text-white">{user?.activeJobs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Completed Jobs</span>
                  <span className="font-semibold text-white">{user?.completedJobs || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Wallet Balance</span>
                  <span className="font-semibold text-white">₹{user?.wallet?.balance || 0}</span>
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
                  <span className="font-semibold text-white">{user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Account Type</span>
                  <span className="font-semibold text-white capitalize">{user?.type || 'Customer'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className="font-semibold text-green-400">Active</span>
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

