import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Central data synchronization store
interface DataSyncState {
  lastSync: Date | null;
  syncInterval: NodeJS.Timeout | null;
  isOnline: boolean;
  pendingChanges: any[];
  
  // Actions
  startAutoSync: () => void;
  stopAutoSync: () => void;
  syncAllData: () => void;
  addPendingChange: (change: any) => void;
  broadcastChange: (type: string, data: any) => void;
  setupCrossTabSync: () => (() => void) | undefined;
}

// Auto-save all stores every second
const AUTO_SAVE_INTERVAL = 1000; // 1 second

export const useDataSync = create<DataSyncState>()(
  persist(
    (set, get) => ({
      lastSync: null,
      syncInterval: null,
      isOnline: navigator?.onLine ?? true,
      pendingChanges: [],

      startAutoSync: () => {
        const { syncInterval } = get();
        
        // Clear existing interval
        if (syncInterval) {
          clearInterval(syncInterval);
        }

        // Start new auto-sync interval
        const newInterval = setInterval(() => {
          get().syncAllData();
        }, AUTO_SAVE_INTERVAL);

        set({ syncInterval: newInterval });
        console.log('🔄 Auto-sync started - saving every second');
      },

      stopAutoSync: () => {
        const { syncInterval } = get();
        if (syncInterval) {
          clearInterval(syncInterval);
          set({ syncInterval: null });
        }
      },

      syncAllData: () => {
        try {
          // Get all store data
          const authData = localStorage.getItem('auth-storage');
          const jobsData = localStorage.getItem('jobs-storage');
          const driversData = localStorage.getItem('drivers-storage');
          const locationData = localStorage.getItem('location-storage');
          const walletData = localStorage.getItem('wallet-storage');

          // Create comprehensive backup
          const allData = {
            timestamp: new Date().toISOString(),
            auth: authData ? JSON.parse(authData) : null,
            jobs: jobsData ? JSON.parse(jobsData) : null,
            drivers: driversData ? JSON.parse(driversData) : null,
            location: locationData ? JSON.parse(locationData) : null,
            wallet: walletData ? JSON.parse(walletData) : null,
          };

          // Save to multiple locations for redundancy
          localStorage.setItem('trinck-backup', JSON.stringify(allData));
          localStorage.setItem('trinck-backup-' + Date.now(), JSON.stringify(allData));
          
          // Keep only last 10 backups to prevent storage overflow
          const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('trinck-backup-'));
          if (backupKeys.length > 10) {
            backupKeys.sort().slice(0, -10).forEach(key => {
              localStorage.removeItem(key);
            });
          }

          set({ lastSync: new Date() });
          
          // Broadcast sync event
          get().broadcastChange('DATA_SYNC', { timestamp: new Date() });
          
        } catch (error) {
          console.error('❌ Auto-sync failed:', error);
        }
      },

      addPendingChange: (change) => {
        set(state => ({
          pendingChanges: [...state.pendingChanges, { ...change, timestamp: new Date() }]
        }));
      },

      broadcastChange: (type, data) => {
        // Broadcast to all tabs
        const event = {
          type,
          data,
          timestamp: new Date().toISOString(),
          source: 'trinck-app'
        };
        
        localStorage.setItem('trinck-broadcast', JSON.stringify(event));
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('trinck-data-change', { detail: event }));
      },

      setupCrossTabSync: () => {
        // Listen for storage changes (cross-tab communication)
        const handleStorageChange = (e: StorageEvent) => {
          if (e.key === 'trinck-broadcast' && e.newValue) {
            try {
              const event = JSON.parse(e.newValue);
              if (event.source === 'trinck-app') {
                window.dispatchEvent(new CustomEvent('trinck-data-change', { detail: event }));
              }
            } catch (error) {
              console.error('Failed to parse broadcast event:', error);
            }
          }
        };

        // Listen for online/offline status
        const handleOnline = () => {
          set({ isOnline: true });
          get().syncAllData();
        };

        const handleOffline = () => {
          set({ isOnline: false });
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup function
        return () => {
          window.removeEventListener('storage', handleStorageChange);
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      }
    }),
    {
      name: 'data-sync-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Auto-restore data on app start
export const restoreAllData = () => {
  try {
    const backup = localStorage.getItem('trinck-backup');
    if (backup) {
      const data = JSON.parse(backup);
      
      // Restore each store if current data is missing or older
      if (data.auth && !localStorage.getItem('auth-storage')) {
        localStorage.setItem('auth-storage', JSON.stringify(data.auth));
      }
      
      if (data.jobs && !localStorage.getItem('jobs-storage')) {
        localStorage.setItem('jobs-storage', JSON.stringify(data.jobs));
      }
      
      if (data.drivers && !localStorage.getItem('drivers-storage')) {
        localStorage.setItem('drivers-storage', JSON.stringify(data.drivers));
      }
      
      if (data.location && !localStorage.getItem('location-storage')) {
        localStorage.setItem('location-storage', JSON.stringify(data.location));
      }
      
      if (data.wallet && !localStorage.getItem('wallet-storage')) {
        localStorage.setItem('wallet-storage', JSON.stringify(data.wallet));
      }
      
      console.log('✅ Data restored from backup');
    }
  } catch (error) {
    console.error('❌ Failed to restore data:', error);
  }
};
