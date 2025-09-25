import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import LocationTrackingScreen from './src/screens/LocationTrackingScreen';
import JobsScreen from './src/screens/JobsScreen';

const Stack = createStackNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [driverData, setDriverData] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    requestPermissions();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('driverToken');
      const driver = await SecureStore.getItemAsync('driverData');
      
      if (token && driver) {
        setIsAuthenticated(true);
        setDriverData(JSON.parse(driver));
      }
    } catch (error) {
      console.log('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    // Request location permissions
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      console.log('Background location permission:', backgroundStatus);
    }

    // Request notification permissions
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    console.log('Notification permission:', notificationStatus);
  };

  const handleLogin = async (driverInfo, token) => {
    try {
      await SecureStore.setItemAsync('driverToken', token);
      await SecureStore.setItemAsync('driverData', JSON.stringify(driverInfo));
      setDriverData(driverInfo);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login storage error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('driverToken');
      await SecureStore.deleteItemAsync('driverData');
      setDriverData(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return null; // Or loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1f2937" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1f2937',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Login" 
            options={{ headerShown: false }}
          >
            {props => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen 
              name="Dashboard" 
              options={{ 
                title: 'Trink Driver',
                headerRight: () => null
              }}
            >
              {props => (
                <DashboardScreen 
                  {...props} 
                  driverData={driverData} 
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>
            <Stack.Screen 
              name="QRScanner" 
              component={QRScannerScreen}
              options={{ title: 'Scan QR Code' }}
            />
            <Stack.Screen 
              name="LocationTracking" 
              component={LocationTrackingScreen}
              options={{ title: 'Live Tracking' }}
            />
            <Stack.Screen 
              name="Jobs" 
              component={JobsScreen}
              options={{ title: 'Available Jobs' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
