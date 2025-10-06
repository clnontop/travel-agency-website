import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Change this to your actual server URL
// For testing on phone, use your computer's IP address instead of localhost
const API_BASE_URL = 'http://localhost:3000/api'; // For development
// const API_BASE_URL = 'http://192.168.1.100:3000/api'; // Replace with your IP
// const API_BASE_URL = 'https://your-domain.com/api'; // For production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('driverToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export class ApiService {
  // Update driver location
  static async updateLocation(locationData: {
    driverId: string;
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    accuracy: number;
    timestamp: string;
  }) {
    try {
      const response = await api.post('/driver/location', locationData);
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  // Update driver status (online/offline)
  static async updateDriverStatus(status: 'online' | 'offline' | 'busy') {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (!driverData) throw new Error('No driver data');
      
      const driver = JSON.parse(driverData);
      const response = await api.post('/driver/status', {
        driverId: driver.id,
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }

  // Get driver stats
  static async getDriverStats() {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (!driverData) return null;
      
      const driver = JSON.parse(driverData);
      const response = await api.get(`/driver/stats/${driver.id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }

  // Get active booking
  static async getActiveBooking() {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (!driverData) return null;
      
      const driver = JSON.parse(driverData);
      const response = await api.get(`/driver/booking/active/${driver.id}`);
      return response.data.booking;
    } catch (error) {
      console.error('Error getting active booking:', error);
      return null;
    }
  }

  // Accept booking
  static async acceptBooking(bookingId: string) {
    try {
      const response = await api.post(`/booking/accept/${bookingId}`);
      return response.data.success;
    } catch (error) {
      console.error('Error accepting booking:', error);
      return false;
    }
  }

  // Complete trip
  static async completeTrip(bookingId: string) {
    try {
      const response = await api.post(`/booking/complete/${bookingId}`);
      return response.data.success;
    } catch (error) {
      console.error('Error completing trip:', error);
      return false;
    }
  }

  // Get booking history
  static async getBookingHistory() {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (!driverData) return [];
      
      const driver = JSON.parse(driverData);
      const response = await api.get(`/driver/bookings/${driver.id}`);
      return response.data.bookings || [];
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  }

  // Get earnings
  static async getEarnings(period: 'today' | 'week' | 'month') {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (!driverData) return null;
      
      const driver = JSON.parse(driverData);
      const response = await api.get(`/driver/earnings/${driver.id}?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error getting earnings:', error);
      return null;
    }
  }

  // Update driver profile
  static async updateProfile(profileData: any) {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (!driverData) throw new Error('No driver data');
      
      const driver = JSON.parse(driverData);
      const response = await api.put(`/driver/profile/${driver.id}`, profileData);
      
      // Update local storage
      if (response.data.driver) {
        await AsyncStorage.setItem('driverData', JSON.stringify(response.data.driver));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}
