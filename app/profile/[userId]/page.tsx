'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Truck, 
  Star, 
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  Shield,
  Award,
  Clock
} from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { useDrivers } from '@/store/useDrivers';
import { formatINR } from '@/utils/currency';
import toast from 'react-hot-toast';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user: currentUser } = useAuth();
  const { getDriver } = useDrivers();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    // Check if user is viewing their own profile or has permission
    if (currentUser.id !== params.userId && currentUser.type !== 'admin') {
      // For now, allow viewing other profiles but limit editing
      // In production, you might want stricter access control
    }

    // Load profile data
    loadProfileData();
  }, [currentUser, params.userId, router]);

  const loadProfileData = () => {
    if (!currentUser) return;

    // If viewing own profile, use current user data
    if (currentUser.id === params.userId) {
      setProfileData(currentUser);
      setEditData({
        name: currentUser.name,
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        company: currentUser.company || '',
        vehicleType: currentUser.vehicleType || '',
        licenseNumber: currentUser.licenseNumber || ''
      });
    } else {
      // If viewing another user's profile, try to find them
      const driver = getDriver(params.userId);
      if (driver) {
        setProfileData(driver);
      } else {
        // Try to find in global users (this would be from a proper user service in production)
        toast.error('User not found');
        router.push('/dashboard');
      }
    }
  };

  const handleSave = async () => {
    if (!currentUser || currentUser.id !== params.userId) {
      toast.error('You can only edit your own profile');
      return;
    }

    try {
      const { updateProfile } = useAuth.getState();
      updateProfile(editData);
      
      // If user is a driver, also update driver store
      if (currentUser.type === 'driver') {
        const { updateDriver } = useDrivers.getState();
        updateDriver(currentUser.id, editData);
      }

      setIsEditing(false);
      toast.success('Profile updated successfully!');
      loadProfileData(); // Reload data
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === params.userId;
  const canEdit = isOwnProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profileData.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="text-2xl font-bold text-white bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1 mb-2 w-full"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white mb-2">{profileData.name}</h1>
                )}
                
                <div className="flex items-center gap-4 text-gray-300 mb-4">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{profileData.phone}</span>
                  </div>
                </div>

                {/* User Type Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profileData.type === 'driver' 
                      ? 'bg-blue-100 text-blue-800' 
                      : profileData.type === 'customer'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {profileData.type === 'driver' ? '🚛 Driver' : profileData.type === 'customer' ? '👤 Customer' : '👑 Admin'}
                  </span>
                  
                  {profileData.isPremium && (
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-medium">
                      ⭐ Premium
                    </span>
                  )}
                </div>

                {/* Bio */}
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({...editData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-gray-300 resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-300">
                    {profileData.bio || 'No bio available'}
                  </p>
                )}
              </div>
            </div>

            {/* Edit Button */}
            {canEdit && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        loadProfileData(); // Reset data
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="Enter your location"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Company</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.company}
                    onChange={(e) => setEditData({...editData, company: e.target.value})}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="Enter your company"
                  />
                ) : (
                  <p className="text-gray-300">{profileData.company || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Member Since</label>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{profileData.memberSince || new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Driver Specific Info */}
          {profileData.type === 'driver' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Driver Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Vehicle Type</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.vehicleType}
                      onChange={(e) => setEditData({...editData, vehicleType: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      placeholder="e.g., Heavy Truck, Van, Pickup"
                    />
                  ) : (
                    <p className="text-gray-300">{profileData.vehicleType || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">License Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.licenseNumber}
                      onChange={(e) => setEditData({...editData, licenseNumber: e.target.value})}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      placeholder="Enter license number"
                    />
                  ) : (
                    <p className="text-gray-300">{profileData.licenseNumber || 'Not specified'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Rating</label>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold">{profileData.rating || 0}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Completed Jobs</label>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-400" />
                      <span className="text-white font-semibold">{profileData.completedJobs || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Total Earnings</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">{formatINR(profileData.totalEarnings || 0)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Wallet Information */}
          {isOwnProfile && profileData.wallet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Wallet
              </h2>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-2">
                    {formatINR(profileData.wallet.balance)}
                  </p>
                  <p className="text-gray-300">Current Balance</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400">Total Spent</p>
                    <p className="text-white font-semibold">{formatINR(profileData.wallet.totalSpent)}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-gray-400">Total Earned</p>
                    <p className="text-white font-semibold">{formatINR(profileData.wallet.totalEarned)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Back to Dashboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
