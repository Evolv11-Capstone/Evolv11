// screens/LandingScreen.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Modern Nike-inspired landing screen with Evolv11 branding
export default function LandingScreen({ navigation }: any) {
  return (
    <ImageBackground
      source={require('../../../assets/images/Evolv11-kaki.png')}
      style={styles.backgroundImage}
      resizeMode="contain" // Options: 'cover', 'contain', 'stretch', 'repeat', 'center'
    >
      <View style={styles.container}>
        {/* Main Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={{}} // User will add their logo image here
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Navigation Arrow */}
        <TouchableOpacity 
          style={styles.arrowContainer}
          onPress={() => navigation.navigate('About')} // Navigate to About screen
          activeOpacity={0.7}
        >
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={24} color="#ffffff" />
          </View>
          <Text style={styles.arrowText}>Explore</Text>
        </TouchableOpacity>

        {/* Subtle Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Swipe to discover football analytics</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(245, 243, 240, 0.8)', // Semi-transparent overlay
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    paddingBottom: 110, // Extra padding to avoid tab bar
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoImage: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 300,
    maxHeight: 300,
  },
  arrowContainer: {
    alignItems: 'center',
    marginBottom: 60, // Increased margin to avoid tab bar
  },
  arrowCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a4d3a', // Dark green from logo
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  arrowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a4d3a',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20, // Added margin to move text up from tab bar
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontWeight: '400',
    opacity: 0.8,
  },
});
