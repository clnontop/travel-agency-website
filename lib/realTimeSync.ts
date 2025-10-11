// Real-time synchronization using Server-Sent Events simulation
// In production, this would use WebSockets or actual SSE

interface SyncEvent {
  type: 'job_created' | 'job_updated' | 'payment_sent' | 'driver_status_changed';
  data: any;
  timestamp: number;
  id: string;
}

class RealTimeSync {
  private static instance: RealTimeSync;
  private listeners: Map<string, ((event: SyncEvent) => void)[]> = new Map();
  private eventHistory: SyncEvent[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startPolling();
  }

  static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync();
    }
    return RealTimeSync.instance;
  }

  // Simulate server polling for real-time updates
  private startPolling() {
    if (typeof window === 'undefined') return;

    // Start immediately
    this.checkForUpdates();
    
    this.syncInterval = setInterval(() => {
      this.checkForUpdates();
    }, 2000); // Poll every 2 seconds for better performance 
  }

  private async checkForUpdates() {
    try {
      // Skip API calls for now - use localStorage only for local sync
      this.checkLocalStorage();
    } catch (error) {
      console.error('Sync check failed:', error);
    }
  }

  private checkLocalStorage() {
    try {
      const syncData = localStorage.getItem('trinck-global-sync-events');
      if (syncData) {
        const events: SyncEvent[] = JSON.parse(syncData);
        const newEvents = events.filter(event => 
          !this.eventHistory.some(existing => existing.id === event.id)
        );

        newEvents.forEach(event => {
          this.eventHistory.push(event);
          this.notifyListeners(event.type, event);
        });
      }
    } catch (error) {
      console.error('Local storage sync failed:', error);
    }
  }

  // Broadcast an event to all connected clients
  async broadcast(type: SyncEvent['type'], data: any) {
    try {
      const event: SyncEvent = {
        type,
        data,
        timestamp: Date.now(),
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Store in localStorage for same-browser sync
      if (typeof window !== 'undefined') {
        const existingEvents = localStorage.getItem('trinck-global-sync-events');
        const events: SyncEvent[] = existingEvents ? JSON.parse(existingEvents) : [];
        events.push(event);
        
        // Keep only last 100 events
        const recentEvents = events.slice(-100);
        localStorage.setItem('trinck-global-sync-events', JSON.stringify(recentEvents));
      }

      // Also notify local listeners immediately
      this.notifyListeners(type, event);

      console.log(`📡 Broadcasting ${type} locally:`, data);
    } catch (error) {
      console.error('Broadcast failed:', error);
    }
  }

  // Subscribe to specific event types
  subscribe(eventType: string, callback: (event: SyncEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(eventType: string, event: SyncEvent) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in sync listener:', error);
        }
      });
    }
  }

  // Get recent events of a specific type
  getRecentEvents(eventType: string, limit: number = 10): SyncEvent[] {
    return this.eventHistory
      .filter(event => event.type === eventType)
      .slice(-limit)
      .reverse();
  }

  // Clean up
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners.clear();
    this.eventHistory = [];
  }
}

export const realTimeSync = RealTimeSync.getInstance();

// Hook for using real-time sync in React components
export function useRealTimeSync(eventType: string, callback: (event: SyncEvent) => void) {
  if (typeof window !== 'undefined') {
    const unsubscribe = realTimeSync.subscribe(eventType, callback);
    return unsubscribe;
  }
  return () => {};
}
