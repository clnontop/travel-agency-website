import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LocationTrackingScreen({ route, navigation }) {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [route_path, setRoutePath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [jobData, setJobData] = useState(route?.params?.job || null);
  
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    getCurrentLocation();
    return () => {
      stopTracking();
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = async () => {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Background Permission Required',
          'Please enable background location to track your route while the app is closed'
        );
      }

      setIsTracking(true);
      startTime.current = Date.now();
      setRoutePath([]);
      setDistance(0);
      setDuration(0);

      // Start location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          const newCoords = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          };

          setLocation(prev => ({
            ...prev,
            ...newCoords,
          }));

          setRoutePath(prev => {
            const newPath = [...prev, newCoords];
            
            // Calculate distance
            if (prev.length > 0) {
              const lastPoint = prev[prev.length - 1];
              const newDistance = calculateDistance(lastPoint, newCoords);
              setDistance(prevDistance => prevDistance + newDistance);
            }

            return newPath;
          });

          // Update duration
          if (startTime.current) {
            const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
            setDuration(elapsed);
          }

          // Send location to server if job is active
          if (jobData) {
            sendLocationUpdate(newCoords);
          }
        }
      );

      // Show notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Trink Driver - Tracking Active',
          body: 'Your location is being shared with customers',
          data: { tracking: true },
        },
        trigger: null,
      });

    } catch (error) {
      console.error('Tracking start error:', error);
      Alert.alert('Error', 'Failed to start tracking');
    }
  };

  const stopTracking = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    setIsTracking(false);
    startTime.current = null;

    // Cancel tracking notification
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const sendLocationUpdate = async (coords) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/driver/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: jobData?.driverId,
          jobId: jobData?.id,
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: Date.now(),
        }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Location update failed:', result.message);
      }
    } catch (error) {
      console.error('Location update error:', error);
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={location}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={isTracking}
        >
          {/* Current location marker */}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Your Location"
            description={isTracking ? "Tracking Active" : "Tracking Stopped"}
            pinColor={isTracking ? "#dc2626" : "#6b7280"}
          />

          {/* Route path */}
          {route_path.length > 1 && (
            <Polyline
              coordinates={route_path}
              strokeColor="#dc2626"
              strokeWidth={4}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      )}

      {/* Stats Overlay */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['rgba(31, 41, 55, 0.95)', 'rgba(55, 65, 81, 0.95)']}
          style={styles.statsGradient}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {distance > 0 && duration > 0 ? ((distance / (duration / 3600)).toFixed(1)) : '0'} km/h
              </Text>
              <Text style={styles.statLabel}>Avg Speed</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <LinearGradient
          colors={['rgba(31, 41, 55, 0.95)', 'rgba(55, 65, 81, 0.95)']}
          style={styles.controlGradient}
        >
          <View style={styles.trackingToggle}>
            <Text style={styles.trackingLabel}>
              {isTracking ? 'Live Tracking Active' : 'Start Live Tracking'}
            </Text>
            <Switch
              value={isTracking}
              onValueChange={isTracking ? stopTracking : startTracking}
              trackColor={{ false: '#374151', true: '#dc2626' }}
              thumbColor={isTracking ? '#fff' : '#9ca3af'}
            />
          </View>

          {jobData && (
            <View style={styles.jobInfo}>
              <Text style={styles.jobTitle}>Active Job</Text>
              <Text style={styles.jobDetails}>
                {jobData.pickup} → {jobData.delivery}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.centerButton]}
              onPress={getCurrentLocation}
            >
              <Text style={styles.buttonText}>📍 Center Map</Text>
            </TouchableOpacity>

            {isTracking && (
              <TouchableOpacity
                style={[styles.button, styles.emergencyButton]}
                onPress={() => {
                  Alert.alert(
                    'Emergency',
                    'Contact emergency services?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Call 112', onPress: () => console.log('Emergency call') }
                    ]
                  );
                }}
              >
                <Text style={styles.buttonText}>🚨 Emergency</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  statsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  statsGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  controlPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  controlGradient: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  trackingToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  jobInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  jobDetails: {
    fontSize: 14,
    color: '#d1d5db',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  centerButton: {
    backgroundColor: '#1f2937',
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
