import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { LinearGradient } from 'expo-linear-gradient';

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setIsProcessing(true);

    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'job_qr' && qrData.jobId) {
        // Job-related QR code
        Alert.alert(
          'Job QR Code Detected',
          `Job ID: ${qrData.jobId}\nAction: ${qrData.action || 'Unknown'}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Process',
              onPress: () => processJobQR(qrData)
            }
          ]
        );
      } else if (qrData.type === 'location_qr') {
        // Location-based QR code
        Alert.alert(
          'Location QR Code',
          `Location: ${qrData.location}\nCoordinates: ${qrData.lat}, ${qrData.lng}`,
          [
            { text: 'OK', onPress: () => resetScanner() }
          ]
        );
      } else if (qrData.type === 'customer_verification') {
        // Customer verification QR
        Alert.alert(
          'Customer Verification',
          `Customer: ${qrData.customerName}\nPhone: ${qrData.phone}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Verify',
              onPress: () => verifyCustomer(qrData)
            }
          ]
        );
      } else {
        // Generic QR code
        Alert.alert(
          'QR Code Scanned',
          `Type: ${qrData.type || 'Unknown'}\nData: ${JSON.stringify(qrData, null, 2)}`,
          [
            { text: 'OK', onPress: () => resetScanner() }
          ]
        );
      }
    } catch (error) {
      // Not a JSON QR code, treat as plain text
      Alert.alert(
        'QR Code Content',
        data,
        [
          { text: 'OK', onPress: () => resetScanner() }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processJobQR = async (qrData) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/driver/qr/job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: qrData.jobId,
          action: qrData.action,
          driverId: 'current_driver_id',
          timestamp: Date.now()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Success', result.message || 'Job QR processed successfully');
        
        // Navigate based on action
        if (qrData.action === 'pickup_complete') {
          navigation.navigate('LocationTracking', { job: result.job });
        } else if (qrData.action === 'delivery_complete') {
          navigation.navigate('Dashboard');
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to process job QR');
      }
    } catch (error) {
      console.error('Job QR processing error:', error);
      Alert.alert('Error', 'Failed to process job QR code');
    } finally {
      resetScanner();
    }
  };

  const verifyCustomer = async (qrData) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/driver/verify-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: qrData.customerId,
          customerName: qrData.customerName,
          phone: qrData.phone,
          driverId: 'current_driver_id'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        Alert.alert('Verified', 'Customer identity verified successfully');
      } else {
        Alert.alert('Verification Failed', result.message || 'Could not verify customer');
      }
    } catch (error) {
      console.error('Customer verification error:', error);
      Alert.alert('Error', 'Failed to verify customer');
    } finally {
      resetScanner();
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setIsProcessing(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <LinearGradient
        colors={['#1f2937', '#374151', '#1f2937']}
        style={styles.permissionContainer}
      >
        <Text style={styles.permissionDeniedText}>Camera permission denied</Text>
        <Text style={styles.permissionSubtext}>
          Please enable camera access in your device settings to scan QR codes
        </Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.settingsButtonText}>Go Back</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top section */}
        <View style={styles.topSection}>
          <Text style={styles.instructionText}>
            Position the QR code within the frame
          </Text>
        </View>

        {/* Scanner frame */}
        <View style={styles.scannerFrame}>
          <View style={styles.frameCorner} />
          <View style={[styles.frameCorner, styles.topRight]} />
          <View style={[styles.frameCorner, styles.bottomLeft]} />
          <View style={[styles.frameCorner, styles.bottomRight]} />
          
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <Text style={styles.supportedText}>
            Supported QR codes: Job actions, Customer verification, Location check-ins
          </Text>
          
          <View style={styles.buttonContainer}>
            {scanned && (
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={resetScanner}
              >
                <LinearGradient
                  colors={['#dc2626', '#b91c1c']}
                  style={styles.rescanGradient}
                >
                  <Text style={styles.rescanButtonText}>Scan Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  permissionDeniedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionSubtext: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  settingsButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#dc2626',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    left: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  supportedText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  rescanButton: {
    width: '80%',
    marginBottom: 12,
  },
  rescanGradient: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
