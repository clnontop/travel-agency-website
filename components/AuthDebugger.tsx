'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Users, Key, Database } from 'lucide-react';

export default function AuthDebugger() {
  const [showDebug, setShowDebug] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (showDebug) {
      loadUsers();
    }
  }, [showDebug]);

  const loadUsers = () => {
    try {
      const stored = localStorage.getItem('trinck-registered-users');
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        setUsers(parsedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const clearAllUsers = () => {
    if (confirm('Are you sure you want to clear all registered users? This cannot be undone.')) {
      localStorage.removeItem('trinck-registered-users');
      setUsers([]);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!showDebug ? (
        <button
          onClick={() => setShowDebug(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Show Auth Debugger"
        >
          <Database className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-black/90 text-white rounded-lg p-4 max-w-md max-h-96 overflow-y-auto backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Auth Debug ({users.length} users)</h3>
            </div>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <button
              onClick={loadUsers}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              Refresh Users
            </button>
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
              {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswords ? 'Hide' : 'Show'} Passwords
            </button>
            <button
              onClick={clearAllUsers}
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              Clear All Users
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">
              No users found in localStorage
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user, index) => (
                <div key={index} className="bg-white/10 rounded p-3 text-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.type === 'customer' ? 'bg-blue-500/20 text-blue-400' : 
                      user.type === 'driver' ? 'bg-red-500/20 text-red-400' : 
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.type}
                    </span>
                    {user.isPremium && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div><strong>Name:</strong> {user.name}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>ID:</strong> {user.id}</div>
                    <div><strong>Wallet:</strong> ₹{user.wallet?.balance || 0}</div>
                    
                    {showPasswords && (
                      <div className="flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        <strong>Password Hash:</strong> 
                        <span className="font-mono text-xs break-all">
                          {user.password?.substring(0, 20)}...
                        </span>
                      </div>
                    )}
                    
                    {user.createdAt && (
                      <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
                    )}
                    
                    {user.lastLogin && (
                      <div><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
