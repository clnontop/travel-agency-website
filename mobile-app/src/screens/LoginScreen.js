import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function LoginScreen({ onLogin, navigation }) {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleQRCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setIsLoading(true);

    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'driver_auth' && qrData.sessionToken) {
        // Validate with server
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/driver/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${qrData.sessionToken}`
          },
          body: JSON.stringify({
            driverId: qrData.driverId,
            deviceInfo: Platform.OS
          })
        });

        const result = await response.json();

        if (result.success) {
          await onLogin(result.driver, qrData.sessionToken);
          Alert.alert('Success', 'Login successful!');
        } else {
          Alert.alert('Error', result.message || 'Invalid QR code');
        }
      } else {
        Alert.alert('Error', 'Invalid QR code format');
      }
    } catch (error) {
      console.error('QR Login error:', error);
      Alert.alert('Error', 'Failed to process QR code');
    } finally {
      setIsLoading(false);
      setShowQRScanner(false);
      setScanned(false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    if (status === 'granted') {
      setShowQRScanner(true);
    } else {
      Alert.alert('Permission Required', 'Camera permission is required to scan QR codes');
    }
  };

  if (showQRScanner) {
    return (
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleQRCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerText}>
            Scan the QR code from your driver dashboard
          </Text>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowQRScanner(false);
              setScanned(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Authenticating...</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1f2937', '#374151', '#1f2937']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🚛</Text>
            </View>
            <Text style={styles.appName}>Trink Driver</Text>
            <Text style={styles.tagline}>Professional Trucking Solutions</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>
              Scan your QR code to get started with live tracking
            </Text>

            <TouchableOpacity
              style={styles.qrButton}
              onPress={requestCameraPermission}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#dc2626', '#b91c1c']}
                style={styles.qrButtonGradient}
              >
                <Text style={styles.qrButtonIcon}>📱</Text>
                <Text style={styles.qrButtonText}>Scan QR Code</Text>
                <Text style={styles.qrButtonSubtext}>
                  Get your QR code from the driver dashboard
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>How to get started:</Text>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1</Text>
                <Text style={styles.instructionText}>
                  Login to your driver account on the website
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2</Text>
                <Text style={styles.instructionText}>
                  Go to your profile and generate a QR code
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3</Text>
                <Text style={styles.instructionText}>
                  Scan the QR code with this app
                </Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#dc2626',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#9ca3af',
  },
  formContainer: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  qrButton: {
    marginBottom: 32,
  },
  qrButtonGradient: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  qrButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  qrButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  qrButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  instructionsContainer: {
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#d1d5db',
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#dc2626',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
});
