import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const CameraScannerScreen: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = () => {
    setIsScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'QR Scanner',
        'Camera QR scanning will be available when camera permissions are added to the app.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Camera QR Scanner</Text>
          
          <View style={styles.scannerArea}>
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.cameraText}>
                {isScanning ? 'Scanning...' : 'Camera View'}
              </Text>
              
              {/* Scan Frame */}
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
          </View>

          <Text style={styles.instruction}>
            Point your camera at a QR code to scan it
          </Text>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={startScanning}
            activeOpacity={0.8}
            disabled={isScanning}
          >
            <LinearGradient
              colors={isScanning ? ['#6b7280', '#4b5563'] : ['#dc2626', '#b91c1c']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isScanning ? 'Scanning...' : 'Start Camera Scanner'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📖 Note:</Text>
            <Text style={styles.infoText}>
              This is a demo version. Full camera functionality requires additional setup with Expo Camera and BarCode Scanner modules.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  scannerArea: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 300,
    marginBottom: 30,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  cameraText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  scanFrame: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#dc2626',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instruction: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  scanButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 30,
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
    borderRadius: 12,
    padding: 15,
    maxWidth: 300,
  },
  infoTitle: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default CameraScannerScreen;
