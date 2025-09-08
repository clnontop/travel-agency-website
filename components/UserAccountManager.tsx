'use client';

import React, { useState, useEffect } from 'react';
import { UserBackupSystem } from '@/utils/userBackupSystem';
import { useAuth } from '@/store/useAuth';

export default function UserAccountManager() {
  const [userStats, setUserStats] = useState({ totalUsers: 0, drivers: 0, customers: 0, admins: 0 });
  const [isActive, setIsActive] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Auto-update stats every 5 seconds
    const updateStats = () => {
      const stats = UserBackupSystem.getUserStats();
      setUserStats(stats);
      
      // Show activity indicator when backup system is working
      if (stats.totalUsers > 0) {
        setIsActive(true);
        setTimeout(() => setIsActive(false), 1000);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only show minimal indicator - everything is automatic now
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gradient-to-r from-green-500/20 to-green-700/20 backdrop-blur-md border border-green-500/30 rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2 text-sm text-green-400">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-green-600'}`}></div>
          <span>Auto-Backup Active</span>
          <span className="text-green-300">({userStats.totalUsers} users)</span>
        </div>
      </div>
    </div>
  );
}
