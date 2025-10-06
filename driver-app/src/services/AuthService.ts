import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Change this to your actual server URL
// For testing on phone, use your computer's IP address instead of localhost
const API_BASE_URL = 'http://192.168.1.6:3000/api'; // For development
// const API_BASE_URL = 'http://192.168.1.100:3000/api'; // Replace with your IP
// const API_BASE_URL = 'https://your-domain.com/api'; // For production

export class AuthService {
  static async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
        type: 'driver',
      });

      if (response.data.success && response.data.user) {
        // Store token and user data
        await AsyncStorage.setItem('driverToken', response.data.token);
        await AsyncStorage.setItem('driverData', JSON.stringify(response.data.user));
        
        console.log('Login successful:', response.data.user.name);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('driverToken');
      await AsyncStorage.removeItem('driverData');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  static async getDriverData(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem('driverData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }
}
