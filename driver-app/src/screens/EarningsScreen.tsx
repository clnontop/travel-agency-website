import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiService } from '../services/ApiService';

export default function EarningsScreen() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [earnings, setEarnings] = useState<any>({
    total: 0,
    trips: 0,
    average: 0,
    breakdown: [],
  });

  useEffect(() => {
    loadEarnings();
  }, [period]);

  const loadEarnings = async () => {
    try {
      const data = await ApiService.getEarnings(period);
      if (data) {
        setEarnings(data);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#1e293b', '#334155', '#1e293b']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, period === 'today' && styles.activePeriod]}
            onPress={() => setPeriod('today')}
          >
            <Text style={[styles.periodText, period === 'today' && styles.activePeriodText]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'week' && styles.activePeriod]}
            onPress={() => setPeriod('week')}
          >
            <Text style={[styles.periodText, period === 'week' && styles.activePeriodText]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, period === 'month' && styles.activePeriod]}
            onPress={() => setPeriod('month')}
          >
            <Text style={[styles.periodText, period === 'month' && styles.activePeriodText]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>₹{earnings.total || 0}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{earnings.trips || 0}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{earnings.average || 0}</Text>
              <Text style={styles.statLabel}>Avg/Trip</Text>
            </View>
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          
          {earnings.breakdown && earnings.breakdown.length > 0 ? (
            earnings.breakdown.map((item: any, index: number) => (
              <View key={index} style={styles.breakdownItem}>
                <View>
                  <Text style={styles.breakdownDate}>{item.date}</Text>
                  <Text style={styles.breakdownTrips}>{item.trips} trips</Text>
                </View>
                <Text style={styles.breakdownAmount}>₹{item.amount}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>No earnings for this period</Text>
            </View>
          )}
        </View>

        {/* Wallet Balance */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletAmount}>₹{earnings.walletBalance || 0}</Text>
          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
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
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activePeriod: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  periodText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activePeriodText: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  totalLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 10,
  },
  totalAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  breakdownSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  breakdownDate: {
    color: '#fff',
    fontSize: 14,
  },
  breakdownTrips: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  breakdownAmount: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  walletCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  walletLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 10,
  },
  walletAmount: {
    color: '#10b981',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
