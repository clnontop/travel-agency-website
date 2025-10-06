import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../services/ApiService';

export default function ProfileScreen({ navigation }: any) {
  const [driverData, setDriverData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
  });

  useEffect(() => {
    loadDriverData();
  }, []);

  const loadDriverData = async () => {
    try {
      const data = await AsyncStorage.getItem('driverData');
      if (data) {
        const driver = JSON.parse(data);
        setDriverData(driver);
        setEditData({
          name: driver.name || '',
          phone: driver.phone || '',
          vehicleType: driver.vehicleType || '',
          vehicleNumber: driver.vehicleNumber || '',
        });
      }
    } catch (error) {
      console.error('Error loading driver data:', error);
    }
  };

  const handleSave = async () => {
    try {
      const result = await ApiService.updateProfile(editData);
      if (result) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
        loadDriverData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <LinearGradient
      colors={['#1e293b', '#334155', '#1e293b']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          
          <Text style={styles.name}>{driverData?.name || 'Driver'}</Text>
          <Text style={styles.email}>{driverData?.email}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {driverData?.rating || '4.5'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{driverData?.completedTrips || '0'}</Text>
              <Text style={styles.statLabel}>Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{driverData?.walletBalance || '0'}</Text>
              <Text style={styles.statLabel}>Balance</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <Text style={styles.infoValue}>{driverData?.name}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.phone}
                onChangeText={(text) => setEditData({ ...editData, phone: text })}
                keyboardType="phone-pad"
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <Text style={styles.infoValue}>{driverData?.phone || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle Type</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.vehicleType}
                onChangeText={(text) => setEditData({ ...editData, vehicleType: text })}
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <Text style={styles.infoValue}>{driverData?.vehicleType || 'Not specified'}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.vehicleNumber}
                onChangeText={(text) => setEditData({ ...editData, vehicleNumber: text })}
                placeholderTextColor="#94a3b8"
              />
            ) : (
              <Text style={styles.infoValue}>{driverData?.vehicleNumber || 'Not specified'}</Text>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.kycButton}
          onPress={() => Alert.alert('KYC', 'KYC verification coming soon')}
        >
          <Text style={styles.kycButtonText}>🔒 Complete KYC Verification</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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
    color: '#94a3b8',
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  editButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  kycButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  kycButtonText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
