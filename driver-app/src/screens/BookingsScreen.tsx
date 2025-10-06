import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiService } from '../services/ApiService';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await ApiService.getBookingHistory();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'active') return booking.status === 'active';
    return true;
  });

  return (
    <LinearGradient
      colors={['#1e293b', '#334155', '#1e293b']}
      style={styles.container}
    >
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

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
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        ) : (
          filteredBookings.map((booking, index) => (
            <View key={index} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingId}>#{booking.id?.slice(-6) || '000000'}</Text>
                <Text style={[
                  styles.status,
                  booking.status === 'completed' ? styles.completedStatus : styles.activeStatus
                ]}>
                  {booking.status || 'pending'}
                </Text>
              </View>
              <Text style={styles.customerName}>{booking.customerName || 'Customer'}</Text>
              <Text style={styles.route}>📍 {booking.pickup || 'Pickup location'}</Text>
              <Text style={styles.route}>📍 {booking.dropoff || 'Drop location'}</Text>
              <View style={styles.bookingFooter}>
                <Text style={styles.fare}>₹{booking.fare || 0}</Text>
                <Text style={styles.date}>{booking.date || 'Today'}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilter: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#fff',
  },
  scrollContent: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bookingId: {
    color: '#94a3b8',
    fontSize: 12,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedStatus: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
  },
  activeStatus: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    color: '#fbbf24',
  },
  customerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  route: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 5,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  fare: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    color: '#94a3b8',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});
