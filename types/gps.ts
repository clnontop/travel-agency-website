export interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface DriverLocation extends GPSLocation {
  driverId: string;
  jobId?: string;
  isActive: boolean;
  lastUpdate: Date;
}

export interface GPSTrackingSession {
  id: string;
  driverId: string;
  customerId: string;
  jobId: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  locations: GPSLocation[];
  privacySettings: {
    allowTracking: boolean;
    shareWithCustomer: boolean;
    trackingDuration: 'job_only' | 'extended';
  };
}

export interface GPSPermission {
  driverId: string;
  hasAppInstalled: boolean;
  permissionGranted: boolean;
  lastPermissionCheck: Date;
  appVersion?: string;
}
