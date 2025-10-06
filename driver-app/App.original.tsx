import React, { useEffect, useState } from 'react';
// Temporarily comment out navigation imports to test
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import EarningsScreen from './src/screens/EarningsScreen';

// Services
import { LocationService } from './src/services/LocationService';
import { AuthService } from './src/services/AuthService';

const Stack = createStackNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    setupNotifications();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('driverToken');
      const driverData = await AsyncStorage.getItem('driverData');
      
      if (token && driverData) {
        setIsAuthenticated(true);
        // Start location tracking if authenticated
        LocationService.startLocationTracking();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b' }}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={isAuthenticated ? "Home" : "Login"}
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1e293b',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Driver Dashboard' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'My Profile' }}
          />
          <Stack.Screen 
            name="Bookings" 
            component={BookingsScreen}
            options={{ title: 'My Bookings' }}
          />
          <Stack.Screen 
            name="Earnings" 
            component={EarningsScreen}
            options={{ title: 'My Earnings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
