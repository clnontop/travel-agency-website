'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  Clock, 
  Star, 
  Edit, 
  Save, 
  Camera,
  MessageCircle,
  Heart,
  Share,
  Plus,
  User,
  Award,
  Shield,
  Smartphone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';
import toast from 'react-hot-toast';
import DriverQRGenerator from '@/components/DriverQRGenerator';

interface SocialPost {
  id: string;
  content: string;
  type: 'availability' | 'general' | 'achievement';
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export default function DriverProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    vehicleType: user?.vehicleType || '',
    licenseNumber: user?.licenseNumber || '',
    company: user?.company || '',
    experience: user?.experience || '',
    specialization: user?.specialization || ''
  });

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([
    {
      id: '1',
      content: 'Available for jobs in London area today! Experienced with furniture and electronics delivery. Competitive rates. 🚛 #Available #London #Delivery',
      type: 'availability',
      timestamp: new Date('2024-01-15T10:30:00'),
      likes: 12,
      comments: 3,
      isLiked: false
    },
    {
      id: '2',
      content: 'Just completed my 100th delivery! 🎉 Thank you to all my customers for trusting me with their shipments. Here\'s to many more successful deliveries! #Milestone #Delivery #Success',
      type: 'achievement',
      timestamp: new Date('2024-01-14T15:45:00'),
      likes: 28,
      comments: 8,
      isLiked: true
    },
    {
      id: '3',
      content: 'Great day delivering electronics from Mumbai to Delhi. Smooth journey and happy customer! The weather was perfect for driving. #Electronics #Mumbai #Delhi',
      type: 'general',
      timestamp: new Date('2024-01-13T18:20:00'),
      likes: 15,
      comments: 5,
      isLiked: false
    }
  ]);

  // Redirect if not authenticated or not a driver
  if (!user || user.type !== 'driver') {
    router.push('/auth/login');
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      location: formData.location,
      vehicleType: formData.vehicleType,
      licenseNumber: formData.licenseNumber,
      company: formData.company,
      experience: formData.experience,
      specialization: formData.specialization
    });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    const post: SocialPost = {
      id: Date.now().toString(),
      content: newPost,
      type: 'general',
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setSocialPosts([post, ...socialPosts]);
    setNewPost('');
    toast.success('Post created successfully!');
  };

  const handleLikePost = (postId: string) => {
    setSocialPosts(posts => 
      posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      )
    );
  };

  const handleToggleAvailability = () => {
    updateProfile({ isAvailable: !user.isAvailable });
    toast.success(user.isAvailable ? 'Marked as unavailable' : 'Marked as available for jobs!');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Truck className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Driver Profile</span>
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
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <div className="flex items-center space-x-4 text-gray-300 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{user.rating || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Truck className="h-4 w-4" />
                    <span>{user.vehicleType || 'Vehicle not set'}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleToggleAvailability}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      user.isAvailable
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {user.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{formatINR(user.totalEarnings || 0)}</p>
              <p className="text-gray-300">Total Earnings</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'mobile'
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 inline mr-1" />
            Mobile App
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'social'
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Social Feed
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-300">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-300">{user.bio || 'No bio added yet'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-300">{user.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-300">{user.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-300">{user.location || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle Type</label>
                      {isEditing ? (
                        <select
                          value={formData.vehicleType}
                          onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select vehicle type</option>
                          <option value="Van">Van</option>
                          <option value="Truck">Truck</option>
                          <option value="Lorry">Lorry</option>
                          <option value="Pickup">Pickup</option>
                        </select>
                      ) : (
                        <p className="text-gray-300">{user.vehicleType || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">License Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-300">{user.licenseNumber || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Experience</label>
                      {isEditing ? (
                        <select
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select Experience</option>
                          <option value="0-1 years">0-1 years</option>
                          <option value="1-3 years">1-3 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5-10 years">5-10 years</option>
                          <option value="10+ years">10+ years</option>
                        </select>
                      ) : (
                        <p className="text-gray-300">{user.experience || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Company name"
                        />
                      ) : (
                        <p className="text-gray-300">{user.company || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
                      {isEditing ? (
                        <select
                          value={formData.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value)}
                          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="">Select Specialization</option>
                          <option value="Local Delivery">Local Delivery</option>
                          <option value="Long Distance">Long Distance</option>
                          <option value="Heavy Cargo">Heavy Cargo</option>
                          <option value="Fragile Items">Fragile Items</option>
                          <option value="Express Delivery">Express Delivery</option>
                          <option value="Refrigerated Transport">Refrigerated Transport</option>
                        </select>
                      ) : (
                        <p className="text-gray-300">{user.specialization || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                      <p className="text-gray-300">{user.memberSince}</p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4">
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Completed Jobs</span>
                    <span className="font-semibold text-white">{user.completedJobs || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-white">{user.rating || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Earnings</span>
                    <span className="font-semibold text-white">{formatINR(user.totalEarnings || 0)}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-300">Top Driver</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-gray-300">Verified</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <Star className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-300">5-Star Rating</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        ) : activeTab === 'social' ? (
          /* Social Feed */
          <div className="space-y-6">
            {/* Create Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Create Post</h3>
              <div className="space-y-4">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your availability, achievements, or thoughts with other drivers..."
                  className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                      Available
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                      Achievement
                    </button>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                      General
                    </button>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {socialPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-white">{user.name}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{post.timestamp.toLocaleDateString()}</span>
                        {post.type === 'availability' && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                            Available
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mb-4">{post.content}</p>
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 transition-colors">
                          <Share className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : activeTab === 'mobile' ? (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Driver Mobile App</h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  Install the Trinck Driver app on your phone to enable live GPS tracking and receive job notifications. 
                  Your location will only be shared with customers who have hired you.
                </p>
              </div>

              <DriverQRGenerator driverId={user.id} driverName={user.name} />

              {/* App Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Live GPS Tracking</h3>
                  <p className="text-gray-300">
                    Share your real-time location with customers who hired you. High-accuracy GPS ensures precise tracking.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Privacy Protected</h3>
                  <p className="text-gray-300">
                    Your location is only visible to customers with active jobs. Complete privacy control in your hands.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6"
                >
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Job Management</h3>
                  <p className="text-gray-300">
                    View active jobs, receive notifications, and manage your delivery status directly from the app.
                  </p>
                </motion.div>
              </div>

              {/* Installation Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-8"
              >
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Smartphone className="w-6 h-6 mr-2 text-blue-400" />
                  Quick Setup Guide
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Visit Driver App</h4>
                        <p className="text-gray-300 text-sm">
                          Open your phone browser and go to: <br />
                          <code className="bg-gray-700 px-2 py-1 rounded text-blue-300 text-xs">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/driver-app
                          </code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Install App</h4>
                        <p className="text-gray-300 text-sm">
                          Tap "Install App" when prompted to add it to your home screen like a native app.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Scan QR Code</h4>
                        <p className="text-gray-300 text-sm">
                          Use the QR scanner in the app to scan your unique QR code above.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Enable Location</h4>
                        <p className="text-gray-300 text-sm">
                          Grant location permissions to start sharing your live GPS with hired customers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
}