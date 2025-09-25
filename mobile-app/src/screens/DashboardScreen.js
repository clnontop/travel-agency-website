import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ driverData, onLogout, navigation }) {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [todayStats, setTodayStats] = useState({
    jobs: 0,
    earnings: 0,
    distance: 0,
    hours: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    getCurrentLocation();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch driver stats and recent jobs
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/driver/dashboard/${driverData.id}`);
      const data = await response.json();
      
      if (data.success) {
        setTodayStats(data.stats || todayStats);
        setRecentJobs(data.recentJobs || []);
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);

      // Update server
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/driver/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: driverData.id,
          isOnline: newStatus,
          location: currentLocation
        })
      });

      const result = await response.json();
      if (!result.success) {
        setIsOnline(!newStatus); // Revert on error
        Alert.alert('Error', 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      setIsOnline(!isOnline); // Revert on error
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    await getCurrentLocation();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: onLogout, style: 'destructive' }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#1f2937', '#374151', '#1f2937']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.driverName}>{driverData?.name || 'Driver'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Online Status Toggle */}
        <View style={styles.statusCard}>
          <LinearGradient
            colors={isOnline ? ['#059669', '#047857'] : ['#6b7280', '#4b5563']}
            style={styles.statusGradient}
          >
            <View style={styles.statusContent}>
              <View>
                <Text style={styles.statusTitle}>
                  {isOnline ? 'You are Online' : 'You are Offline'}
                </Text>
                <Text style={styles.statusSubtitle}>
                  {isOnline ? 'Ready to receive jobs' : 'Tap to go online'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.statusToggle}
                onPress={toggleOnlineStatus}
              >
                <View style={[
                  styles.toggleCircle,
                  { backgroundColor: isOnline ? '#fff' : '#9ca3af' }
                ]} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayStats.jobs}</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹{todayStats.earnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayStats.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{todayStats.hours}h</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('LocationTracking')}
            >
              <LinearGradient
                colors={['#dc2626', '#b91c1c']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📍</Text>
                <Text style={styles.actionText}>Start Tracking</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Jobs')}
            >
              <LinearGradient
                colors={['#059669', '#047857']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionText}>View Jobs</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('QRScanner')}
            >
              <LinearGradient
                colors={['#7c3aed', '#6d28d9']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📱</Text>
                <Text style={styles.actionText}>Scan QR</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => Alert.alert('Support', 'Contact support at +91-XXXXXXXXXX')}
            >
              <LinearGradient
                colors={['#ea580c', '#c2410c']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📞</Text>
                <Text style={styles.actionText}>Support</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Jobs */}
        <View style={styles.jobsContainer}>
          <Text style={styles.sectionTitle}>Recent Jobs</Text>
          {recentJobs.length > 0 ? (
            recentJobs.map((job, index) => (
              <View key={index} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobId}>#{job.id}</Text>
                  <Text style={[
                    styles.jobStatus,
                    { color: job.status === 'completed' ? '#10b981' : '#f59e0b' }
                  ]}>
                    {job.status}
                  </Text>
                </View>
                <Text style={styles.jobRoute}>
                  {job.pickup} → {job.delivery}
                </Text>
                <View style={styles.jobFooter}>
                  <Text style={styles.jobEarning}>₹{job.earning}</Text>
                  <Text style={styles.jobDate}>{job.date}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recent jobs</Text>
              <Text style={styles.emptySubtext}>
                Go online to start receiving job requests
              </Text>
            </View>
          )}
        </View>

        {/* Driver Info */}
        <View style={styles.driverInfo}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle:</Text>
              <Text style={styles.infoValue}>{driverData?.vehicle || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License:</Text>
              <Text style={styles.infoValue}>{driverData?.license || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rating:</Text>
              <Text style={styles.infoValue}>
                ⭐ {driverData?.rating || '4.5'} ({driverData?.totalRides || '0'} rides)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    marginBottom: 24,
  },
  statusGradient: {
    borderRadius: 12,
    padding: 20,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statusToggle: {
    width: 60,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    marginBottom: 12,
  },
  actionGradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  jobsContainer: {
    marginBottom: 24,
  },
  jobCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  jobStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  jobRoute: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobEarning: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  jobDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  driverInfo: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});
