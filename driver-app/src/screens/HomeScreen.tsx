import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationService } from '../services/LocationService';
import { ApiService } from '../services/ApiService';

export default function HomeScreen({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(false);
  const [driverData, setDriverData] = useState<any>(null);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayTrips: 0,
    rating: 4.5,
    acceptanceRate: 85,
  });
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDriverData();
    loadStats();
    checkActiveBooking();
  }, []);

  const loadDriverData = async () => {
    try {
      const data = await AsyncStorage.getItem('driverData');
      if (data) {
        setDriverData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await ApiService.getDriverStats();
      if (stats) {
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const checkActiveBooking = async () => {
    try {
      const booking = await ApiService.getActiveBooking();
      setActiveBooking(booking);
    } catch (error) {
      console.error('Error checking active booking:', error);
    }
  };

  const toggleOnlineStatus = async (value: boolean) => {
    setIsOnline(value);
    
    if (value) {
      // Start sending location updates
      await LocationService.startLocationTracking();
      await ApiService.updateDriverStatus('online');
      Alert.alert('Online', 'You are now available for bookings');
    } else {
      // Stop sending location updates
      await LocationService.stopLocationTracking();
      await ApiService.updateDriverStatus('offline');
      Alert.alert('Offline', 'You are now offline');
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const success = await ApiService.acceptBooking(bookingId);
      if (success) {
        Alert.alert('Success', 'Booking accepted!');
        checkActiveBooking();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to accept booking');
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeBooking) return;
    
    try {
      const success = await ApiService.completeTrip(activeBooking.id);
      if (success) {
        Alert.alert('Success', 'Trip completed successfully!');
        setActiveBooking(null);
        loadStats();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete trip');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), checkActiveBooking()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await LocationService.stopLocationTracking();
            await AsyncStorage.clear();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#1e293b', '#334155', '#1e293b']}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ef4444"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Hello, {driverData?.name || 'Driver'}
            </Text>
            <Text style={styles.subGreeting}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.statusLabel}>Go {isOnline ? 'Offline' : 'Online'}</Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#475569', true: '#ef4444' }}
              thumbColor={isOnline ? '#fff' : '#94a3b8'}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats.todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.todayTrips}</Text>
            <Text style={styles.statLabel}>Trips Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>⭐ {stats.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.acceptanceRate}%</Text>
            <Text style={styles.statLabel}>Acceptance</Text>
          </View>
        </View>

        {/* Active Booking */}
        {activeBooking && (
          <View style={styles.activeBookingCard}>
            <Text style={styles.sectionTitle}>Active Booking</Text>
            <View style={styles.bookingDetails}>
              <Text style={styles.customerName}>{activeBooking.customerName}</Text>
              <Text style={styles.bookingInfo}>📍 From: {activeBooking.pickup}</Text>
              <Text style={styles.bookingInfo}>📍 To: {activeBooking.dropoff}</Text>
              <Text style={styles.bookingInfo}>💰 Fare: ₹{activeBooking.fare}</Text>
            </View>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteTrip}
            >
              <Text style={styles.completeButtonText}>Complete Trip</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Bookings')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Earnings')}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>Earnings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLogout}
          >
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={styles.actionText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Location Status */}
        <View style={styles.locationStatus}>
          <Text style={styles.locationStatusText}>
            {isOnline 
              ? '📍 Your location is being shared with customers'
              : '📍 Location sharing is disabled'}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
  },
  statusLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 5,
  },
  activeBookingCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  bookingDetails: {
    marginBottom: 15,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  bookingInfo: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 5,
  },
  completeButton: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: '#fff',
  },
  locationStatus: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  locationStatusText: {
    fontSize: 14,
    color: '#93c5fd',
    textAlign: 'center',
  },
});
