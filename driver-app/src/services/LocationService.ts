import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './ApiService';

const LOCATION_TASK_NAME = 'TRINCK_DRIVER_LOCATION_TRACKING';
const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds

export class LocationService {
  static isTracking = false;

  static async startLocationTracking() {
    try {
      // Request permissions
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }

      // Request background permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('Background location permission denied');
      }

      // Check if task is already registered
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      // Start location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: 10, // Update every 10 meters
        foregroundService: {
          notificationTitle: 'Trinck Driver',
          notificationBody: 'Location tracking is active',
          notificationColor: '#ef4444',
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      this.isTracking = true;
      console.log('Location tracking started');
      
      // Send initial location
      await this.sendCurrentLocation();
      
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  static async stopLocationTracking() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      
      this.isTracking = false;
      console.log('Location tracking stopped');
      
      // Notify server that driver is offline
      await ApiService.updateDriverStatus('offline');
      
      return true;
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      return false;
    }
  }

  static async sendCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const driverData = await AsyncStorage.getItem('driverData');
      if (!driverData) return;

      const driver = JSON.parse(driverData);
      
      // Send location to server
      await ApiService.updateLocation({
        driverId: driver.id,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading || 0,
        speed: location.coords.speed || 0,
        accuracy: location.coords.accuracy || 0,
        timestamp: new Date().toISOString(),
      });

      console.log('Location sent:', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error sending location:', error);
    }
  }

  static async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }
}

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];
    
    if (location) {
      try {
        const driverData = await AsyncStorage.getItem('driverData');
        if (!driverData) return;

        const driver = JSON.parse(driverData);
        
        // Send location update to server
        await ApiService.updateLocation({
          driverId: driver.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          heading: location.coords.heading || 0,
          speed: location.coords.speed || 0,
          accuracy: location.coords.accuracy || 0,
          timestamp: new Date().toISOString(),
        });

        console.log('Background location update sent');
      } catch (error) {
        console.error('Error sending background location:', error);
      }
    }
  }
});
