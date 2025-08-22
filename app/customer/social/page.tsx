'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  MessageCircle,
  Heart,
  Share,
  Plus,
  Star,
  Building,
  Truck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import toast from 'react-hot-toast';

interface SocialPost {
  id: string;
  content: string;
  type: 'shipment' | 'review' | 'general';
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  driverName?: string;
  rating?: number;
}

export default function CustomerSocial() {
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<'shipment' | 'review' | 'general'>('general');
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or not a customer
  if (!user || user.type !== 'customer') {
    router.push('/auth/login');
    return null;
  }

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([
    {
      id: '1',
      content: 'Just had an amazing delivery experience! John Driver delivered my furniture from London to Manchester in perfect condition. Highly recommend! 🚛 #GreatService #ReliableDriver',
      type: 'review',
      timestamp: new Date('2024-01-15T10:30:00'),
      likes: 15,
      comments: 4,
      isLiked: false,
      driverName: 'John Driver',
      rating: 5
    },
    {
      id: '2',
      content: 'Looking for a reliable driver for electronics shipment from Birmingham to Glasgow. Any recommendations? #LookingForDriver #Electronics #Birmingham #Glasgow',
      type: 'shipment',
      timestamp: new Date('2024-01-14T15:45:00'),
      likes: 8,
      comments: 12,
      isLiked: true
    },
    {
      id: '3',
      content: 'TRINK has been a game-changer for our business! The platform makes it so easy to find reliable drivers and track shipments. #TRINK #Business #Logistics',
      type: 'general',
      timestamp: new Date('2024-01-13T18:20:00'),
      likes: 22,
      comments: 6,
      isLiked: false
    }
  ]);

  const handleCreatePost = () => {
    if (!newPost.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    const post: SocialPost = {
      id: Date.now().toString(),
      content: newPost,
      type: postType,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setSocialPosts([post, ...socialPosts]);
    setNewPost('');
    setPostType('general');
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

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'shipment': return 'bg-blue-600';
      case 'review': return 'bg-green-600';
      case 'general': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'shipment': return 'Shipment';
      case 'review': return 'Review';
      case 'general': return 'General';
      default: return 'General';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Customer Social</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Back to Dashboard
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
            <h1 className="text-3xl font-bold text-white mb-2">Customer Community</h1>
            <p className="text-gray-300">Share your experiences, find drivers, and connect with other customers</p>
          </div>

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
                placeholder="Share your shipment experiences, driver reviews, or general thoughts..."
                className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white resize-none"
                rows={3}
              />
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setPostType('shipment')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      postType === 'shipment' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    Shipment
                  </button>
                  <button 
                    onClick={() => setPostType('review')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      postType === 'review' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    Review
                  </button>
                  <button 
                    onClick={() => setPostType('general')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      postType === 'general' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
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
                      <span className={`px-2 py-1 ${getPostTypeColor(post.type)} text-white text-xs rounded-full`}>
                        {getPostTypeLabel(post.type)}
                      </span>
                      {post.driverName && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-300">Driver: {post.driverName}</span>
                        </>
                      )}
                      {post.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-gray-300">{post.rating}</span>
                        </div>
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

          {/* Community Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Community Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-gray-300 text-sm">Active Customers</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">5,892</div>
                <div className="text-gray-300 text-sm">Posts This Month</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-white">4.8</div>
                <div className="text-gray-300 text-sm">Average Rating</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}