'use client';

import React, { useState } from 'react';
import { Trash2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ClearAllDataPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const clearAllData = async () => {
    setIsClearing(true);
    
    try {
      // Clear all localStorage
      localStorage.clear();
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Clear specific Trink-related items
      const keysToRemove = [
        'trink_users',
        'trink_current_user',
        'auth_token',
        'user_session',
        'driver_data',
        'customer_data',
        'booking_history',
        'payment_history',
        'job_history',
        'location_data',
        'preferences',
        'settings'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear IndexedDB if exists
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        databases.forEach(db => {
          if (db.name && db.name.includes('trink')) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear cache if service worker exists
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      setCleared(true);
      
      // Auto reload after 2 seconds
      setTimeout(() => {
        window.location.href = '/auth/register';
      }, 2000);
      
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 max-w-md w-full">
        <div className="text-center">
          {!cleared ? (
            <>
              <div className="bg-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">Clear All Data</h1>
              <p className="text-gray-400 mb-6">
                This will completely remove all user data, registration history, and cached information. 
                You'll be able to register with any email address after this.
              </p>
              
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">Warning</span>
                </div>
                <p className="text-yellow-200 text-sm">
                  This action cannot be undone. All user accounts, bookings, and history will be permanently deleted.
                </p>
              </div>
              
              <button
                onClick={clearAllData}
                disabled={isClearing}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Clearing Data...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Clear All Data
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">Data Cleared Successfully!</h1>
              <p className="text-gray-400 mb-6">
                All user data has been completely removed. You can now register with any email address.
              </p>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-200 text-sm">
                  Redirecting to registration page...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
