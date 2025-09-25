import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import QRGeneratorScreen from './src/screens/QRGeneratorScreen';
import CameraScannerScreen from './src/screens/CameraScannerScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="light" backgroundColor="#dc2626" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#dc2626',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
              },
              headerTitleAlign: 'center',
              cardStyle: {
                backgroundColor: '#0f172a',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                title: 'Trinck QR Manager',
                headerShown: true,
              }}
            />
            <Stack.Screen 
              name="QRGenerator" 
              component={QRGeneratorScreen}
              options={{
                title: 'Generate QR Code',
              }}
            />
            <Stack.Screen 
              name="CameraScanner" 
              component={CameraScannerScreen}
              options={{
                title: 'Camera Scanner',
              }}
            />
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});
