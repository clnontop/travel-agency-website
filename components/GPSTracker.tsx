'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, Shield, Download, AlertCircle } from 'lucide-react';
import { useGPS } from '@/store/useGPS';
import { useAuth } from '@/store/useAuth';
import { formatINR } from '@/utils/currency';

interface GPSTrackerProps {
  jobId: string;
  driverId: string;
  customerId: string;
  isActive?: boolean;
}

export default function GPSTracker({ jobId, driverId, customerId, isActive = false }: GPSTrackerProps) {
  const { user } = useAuth();
  const { 
    getDriverLocation, 
    getTrackingSession, 
    canCustomerTrackDriver, 
    getGPSPermission,
    setGPSPermission,
    startTracking,
    stopTracking 
  } = useGPS();

  const [trackingEnabled, setTrackingEnabled] = useState(false);
  let driverLocation = null;
  let trackingSession = null;
  let canTrack = false;
  let gpsPermission = null;

  try {
    driverLocation = getDriverLocation ? getDriverLocation(driverId) : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error getting driver location:', err);
  }

  try {
    trackingSession = getTrackingSession ? getTrackingSession(jobId) : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error getting tracking session:', err);
  }

  try {
    canTrack = canCustomerTrackDriver ? canCustomerTrackDriver(customerId, driverId, jobId) : false;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error checking track permission:', err);
  }

  try {
    gpsPermission = getGPSPermission ? getGPSPermission(driverId) : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error getting GPS permission:', err);
  }

  useEffect(() => {
    if (isActive && !trackingSession && user?.type === 'driver' && user.id === driverId) {
      // Auto-start tracking for active jobs
      const sessionId = startTracking(driverId, customerId, jobId);
      setTrackingEnabled(true);
    }
  }, [isActive, trackingSession, user, driverId, customerId, jobId, startTracking]);

  const handleDownloadApp = () => {
    // Simulate app download
    setGPSPermission(driverId, {
      hasAppInstalled: true,
      permissionGranted: true,
      lastPermissionCheck: new Date(),
      appVersion: '1.0.0'
    });
  };

  const toggleTracking = () => {
    if (trackingSession?.isActive) {
      stopTracking(trackingSession.id);
      setTrackingEnabled(false);
    } else {
      startTracking(driverId, customerId, jobId);
      setTrackingEnabled(true);
    }
  };

  // Driver view - GPS controls
  if (user?.type === 'driver' && user.id === driverId) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
        <div className="flex items-center space-x-3 mb-4">
          <Navigation className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">GPS Tracking</h3>
        </div>

        {!gpsPermission?.hasAppInstalled ? (
          <div className="text-center py-6">
            <Download className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Download Trinck Driver App</h4>
            <p className="text-gray-600 mb-4">
              To enable GPS tracking for customers, you need to download our mobile app.
            </p>
            <button
              onClick={handleDownloadApp}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download App
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">App Installed</p>
                  <p className="text-sm text-green-700">GPS tracking is available</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${trackingSession?.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>

            {isActive && (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-medium text-blue-900">Job Tracking</p>
                  <p className="text-sm text-blue-700">
                    {trackingSession?.isActive ? 'Customer can see your location' : 'Tracking disabled'}
                  </p>
                </div>
                <button
                  onClick={toggleTracking}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    trackingSession?.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {trackingSession?.isActive ? 'Stop Tracking' : 'Start Tracking'}
                </button>
              </div>
            )}

            <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
              <p className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Your location is only shared with customers who hired you for active jobs.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Customer view - Track driver
  if (user?.type === 'customer' && user.id === customerId) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-gray-900">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Driver Location</h3>
        </div>

        {!canTrack ? (
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Location Not Available</h4>
            <p className="text-gray-600 mb-4">
              {!gpsPermission?.hasAppInstalled 
                ? 'Driver needs to download the Trinck app to enable GPS tracking.'
                : 'Driver has not enabled location sharing for this job.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {driverLocation && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-green-900">Live Location</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-green-700">Live</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <p>Lat: {driverLocation.latitude.toFixed(6)}</p>
                  <p>Lng: {driverLocation.longitude.toFixed(6)}</p>
                  <p className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated: {new Date(driverLocation.lastUpdate).toLocaleTimeString()}</span>
                  </p>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-900 mb-2">Tracking Session</p>
              <div className="space-y-1 text-sm text-blue-700">
                <p>Started: {trackingSession?.startTime ? new Date(trackingSession.startTime).toLocaleString() : 'Not started'}</p>
                <p>Status: {trackingSession?.isActive ? 'Active' : 'Inactive'}</p>
                <p>Updates: {trackingSession?.locations.length || 0} location points</p>
              </div>
            </div>

            <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
              <p className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Location tracking automatically stops when the job is completed.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
