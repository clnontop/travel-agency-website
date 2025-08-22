'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  User, 
  Truck, 
  Package,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { useChat, Chat } from '@/store/useChat';
import { useJobs } from '@/store/useJobs';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { chats, sendMessage, getChatsByUserId, setActiveChat, markChatAsRead } = useChat();
  const { jobs } = useJobs();
  const router = useRouter();

  // Redirect if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const userChats = getChatsByUserId(user.id);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Mark chat as read when selected
  useEffect(() => {
    if (selectedChat) {
      markChatAsRead(selectedChat.id);
      setActiveChat(selectedChat.id);
    }
  }, [selectedChat, markChatAsRead, setActiveChat]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    sendMessage(
      selectedChat.id,
      user.id,
      user.name,
      user.type,
      newMessage.trim(),
      selectedChat.jobId
    );

    setNewMessage('');
    toast.success('Message sent!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getJobDetails = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <MessageSquare className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">Messages</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Chat List */}
          <div className="lg:col-span-1 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Conversations</h2>
              <p className="text-sm text-gray-400 mt-1">
                {userChats.length} active conversation{userChats.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-80px)]">
              {userChats.length > 0 ? (
                userChats.map((chat) => {
                  const job = getJobDetails(chat.jobId);
                  const isSelected = selectedChat?.id === chat.id;
                  const otherPerson = user.type === 'customer' ? chat.driverName : chat.customerName;
                  
                  return (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                        isSelected ? 'bg-red-600/20 border-red-600' : 'hover:bg-gray-700'
                      }`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.type === 'customer' ? 'bg-blue-600' : 'bg-green-600'
                        }`}>
                          {user.type === 'customer' ? (
                            <Truck className="h-5 w-5 text-white" />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white truncate">{otherPerson}</h3>
                            {chat.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-300 truncate">{chat.jobTitle}</p>
                          
                          {chat.lastMessage && (
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-400 truncate">
                                {chat.lastMessage.content}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatTime(chat.lastMessage.timestamp)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No conversations yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Start a job to begin chatting with {user.type === 'customer' ? 'drivers' : 'customers'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-750">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.type === 'customer' ? 'bg-blue-600' : 'bg-green-600'
                      }`}>
                        {user.type === 'customer' ? (
                          <Truck className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {user.type === 'customer' ? selectedChat.driverName : selectedChat.customerName}
                        </h3>
                        <p className="text-sm text-gray-300">{selectedChat.jobTitle}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getJobDetails(selectedChat.jobId)?.status === 'in-progress' && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                          Active Job
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Job Details */}
                  {(() => {
                    const job = getJobDetails(selectedChat.jobId);
                    if (!job) return null;
                    
                    return (
                      <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{job.pickup} → {job.delivery}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">£{job.budget}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{job.status}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{formatDate(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-200px)]">
                  {selectedChat.messages.length > 0 ? (
                    <div className="space-y-4">
                      {selectedChat.messages.map((message, index) => {
                        const isOwnMessage = message.senderId === user.id;
                        const showDate = index === 0 || 
                          formatDate(message.timestamp) !== formatDate(selectedChat.messages[index - 1].timestamp);
                        
                        return (
                          <div key={message.id}>
                            {showDate && (
                              <div className="text-center mb-4">
                                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                  {formatDate(message.timestamp)}
                                </span>
                              </div>
                            )}
                            
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-gray-700 text-gray-200'
                              }`}>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium">
                                    {message.senderName}
                                  </span>
                                  <span className="text-xs opacity-70">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No messages yet</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Start the conversation by sending a message
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={1}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        newMessage.trim()
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Conversation</h3>
                  <p className="text-gray-400">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 