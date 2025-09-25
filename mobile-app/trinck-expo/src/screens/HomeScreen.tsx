import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
// import * as WebBrowser from 'expo-web-browser';
// import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleMenuPress = async (screen: string) => {
    // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screen);
  };

  const openWebsite = async () => {
    // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // await WebBrowser.openBrowserAsync('https://trinck.com');
    console.log('Opening website...');
  };

  const menuItems = [
    {
      id: 'QRGenerator',
      icon: '📱',
      title: 'Generate QR',
      subtitle: 'Create QR codes',
      screen: 'QRGenerator',
    },
    {
      id: 'CameraScanner',
      icon: '📷',
      title: 'Camera Scan',
      subtitle: 'Live QR scanning',
      screen: 'CameraScanner',
    },
  ];

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155', '#1e293b', '#0f172a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Trinck</Text>
            <Text style={styles.subtitle}>QR Code Manager</Text>
          </View>

          {/* Menu Grid */}
          <View style={styles.menuContainer}>
            <View style={styles.menuGrid}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.screen)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                    style={styles.menuItemGradient}
                  >
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Website Link */}
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={openWebsite}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.08)']}
                style={styles.websiteGradient}
              >
                <Text style={styles.websiteIcon}>🌐</Text>
                <Text style={styles.websiteTitle}>Visit Trinck Website</Text>
                <Text style={styles.websiteSubtitle}>Access the full platform</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '400',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  menuItem: {
    width: (width - 60) / 2,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItemGradient: {
    padding: 25,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 35,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  websiteButton: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  websiteGradient: {
    padding: 20,
    alignItems: 'center',
  },
  websiteIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  websiteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: 5,
  },
  websiteSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default HomeScreen;
