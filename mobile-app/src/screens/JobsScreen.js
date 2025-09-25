import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function JobsScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('available'); // available, accepted, completed

  useEffect(() => {
    loadJobs();
  }, [filter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/driver/jobs?status=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        // Mock data for demo
        setJobs([
          {
            id: 'JOB001',
            pickup: 'Mumbai Central',
            delivery: 'Pune Station',
            distance: '148 km',
            payment: 2500,
            customerName: 'Rajesh Kumar',
            customerPhone: '+91-9876543210',
            pickupTime: '2024-01-15 10:00 AM',
            deliveryTime: '2024-01-15 2:00 PM',
            cargoType: 'Electronics',
            weight: '500 kg',
            status: 'available',
            priority: 'high'
          },
          {
            id: 'JOB002',
            pickup: 'Delhi Airport',
            delivery: 'Gurgaon Cyber City',
            distance: '32 km',
            payment: 800,
            customerName: 'Priya Sharma',
            customerPhone: '+91-9876543211',
            pickupTime: '2024-01-15 3:00 PM',
            deliveryTime: '2024-01-15 5:00 PM',
            cargoType: 'Documents',
            weight: '5 kg',
            status: 'available',
            priority: 'medium'
          },
          {
            id: 'JOB003',
            pickup: 'Bangalore Tech Park',
            delivery: 'Chennai Port',
            distance: '346 km',
            payment: 4200,
            customerName: 'Amit Patel',
            customerPhone: '+91-9876543212',
            pickupTime: '2024-01-16 6:00 AM',
            deliveryTime: '2024-01-16 6:00 PM',
            cargoType: 'Machinery',
            weight: '1200 kg',
            status: 'available',
            priority: 'high'
          }
        ]);
      }
    } catch (error) {
      console.error('Jobs loading error:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const acceptJob = async (jobId) => {
    Alert.alert(
      'Accept Job',
      'Are you sure you want to accept this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/driver/jobs/${jobId}/accept`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ driverId: 'current_driver_id' })
              });

              const result = await response.json();
              if (result.success) {
                Alert.alert('Success', 'Job accepted successfully!');
                navigation.navigate('LocationTracking', { job: jobs.find(j => j.id === jobId) });
              } else {
                Alert.alert('Error', result.message || 'Failed to accept job');
              }
            } catch (error) {
              console.error('Accept job error:', error);
              Alert.alert('Error', 'Failed to accept job');
            }
          }
        }
      ]
    );
  };

  const renderJob = ({ item }) => (
    <View style={styles.jobCard}>
      <LinearGradient
        colors={['rgba(55, 65, 81, 0.9)', 'rgba(75, 85, 99, 0.9)']}
        style={styles.jobGradient}
      >
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View>
            <Text style={styles.jobId}>#{item.id}</Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: item.priority === 'high' ? '#dc2626' : '#f59e0b' }
            ]}>
              <Text style={styles.priorityText}>{item.priority} priority</Text>
            </View>
          </View>
          <View style={styles.paymentContainer}>
            <Text style={styles.paymentAmount}>₹{item.payment}</Text>
            <Text style={styles.paymentLabel}>Payment</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.routeText}>{item.pickup}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: '#dc2626' }]} />
            <Text style={styles.routeText}>{item.delivery}</Text>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Distance:</Text>
            <Text style={styles.detailValue}>{item.distance}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cargo:</Text>
            <Text style={styles.detailValue}>{item.cargoType} ({item.weight})</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup:</Text>
            <Text style={styles.detailValue}>{item.pickupTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Customer:</Text>
            <Text style={styles.detailValue}>{item.customerName}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Alert.alert('Contact', `Call ${item.customerPhone}?`)}
          >
            <Text style={styles.contactButtonText}>📞 Contact</Text>
          </TouchableOpacity>
          
          {item.status === 'available' && (
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => acceptJob(item.id)}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.acceptGradient}
              >
                <Text style={styles.acceptButtonText}>Accept Job</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderFilterButton = (filterType, label) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1f2937', '#374151', '#1f2937']}
      style={styles.container}
    >
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {renderFilterButton('available', 'Available')}
        {renderFilterButton('accepted', 'Accepted')}
        {renderFilterButton('completed', 'Completed')}
      </View>

      {/* Jobs List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No jobs available</Text>
              <Text style={styles.emptySubtext}>
                Pull down to refresh or check back later
              </Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(75, 85, 99, 0.5)',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#dc2626',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  listContainer: {
    padding: 20,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  jobId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  paymentContainer: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  routeContainer: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#6b7280',
    marginLeft: 3,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    marginLeft: 8,
  },
  acceptGradient: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
