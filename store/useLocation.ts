import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  driverId: string;
}

export interface LocationState {
  driverLocations: Map<string, LocationData>;
  isTracking: boolean;
  lastUpdate: Date | null;
  
  // Actions
  updateDriverLocation: (driverId: string, location: Omit<LocationData, 'driverId'>) => void;
  startTracking: () => void;
  stopTracking: () => void;
  getDriverLocation: (driverId: string) => LocationData | null;
  getNearbyDrivers: (userLat: number, userLng: number, radiusKm?: number) => LocationData[];
}

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const useLocation = create<LocationState>()(
  persist(
    (set, get) => ({
      driverLocations: new Map(),
      isTracking: false,
      lastUpdate: null,

      updateDriverLocation: (driverId: string, location: Omit<LocationData, 'driverId'>) => {
        const locationData: LocationData = {
          ...location,
          driverId,
          timestamp: new Date()
        };
        
        set((state) => {
          const newLocations = new Map(state.driverLocations);
          newLocations.set(driverId, locationData);
          
          // Broadcast to other tabs
          if (typeof window !== 'undefined') {
            localStorage.setItem('location_broadcast', JSON.stringify({
              type: 'LOCATION_UPDATE',
              driverId,
              location: locationData,
              timestamp: Date.now()
            }));
          }
          
          return {
            driverLocations: newLocations,
            lastUpdate: new Date()
          };
        });
      },

      startTracking: () => {
        set({ isTracking: true });
        
        // Attach a single storage listener if not already present
        if (typeof window !== 'undefined' && !(window as any)._trinck_location_listener_attached) {
          const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'location_broadcast' && e.newValue) {
              try {
                const data = JSON.parse(e.newValue);
                if (data && data.type === 'LOCATION_UPDATE') {
                  const { updateDriverLocation } = get();
                  // defensive guards
                  if (data.driverId && data.location) {
                    updateDriverLocation(data.driverId, data.location);
                  }
                }
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error parsing location broadcast:', error);
              }
            }
          };
          
          window.addEventListener('storage', handleStorageChange);
          (window as any)._trinck_location_listener_attached = true;
        }
      },

      stopTracking: () => {
        set({ isTracking: false });
      },

      getDriverLocation: (driverId: string) => {
        const locations = get().driverLocations;
        return locations.get(driverId) || null;
      },

      getNearbyDrivers: (userLat: number, userLng: number, radiusKm: number = 10) => {
        const locations = get().driverLocations;
        const nearbyDrivers: LocationData[] = [];
        
        locations.forEach((location) => {
          const distance = calculateDistance(userLat, userLng, location.latitude, location.longitude);
          if (distance <= radiusKm) {
            nearbyDrivers.push(location);
          }
        });
        
        // Sort by distance
        return nearbyDrivers.sort((a, b) => {
          const distanceA = calculateDistance(userLat, userLng, a.latitude, a.longitude);
          const distanceB = calculateDistance(userLat, userLng, b.latitude, b.longitude);
          return distanceA - distanceB;
        });
      }
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        driverLocations: Array.from(state.driverLocations.entries()),
        lastUpdate: state.lastUpdate
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.driverLocations)) {
          state.driverLocations = new Map(state.driverLocations as [string, LocationData][]);
        }
      }
    }
  )
);
