import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const QRGeneratorScreen: React.FC = () => {
  const [textData, setTextData] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');

  const generateQRCode = () => {
    if (!textData.trim()) {
      Alert.alert('Error', 'Please enter some text to generate QR code');
      return;
    }
    setGeneratedQR(textData.trim());
  };

  const clearQR = () => {
    setGeneratedQR('');
    setTextData('');
  };


  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.title}>Generate QR Code</Text>
            
            {/* Text Input */}
            <View style={styles.formSection}>
              <Text style={styles.label}>Enter Text or URL:</Text>
              <TextInput
                style={styles.textArea}
                value={textData}
                onChangeText={setTextData}
                placeholder="Enter text, URL, or any data"
                placeholderTextColor="rgba(255,255,255,0.6)"
                multiline
              />
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateQRCode}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#dc2626', '#b91c1c']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Generate QR Code</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* QR Code Display */}
            {generatedQR ? (
              <View style={styles.qrContainer}>
                <View style={styles.qrWrapper}>
                  <Text style={styles.qrText}>📱 QR Code Generated!</Text>
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrPlaceholderText}>QR CODE</Text>
                    <Text style={styles.qrDataText}>{generatedQR.length > 50 ? generatedQR.substring(0, 50) + '...' : generatedQR}</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearQR}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#6b7280', '#4b5563']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Clear</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : null}
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginBottom: 8,
  },
  formSection: {
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  generateButton: {
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrWrapper: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    alignItems: 'center',
  },
  qrText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 15,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
    borderStyle: 'dashed',
  },
  qrPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 10,
  },
  qrDataText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  clearButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 120,
  },
});

export default QRGeneratorScreen;
