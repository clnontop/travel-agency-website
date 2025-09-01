import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GPSLocation, DriverLocation, GPSTrackingSession, GPSPermission } from '@/types/gps';

interface GPSState {
  // Driver locations
  driverLocations: DriverLocation[];
  
  // Active tracking sessions
  trackingSessions: GPSTrackingSession[];
  
  // GPS permissions
  gpsPermissions: GPSPermission[];
  
  // Actions
  updateDriverLocation: (driverId: string, location: GPSLocation, jobId?: string) => void;
  startTracking: (driverId: string, customerId: string, jobId: string) => string;
  stopTracking: (sessionId: string) => void;
  getDriverLocation: (driverId: string) => DriverLocation | null;
  getTrackingSession: (jobId: string) => GPSTrackingSession | null;
  canCustomerTrackDriver: (customerId: string, driverId: string, jobId: string) => boolean;
  setGPSPermission: (driverId: string, permission: Partial<GPSPermission>) => void;
  getGPSPermission: (driverId: string) => GPSPermission | null;
  cleanupExpiredSessions: () => void;
}

export const useGPS = create<GPSState>()(
  persist(
    (set, get) => ({
      driverLocations: [],
      trackingSessions: [],
      gpsPermissions: [],

      updateDriverLocation: (driverId: string, location: GPSLocation, jobId?: string) => {
        set((state) => {
          const existingIndex = state.driverLocations.findIndex(dl => dl.driverId === driverId);
          const newLocation: DriverLocation = {
            ...location,
            driverId,
            jobId,
            isActive: true,
            lastUpdate: new Date()
          };

          if (existingIndex >= 0) {
            const updated = [...state.driverLocations];
            updated[existingIndex] = newLocation;
            return { driverLocations: updated };
          } else {
            return { driverLocations: [...state.driverLocations, newLocation] };
          }
        });

        // Update tracking session if exists
        const session = get().getTrackingSession(jobId || '');
        if (session && session.isActive) {
          set((state) => ({
            trackingSessions: state.trackingSessions.map(ts =>
              ts.id === session.id
                ? { ...ts, locations: [...ts.locations, location] }
                : ts
            )
          }));
        }
      },

      startTracking: (driverId: string, customerId: string, jobId: string) => {
        const sessionId = `gps_${Date.now()}_${driverId}`;
        const newSession: GPSTrackingSession = {
          id: sessionId,
          driverId,
          customerId,
          jobId,
          startTime: new Date(),
          isActive: true,
          locations: [],
          privacySettings: {
            allowTracking: true,
            shareWithCustomer: true,
            trackingDuration: 'job_only'
          }
        };

        set((state) => ({
          trackingSessions: [...state.trackingSessions, newSession]
        }));

        return sessionId;
      },

      stopTracking: (sessionId: string) => {
        set((state) => ({
          trackingSessions: state.trackingSessions.map(session =>
            session.id === sessionId
              ? { ...session, isActive: false, endTime: new Date() }
              : session
          )
        }));

        // Remove driver location when tracking stops
        const session = get().trackingSessions.find(s => s.id === sessionId);
        if (session) {
          set((state) => ({
            driverLocations: state.driverLocations.filter(dl => 
              !(dl.driverId === session.driverId && dl.jobId === session.jobId)
            )
          }));
        }
      },

      getDriverLocation: (driverId: string) => {
        const { driverLocations } = get();
        return driverLocations.find(dl => dl.driverId === driverId && dl.isActive) || null;
      },

      getTrackingSession: (jobId: string) => {
        const { trackingSessions } = get();
        return trackingSessions.find(ts => ts.jobId === jobId && ts.isActive) || null;
      },

      canCustomerTrackDriver: (customerId: string, driverId: string, jobId: string) => {
        const { trackingSessions, gpsPermissions } = get();
        
        // Check if there's an active tracking session for this job
        const session = trackingSessions.find(ts => 
          ts.jobId === jobId && 
          ts.customerId === customerId && 
          ts.driverId === driverId && 
          ts.isActive
        );

        if (!session) return false;

        // Check GPS permissions
        const permission = gpsPermissions.find(gp => gp.driverId === driverId);
        if (!permission || !permission.hasAppInstalled || !permission.permissionGranted) {
          return false;
        }

        return session.privacySettings.shareWithCustomer;
      },

      setGPSPermission: (driverId: string, permission: Partial<GPSPermission>) => {
        set((state) => {
          const existingIndex = state.gpsPermissions.findIndex(gp => gp.driverId === driverId);
          const newPermission: GPSPermission = {
            driverId,
            hasAppInstalled: false,
            permissionGranted: false,
            lastPermissionCheck: new Date(),
            ...permission
          };

          if (existingIndex >= 0) {
            const updated = [...state.gpsPermissions];
            updated[existingIndex] = { ...updated[existingIndex], ...permission };
            return { gpsPermissions: updated };
          } else {
            return { gpsPermissions: [...state.gpsPermissions, newPermission] };
          }
        });
      },

      getGPSPermission: (driverId: string) => {
        const { gpsPermissions } = get();
        return gpsPermissions.find(gp => gp.driverId === driverId) || null;
      },

      cleanupExpiredSessions: () => {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        set((state) => ({
          trackingSessions: state.trackingSessions.filter(session => 
            session.isActive || (session.endTime && session.endTime > oneDayAgo)
          ),
          driverLocations: state.driverLocations.filter(location =>
            location.lastUpdate > oneDayAgo
          )
        }));
      }
    }),
    {
      name: 'gps-storage',
      partialize: (state) => ({
        gpsPermissions: state.gpsPermissions,
        trackingSessions: state.trackingSessions.filter(s => !s.isActive) // Only persist completed sessions
      })
    }
  )
);
